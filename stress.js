var os = require('os')
var fs = require('fs')
var cluster = require('cluster')
var io = require('socket.io-client')


if (cluster.isMaster) {
  var max = 7800
  var store = {requests: ~~process.argv[2] || 500, works: {}}
  
  var count = os.cpus().length
  var len = Math.ceil(store.requests / max)
  
  if (len > count) {
    console.error('max: ' + len * max)
    process.exit(0);
  }

  var total = store.requests;
  for(var i = 0; i < len; i++) {
    var work = cluster.fork()
    var requests = total - max > 0 ? max : total
    store.works[work.process.pid] = {id: work.id, requests, state: [0, 0]}
    total -= max

    work.send({store})
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died')
  })
} else {
  var messages = [
    'what a nice day',
    'how\'s everybody?',
    'how\'s it going?',
    'what a lovely socket.io chatroom',
    'to be or not to be, that is the question',
    'Romeo, Romeo! wherefore art thou Romeo?',
    'now is the winter of our discontent.',
    'get thee to a nunnery',
    'a horse! a horse! my kingdom for a horse!'
  ]

  process.on('message', function(msg) {
    if (!msg.store) {
      return
    }
    
    var store = msg.store
    var clientPool = []
    var work = store.works[process.pid]
    var POOL_LIMIT = work.requests
    ;(function next(i){
      if(i == 0){
        // console.log(" pool created")
        return;
      }

      clientPool.push(
        io.connect("http://localhost:3000/", {'force new connection': true, transports: ['websocket']})
        // io.connect("http://193.112.108.69/", {'force new connection': true, transports: ['websocket']})
      )

      next(i - 1)
    })(POOL_LIMIT)

    var tid = setInterval(function() {
      var t1 = clientPool.filter(c => c.connected).length;
      var t2 = clientPool.filter(c => c.disconnected).length;

      if (t1 === POOL_LIMIT) {
        clearInterval(tid);
      }

      // var output = []
      // for(let pid in store.works) {
      //   var w = store.works[pid]
      //   output.push(`work ${w.id}: ${w.state[0]}/${w.state[1]}`)
      // }

      // process.stdout.cursorTo(0)
      // process.stdout.write(output.join(', '))
      // process.stdout.clearLine(1)

      if (work.state[0] !== t1 || work.state[1] !== t2) {
        work.state[0] = t1
        work.state[1] = t2
        console.log(`work ${work.id}: ${work.state[0]}/${work.state[1]}`)
      }
    }, 1000)

    // clientPool.forEach(function(s, i) {
    //   setTimeout(function() {
    //     index = Math.floor(Math.random() * messages.length)
    //     s.emit('chat message', messages[index])
    //     s.disconnect()
    //   }, 130 * i)
    // })
  })

}
