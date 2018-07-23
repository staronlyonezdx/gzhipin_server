var express = require('express');
var router = express.Router();
const md5 = require('blueimp-md5');
var {UserModel, ChatModel} = require("../db/models");


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

// 根据cookie获取对应的user
router.get('/user', function (req, res) {
  // 取出cookie中的userid
  const userid = req.cookies.userid;
  if (!userid) {
    return res.send({code: 1, msg: '请先登陆'})
  }

  // 查询对应的user
  UserModel.findOne({_id: userid}, {password: 0, _v: 0}, function (err, user) {
    return res.send({code: 0, data: user})
  })
});

/*
查看用户列表
 */
router.get('/list', function (req, res) {
  const {type} = req.query
  UserModel.find({type}, function (err, users) {
    return res.json({code: 0, data: users})
  })
});

/*
获取当前用户所有相关聊天信息列表
 */
router.get('/msglist', function (req, res) {
  // 获取cookie中的userid
  const userid = req.cookies.userid;
  // 查询得到所有user文档数组
  UserModel.find(function (err, userDocs) {
    // 用对象存储所有user信息: key为user的_id, val为name和header组成的user对象
    const users = {};// 对象容器
    userDocs.forEach(doc => {
      users[doc._id] = {username: doc.username, header: doc.header}
    });
    /*
    查询userid相关的所有聊天信息
     参数1: 查询条件
     参数2: 过滤条件
     参数3: 回调函数
    */
    ChatModel.find({'$or': [{from: userid}, {to: userid}]}, function (err, chatMsgs) {
      // 返回包含所有用户和当前用户相关的所有聊天消息的数据
      res.send({code: 0, data: {users, chatMsgs}});
    })
  })
});

/*
修改指定消息为已读
 */
router.post('/readmsg', function (req, res) {
  // 得到请求中的from和to
  const from = req.body.from;
  const to = req.cookies.userid;
  /*
  更新数据库中的chat数据
  参数1: 查询条件
  参数2: 更新为指定的数据对象
  参数3: 是否1次更新多条, 默认只更新一条
  参数4: 更新完成的回调函数
   */
  ChatModel.update({from, to, read: false}, {read: true}, {multi: true}, function (err, doc) {
    console.log('/readmsg', doc);
    res.send({code: 0, data: doc.nModified}) // 更新的数量
  })
});


module.exports = router;
