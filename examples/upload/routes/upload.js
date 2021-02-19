const express = require('express');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs-extra');
const multer = require('multer');
const router = express.Router();

const uploadDir = path.join(__dirname, '../public/uploads');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    fs.access(path.resolve(uploadDir, file.originalname), err => {
      if (err) {
        cb(null, file.originalname);
      } else {
        const name = path.parse(file.originalname).name;
        const ext = path.parse(file.originalname).ext;
        const timestamp = Date.now();
        const filename = name + '-' + timestamp + '' + ext;
        cb(null, filename);
      }
    });
  },
});
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    file.originalname = file.originalname.toLowerCase();
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      cb(new Error('只能上传png/jpg/jpeg格式图片'), false);
    }
    cb(null, true);
  },
});

const uploadAvatar = upload.single('avatar');
const uploadPhotos = upload.array('photos');
const uploadChunk = multer({ dest: uploadDir }).single('file');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('upload/index', { title: 'Express' });
});

/* 头像上传 GET/POST */
router.get('/upload/avatar', (req, res) => {
  res.render('upload/avatar', { title: '头像上传' });
});
router.post('/upload/avatar', (req, res) => {
  const title = '上传头像';
  uploadAvatar(req, res, function (err) {
    if (err) {
      res.render('upload/avatar', { title: title, message: err });
      return;
    }
    if (req.file) {
      const idx = req.file.path.indexOf('/uploads/');
      const avatar = req.file.path.slice(idx);
      res.render('upload/avatar', { title: title, avatar: avatar });
    } else {
      res.render('upload/avatar', { title: title, message: '请选择一个文件' });
    }
  });
});

/* 多张图片上传 GET/POST */
router.get('/upload/photos', (req, res) => {
  res.render('upload/photos', { title: '多张图片上传' });
});
router.post('/upload/photos', (req, res) => {
  const title = '上传头像';
  uploadPhotos(req, res, function (err) {
    if (err) {
      res.render('upload/photos', { title: title, message: err });
      return;
    }
    if (req.files) {
      const photos = req.files.map(item => {
        const idx = item.path.indexOf('/uploads/');
        item.src = item.path.slice(idx);
        item.name = item.originalname;
        return item;
      });
      res.render('upload/photos', { title: title, photos: photos });
    } else {
      res.render('upload/photos', { title: title, message: '请选择一个文件' });
    }
  });
});

/* Form上传 GET/POST */
router.get('/upload/form', (req, res) => {
  res.render('upload/form', { title: 'Form上传' });
});
router.post('/upload/form', (req, res, next) => {
  const form = formidable({
    multiples: true,
    keepExtensions: true,
    uploadDir: uploadDir,
  });

  // form.parse(req, (err, fields, files) => {
  //   if (err) {
  //     next(err);
  //     return;
  //   }
  //   res.json({ fields, files });
  // });
  form.parse(req, (err, fields, filesMap) => {
    if (err) {
      next(err);
      res.render('upload/result', { title: '上传失败' });
    }
    let files = [];
    if (Array.isArray(filesMap.file)) {
      files = filesMap.file;
    } else {
      files.push(filesMap.file);
    }
    files = files.map(item => {
      const idx = item.path.indexOf('uploads/upload_');
      item.src = item.path.slice(idx);
      item.name = item.name.toLowerCase();
      return item;
    });
    res.render('upload/result', { title: '上传成功', files: files });
  });
});

/* Ajax上传 GET */
router.get('/upload/ajax', (req, res) => {
  res.render('upload/ajax', { title: 'Ajax上传' });
});

/* 拖拽上传 GET */
router.get('/upload/drag', (req, res) => {
  res.render('upload/drag', { title: '拖拽上传' });
});

/* 大文件上传 GET */
router.get('/upload/bigfile', (req, res) => {
  res.render('upload/bigfile', { title: '大文件上传' });
});

router.post('/api/upload', (req, res) => {
  uploadPhotos(req, res, function (err) {
    if (err) {
      res.json({ status: 0, message: '只能上传png/jpg/jpeg格式图片', data: [] });
      return;
    }
    if (req.files && req.files.length > 0) {
      const photos = req.files.map(item => {
        const idx = item.path.indexOf('/uploads/');
        item.src = item.path.slice(idx);
        item.name = item.originalname;
        return item;
      });
      res.json({ status: 1, message: 'ok', data: photos });
    } else {
      res.json({ status: 0, message: '请选择一个文件', data: [] });
    }
  });
});

router.post('/api/chunk/upload', (req, res) => {
  uploadChunk(req, res, function (err) {
    if (err) {
      return;
    }
    const { name, total, index, size, hash } = req.body;
    const chunksPath = path.join(uploadDir, hash, '/');
    if (!fs.existsSync(chunksPath)) {
      fs.mkdirSync(chunksPath);
    }
    fs.renameSync(req.file.path, chunksPath + hash + '-' + index);
    res.status = 200;
    res.end(0);
  });
});

router.post('/api/chunk/merge', (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    let { size, name, total, hash } = fields;
    total = +total;
    const chunksPath = path.join(uploadDir, hash, '/');
    const filePath = path.join(uploadDir, name);
    const chunks = fs.readdirSync(chunksPath);
    // 创建存储文件
    fs.writeFileSync(filePath, '');
    if (chunks.length !== total || chunks.length === 0) {
      res.status = 200;
      res.end('number error');
      return;
    }
    for (let i = 1; i <= total; i++) {
      fs.appendFileSync(filePath, fs.readFileSync(chunksPath + hash + '-' + i));
      fs.unlinkSync(chunksPath + hash + '-' + i);
    }
    fs.rmdirSync(chunksPath);
    res.status = 200;
    res.end('success');
  });
});

module.exports = router;
