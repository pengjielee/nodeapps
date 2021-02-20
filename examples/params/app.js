const express = require('express');
const path = require('path');
const formidable = require('formidable');
const app = express();

const port = 3000;
const uploadDir = path.join(__dirname, './public/uploads');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.text({ type: 'text/plain' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/hello', (req, res) => res.send('Hello World!'));

const blogs = {
  1: {
    content: '真正的的高手，都是杜绝无效社交，屏蔽无效信息，时刻保持清晰的状态。',
  },
  2: {
    content:
      '大多数人在20到30岁就已经过完自己的一生； 一过了这个年龄段，他们就变成自己的影子，以后的生命只是在不断重复自己...',
  },
  3: {
    content:
      'Great minds discuss ideas; average minds discuss events; small minds discuss people.  Eleanor Roosevelt',
  },
  4: {
    content: '一开始做一件事情，就全力以赴。',
  },
};

//获取url中的参数
app.get('/blog/:id', (req, res) => {
  const id = req.params.id;
  console.log(id);
  res.send(id);
});

//获取url中?后的参数
app.get('/blog', (req, res) => {
  const query = req.query;
  console.log(query);
  res.send(query);
});

app.post('/blog', (req, res) => {
  const body = req.body;
  console.log(body);
  res.send(body);
});

app.get('/api/blog/:id', (req, res) => {
  const id = req.params.id;
  const blog = blogs[id] ? blogs[id] : {};
  res.send(blog);
});

app.get('/api/blog', (req, res) => {
  const id = req.query.id;
  const blog = blogs[id] ? blogs[id] : {};
  res.send(blog);
});

//获取post提交的数据
app.post('/api/blog', (req, res) => {
  res.send(req.body);
});

//获取post提交的数据
app.post('/api/user', (req, res, next) => {
  const form = formidable({
    multiples: true,
    keepExtensions: true,
    uploadDir: uploadDir,
  });
  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    res.json({ fields, files });
  });
});

//获取get提交的数据
app.get('/api/userinfo', (req, res, next) => {
  res.send(req.query);
});

app.post('/api/userinfo', (req, res, next) => {
  res.send(req.body);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
