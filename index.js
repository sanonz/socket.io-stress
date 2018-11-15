var mongodb = require('mongodb');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var pidusage = require('pidusage');
var port = process.env.PORT || 3000;



var db, collection, system;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg) {
    if (!collection) {
      // connect to mongodb
      var url = 'mongodb://admin:test@47.75.90.232:27017/?authSource=test';
      mongodb.MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
        if (err) {
          console.log(err);

          return;
        }

        db = client.db('test');
        collection = db.collection('kline');

        collection.find({}, {limit: 10}).toArray((err, docs) => {
          io.emit('chat message', docs);
        });
      });
    } else {
      collection.find({}, {limit: 10}).toArray((err, docs) => {
        io.emit('chat message', docs);
      });
    }
  });

  if (!system) {
    emitUsage();
    system = true;
  }
});

http.listen(port, '127.0.0.1', function(){
  console.log('listening on *:' + port);
});

function emitUsage() {
  pidusage(process.pid, function (err, stats) {
    if (err) {
      console.log(err);

      return;
    }

    var info = {...stats};
    info.sockets = io.engine.clientsCount;

    io.emit('system', info);

    setTimeout(emitUsage, 1000);
  });
}
