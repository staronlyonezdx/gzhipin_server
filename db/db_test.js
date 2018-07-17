/*1. 连接数据库*/
// 1.1. 引入mongoose
const mongoose = require("mongoose");
// 1.2. 连接指定数据库(URL只有数据库是变化的)
mongoose.connect("mongodb://localhost:27017/gzhipin_test");
// 1.3. 获取连接对象
const connection = mongoose.connection;
// 1.4. 绑定连接完成的监听(用来提示连接成功)
connection.on("connected", function () {
  console.log("数据库链接成功");
});
/*2. 得到对应特定集合的Model*/
// 2.1. 字义Schema(描述文档结构)
const userSchame = mongoose.Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  type: {type: String}
});
// 2.2. 定义Model(与集合对应, 可以操作集合)
const UserModel = mongoose.model("users", userSchame);
/*3. 通过Model或其实例对集合数据进行CRUD操作*/

// 3.1. 通过Model实例的save()添加数据
function testSave() {
  const user = {username: "Tom", password: "123"};
  const userModel = new UserModel(user);
  userModel.save(function (error, user) {
    console.log("save", error, user);
  })
}

// testSave();
// 3.2. 通过Model的find()/findOne()查询多个或一个数据
function testFind() {
  UserModel.findOne({_id: "5b4d8cea89aa210cc893679f"}, function (error, user) {
    console.log("findOne", error, user);
  });
  UserModel.find({}, function (error, users) {
    console.log("find", error, users);
  })
}

// testFind();
// 3.3. 通过Model的findByIdAndUpdate()更新某个数据
function testUpdate() {
  UserModel.findByIdAndUpdate({_id: "5b4d8cea89aa210cc893679f"}, {password: "321"}, function (error, oldUser) {
    console.log("update", error, oldUser);
  })
}

// testUpdate();
// 3.4. 通过Model的remove()删除匹配的数据
function remove() {
  UserModel.remove({_id: "5b4d8cea89aa210cc893679f"}, function (error, data) {
    console.log("remove", error, data);
  })
}
remove();

