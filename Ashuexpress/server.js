const mongo = require('mongodb').MongoClient;
const socketIo = require('socket.io').listen(4000).sockets;

//to connect to mongo
mongo.connect('mongodb://127.0.0.1/mongoDatabase', function(err, db){
  if(err){
    throw err;
  }
  console.log('mongodb connected')
  //connecting socketio
  socketIo.on('connection', function(){
    let mongoCollection =  db.collection('mongoCollection');

    sendStatus = function(myStatus){
      socket.emit('myStatus', myStatus)
    }
    //fetch collections from mongo
    mongoCollection.find().limit(100).sort({_id:1}).toArray(function(err, res){
      if(err){
        throw err;
      }
      socket.emit('output', res);
    })
    //handle input(data) coming from clients
    socket.on('input', function(data){
      let name: data.name;
      let message: data.message;
      if(name == "" || message == ""){
        sendStatus('please insert message')
      } else {
        mongoCollection.insert({name: name, message: message}, function(){
          socketIo.emit('output', [data]);
          sendStatus({
            message: 'message sent';
            clear: true
          })
        })
      }
    })
    //reset button to delete from the database
    socket.on('clear', function(data){
      mongoCollection.remove({},function(){
        socket.emit('cleared')
      })
    })
  })
})