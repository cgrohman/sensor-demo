var express    = require("express");
var app        = express();
var http       = require('http').Server(app);
var bodyParser = require("body-parser");
//var gpio       = require("pi-gpio");
var hbs        = require('express-hbs');
var io         = require('socket.io')(http);
var fs         = require('fs');
var path       = require('path');

var spawn      = require('child_process').spawn;
var proc;

var {currentTemp, getCurrentTemp, 
     currentBrightness, getCurrentBrightness} = require('../serial/serial');

app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, 'public')));

app.engine('hbs', hbs.express4({
  partialsDir: __dirname+'/views/partials' 
}));
app.set('view engine', 'hbs');
app.set('views', __dirname+'/views');
  
app.get('/', (req, res)=>{
   var currentYear = new Date().getFullYear();
   var obj =  {
     pageTitle: "Home",
     welcomeParagraph: "This demonstration shows an informative IoT sensor array.",
     currentYear,
   };
   res.render("home.hbs", obj);
});
 
app.get('/about', (req, res)=>{
   var currentYear = new Date().getFullYear();
   res.render("about.hbs", {
     pageTitle: "About Me",
     welcomeParagraph: "Welcome!",
     currentYear
   });
});
 
// app.post("/api/open", function(req, res){
//    var trigger = false;
//    gpio.open(26,"output", function(){
//       console.log("opened and now closing...");
//       gpio.write(26, 1);
//       });
//    res.send("Trying to toggle the LED...");
// });

// app.post("/api/close", function(req, res){
//    gpio.close(26);
//    res.send("Closing gpio");
// });

var sockets = {};
io.on('connection', (socket) => {
  sockets[socket.id] = socket;
  console.log(`Total connected users: ${Object.keys(sockets).length}`);

  socket.on('disconnect', function() {
    delete sockets[socket.id];
    if (Object.keys(sockets).length === 0) {
      app.set('watchingFile', false);
      if (proc) proc.kill();
      fs.unwatchFile('./public/image_stream.jpg');
      console.log('There are 0 connections.');
    }
    console.log(`Total connected users: ${Object.keys(sockets).length}`);
  });

  socket.on('start-stream', function() {
    startStreaming(io);
  });

});

setInterval(()=>{
  io.emit('temp value', getCurrentTemp(0));
  io.emit('brightness', getCurrentBrightness(0))
}, 1000);

http.listen(3000, ()=>{
   console.log("Server listening on 3000");
});

function startStreaming(io) {
  if (app.get('watchingFile')){
    io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
    return;
  }
  var args = ["-w", "640", "-h", "480","-o", "./public/image_stream.jpg", "-t", "999999999", "-tl", "500"];
  proc = spawn('raspistill', args);  

  console.log('watching for changes...');
  app.set('watchingFile', true);
  fs.watchFile('./public/image_stream.jpg', function(current, previous){
    io.sockets.emit('liveStream', 'image_stream.jpg?_t='+ (Math.random() * 100000));
  }) 
}







