/*

The MIT License (MIT)

Copyright (c) Thu Aug 18 2016 Zhong Wu zhong.wu@autodesk.com

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORTOR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

//replace with your suitable topic names 
const  MQTT_TOPIC_IN = 'IntelForge/temperature/data';
const  MQTT_TOPIC_OUT = '<dummy, not use currently>'; 
const  SOCKET_TOPIC_OUT = 'Intel-Forge-Temperature';
const  SOCKET_TOPIC_IN = '<dummy, not use currently>';

//import neccessary libraries 
var favicon = require('serve-favicon');
var express = require('express');
var app = express();  

//routes
var api = require('./routes/token.js'); 
app.use('/', express.static(__dirname + '/www'));
app.use(favicon(__dirname + '/www/img/favicon.ico'));
app.use('/api', api); 
var server = require('http').Server(app); 

//subscribe socket 
var socketio = require('socket.io')(server);  
socketio.on('connection', function(socket){

    console.log('socket on server side is connected');

    //subscribe a message, reserved.
    //socket.on(SOCKET_TOPIC_IN, function(msg){
    //    
    //    console.log('some socket message is hooked : ' + msg );
    //});
}); 
app.io = socketio; 

//subscribe mqtt
var mqtt = require('mqtt');
var mqttclient  = mqtt.connect('mqtt://test.mosquitto.org:1883');
mqttclient.on('connect', function () {

    console.log('mqtt on server side is connected');

    //subscribe a topic of mqtt
    mqttclient.subscribe(MQTT_TOPIC_IN,function(err,granted){
        console.log(granted);
        console.log(err);

        mqttclient.on('message', function (topic, message) {
            // message is Buffer
            var iotdata = message.toString();
            console.log('Intel temperature data: ' + iotdata)

            //broadcast the IoT data to socket
            socketio.emit(SOCKET_TOPIC_OUT , iotdata); 
            //mqttclient.end()
          }) 
     }); 

})  
app.set('port', process.env.PORT || 3456);

server.listen(app.get('port'), function() {
    console.log('Server listening on port ' + server.address().port);
});