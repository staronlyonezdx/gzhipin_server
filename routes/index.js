var express = require('express');
var router = express.Router();
const md5 = require('blueimp-md5');
var {UserModel} = require("../db/models");


/*router.post("/register", function (req, res, next) {
  const {username, password} = req.body;
  if (username === "admin") {
    res.send({code: 1, msg: "用户已经存在,请重新输入"});
  } else {
    res.send({code: 0, data: {_id: "111", username, password}});
  }

});*/
//注册路由
router.post("/register", function (req, res, next) {
  //获取请求参数
  const {username, password, type} = req.body;
  // res.setHeader('Access-Control-Allow-Origin','http://localhost:3000')
  //处理参数
  // 根据username查询数据库, 看是否已存在user
  UserModel.findOne({username}, function (error, user) {
    if (user) {
      //该用户名已经存在,返回响应
      res.send({
        code: 1,
        msg: '此用户已存在'
      })
    } else {
      //该用户名不存在,保存数据都数据库,并返回响应
      new UserModel({username, password: md5(password), type}).save(function (error, user) {
        //注册成功等于直接登陆成功
        //添加cookie,一周免登陆
        res.cookie("userid", user._id, {maxAge: 1000 * 60 * 60 * 24 * 7});
        res.send({
          code: 0,
          data: {username, type, _id: user._id}
        })
      })
    }
  })

});
//登陆路由
router.post("/login", function (req, res, next) {
  //获取请求参数数据
  const {username, password} = req.body;
  //处理数据
  //在数据库中查找数据
  UserModel.findOne({username, password: md5(password)}, {password: 0, _v: 0}, function (error, user) {
    //如果数据存在,返回响应
    if (user) {
      //添加cookie,一周免登陆
      res.cookie("userid", user._id, {maxAge: 1000 * 60 * 60 * 24 * 7});
      res.send({
        code: 0,
        data: user  // user中没有pwd
      })
    } else {
      //数据库中不存在该数据,返回响应
      res.send({
        code: 1,
        msg: "用户名或者密码错误"
      })
    }
  })
});
//更新用户路由
router.post('/update', function (req, res, next) {
  const userid = req.cookies.userid;
  if (!userid) {//说明没有登陆过,提示重新登陆
    return res.send({code: 1, msg: "请先登陆"});
  }
  //登陆过,更新数据库中的数据
  UserModel.findByIdAndUpdate({_id: userid}, req.body, function (error, oldUser) {
    const {_id, username, type} = oldUser;
    const data = Object.assign(req.body, {_id, username, type});
    res.send({code: 0, data});
  })
});


module.exports = router;
