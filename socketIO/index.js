const {ChatModel} = require('../db/models');

module.exports = function (server) {
  // 得到IO对象
  const io = require('socket.io')(server);
  // 监视连接(当有一个客户连接上时回调)
  io.on('connection', function (socket) {
    console.log('soketio connected');

    socket.on('sendMsg', function ({content, from, to}) {
      console.log('sendMessage', {content, from, to});
      const chat_id = [from, to].sort().join("_");
      const create_time = Date.now();
      new ChatModel({content, from, to, chat_id, create_time}).save(function (error, chatMsg) {
        io.emit('receiveMsg', chatMsg);
        console.log('sendMessage', chatMsg);

      })
    })

  })
};