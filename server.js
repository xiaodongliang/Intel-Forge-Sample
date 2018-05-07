
var favicon = require('serve-favicon');

var express = require('express');
var app = express();  

var api = require('./routes/token.js'); 
app.use('/', express.static(__dirname + '/www'));
app.use(favicon(__dirname + '/www/img/favicon.ico'));
app.use('/api', api); 

var server = require('http').Server(app); 

//subscribe socket 
var socketio = require('socket.io')(server);  
socketio.on('connection', function(socket){

    console.log('socket connected');

    socket.on('Intel-Forge-TempHum', function(msg){
            console.log('broadcast IoT data : ' + msg );
    });
}); 
app.io = socketio; 

//subscribe mqtt of Alicloud
var mqtt = require('mqtt');

var host = '<Ali Cloud MQ Host>';
var username ='<Ali Cloud MQ username>';
var password='<Ali Cloud MQ password>'; 
var clientId=groupId+'@@@AutodeskForgeDevice';//GroupId@@@DeviceId
var topic = 'adsk_forge_iot';

var options = {
    port: port,
    clientId: clientId,
    username: username,
    password: password,
    };
var mqttclient  = mqtt.connect(host,options);
mqttclient.on('connect', function () {

    mqttclient.subscribe('adsk_forge_iot',function(err,granted){
        console.log(granted);
        console.log(err);

        mqttclient.on('message', function (topic, message) {
            // message is Buffer
            var iotdata = message.toString();
            console.log('Intel temperature data: ' + iotdata)
            socketio.emit('Intel-Forge-Temperature' , iotdata); 
          }) 
     }); 

})  
app.set('port', process.env.PORT || 3456);

server.listen(app.get('port'), function() {
    console.log('Server listening on port ' + server.address().port);
});