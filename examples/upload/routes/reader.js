const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', function (req, res, next) {
  res.render('reader/index', { title: 'Express' });
});

module.exports = router;
