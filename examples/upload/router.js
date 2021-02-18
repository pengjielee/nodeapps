const express = require('express');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();

const uploadDir = path.join(__dirname, './public/uploads');

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

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/* 上传头像 get/post */
router.get('/upload/avatar', (req, res) => {
  res.render('upload/avatar', { title: '上传头像' });
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

/* 上传多张图片 get/post */
router.get('/upload/photos', (req, res) => {
  res.render('upload/photos', { title: '上传多张图片' });
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
      console.log(photos);
      res.render('upload/photos', { title: title, photos: photos });
    } else {
      res.render('upload/photos', { title: title, message: '请选择一个文件' });
    }
  });
});

/* 表单上传图片 get/post */
router.get('/upload/form', (req, res) => {
  res.render('upload/form', { title: 'Form上传文件' });
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

module.exports = router;
