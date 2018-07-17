var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {title: 'Express'});
});

router.post("/register", function (req, res, next) {
  const {username, password} = req.body;
  if (username === "admin") {
    res.send({code: 1, msg: "用户已经存在,请重新输入"});
  } else {
    res.send({code: 0, data: {_id: "111", username, password}});
  }

});

module.exports = router;
