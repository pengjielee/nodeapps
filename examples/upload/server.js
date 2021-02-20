var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fs = require('fs-extra');
const multer = require('multer');

var app = express();
const port = 3000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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

const uploadChunk = multer({ dest: uploadDir }).single('file');

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// 上传单个文件
app.post('/api/upload/single', upload.single('file'), (req, res) => {
  res.json(req.file);
});

// 上传多个文件
app.post('/api/upload/more', upload.array('files'), (req, res) => {
  res.json(req.files);
});

// 上传文件切片
app.post('/api/chunk/upload', (req, res) => {
  uploadChunk(req, res, function (err) {
    if (err) {
      return;
    }
    const { name, total, index, size, hash } = req.body;
    //切片保存的目录（以hash值作为唯一目录名）
    const chunksPath = path.join(uploadDir, hash, '/');
    if (!fs.existsSync(chunksPath)) {
      fs.mkdirSync(chunksPath);
    }
    //重命名切片名称（添加切片序号）
    fs.renameSync(req.file.path, chunksPath + hash + '-' + index);
    res.status = 200;
    res.end('1');
  });
});

// 合并文件切片
app.post('/api/chunk/merge', (req, res) => {
  let { size, name, total, hash } = req.body;
  total = +total;
  const chunksPath = path.join(uploadDir, hash, '/');
  const filePath = path.join(uploadDir, name);
  const chunks = fs.readdirSync(chunksPath);
  // 创建存储文件
  fs.writeFileSync(filePath, '');
  if (chunks.length !== total || chunks.length === 0) {
    res.status = 200;
    res.end('chunk number error');
    return;
  }
  for (let i = 1; i <= total; i++) {
    //追加切片内容
    fs.appendFileSync(filePath, fs.readFileSync(chunksPath + hash + '-' + i));
    //删除切片文件
    fs.unlinkSync(chunksPath + hash + '-' + i);
  }
  //删除切片保存目录
  fs.rmdirSync(chunksPath);
  res.status = 200;
  res.end('success');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, () => {
  console.log(`app is listening at http://localhost:${port}`);
});
