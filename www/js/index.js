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

//replace with your own website
const baseurl = 'http://localhost:3456';
//const socket = io(<your website>);

//replace with your suitable topic names 
const SOCKET_TOPIC_IN = 'Intel-Forge-Temperature'; 

 //replace with your test id
 var testdbid = 2912;

var accesstoken = "";
 
$(document).ready( function(){  

    $.get('/api/token',function(tokenResponse) {

        var jsonValue =  JSON.parse(tokenResponse);
        var token  = jsonValue.token.access_token;
        var documentId = jsonValue.urn;
        
        var options = {
            env: 'AutodeskProduction',
            accessToken: token,
            api:'modelDerivativeV2'
         };  
 
        Autodesk.Viewing.Initializer(options, function onInitialized(){
            Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
        });

        /**
        * Autodesk.Viewing.Document.load() success callback.
        * Proceeds with model initialization.
        */
        function onDocumentLoadSuccess(doc) {

            // A document contains references to 3D and 2D viewables.
            var viewables = Autodesk.Viewing.Document.getSubItemsWithProperties(doc.getRootItem(), {'type':'geometry'}, true);
            if (viewables.length === 0) {
                console.error('Document contains no viewables.');
                return;
            }

            // Choose any of the avialble viewables
            var initialViewable = viewables[0];
            var svfUrl = doc.getViewablePath(initialViewable);
            var modelOptions = {
                sharedPropertyDbPath: doc.getPropertyDbPath()
            };

            var viewerDiv = document.getElementById('myViewer');
            viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerDiv);
            viewer.start(svfUrl, modelOptions, onLoadModelSuccess, onLoadModelError);
        }

        /**
         * Autodesk.Viewing.Document.load() failuire callback.
         */
        function onDocumentLoadFailure(viewerErrorCode) {
            console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
        }

        /**
         * viewer.loadModel() success callback.
         * Invoked after the model's SVF has been initially loaded.
         * It may trigger before any geometry has been downloaded and displayed on-screen.
         */
        function onLoadModelSuccess(model) {
            console.log('onLoadModelSuccess()!');
            console.log('Validate model loaded: ' + (viewer.model === model));
            console.log(model);
            
            viewer.addEventListener(
                 Autodesk.Viewing.GEOMETRY_LOADED_EVENT, onGeometryLoaded); 
            
         }

        /**
         * viewer.loadModel() failure callback.
         * Invoked when there's an error fetching the SVF file.
         */
        function onLoadModelError(viewerErrorCode) {
            console.error('onLoadModelError() - errorCode:' + viewerErrorCode);
        }
        
         function onGeometryLoaded(event)
         { 
             
         } 
    }); 
    
    //subscribe the socket data 
    $("#startwebsocket").click(function(res){
        socketio.on('Intel-Forge-Temperature', function (msg) {
            console.log("Data from Intel: " + msg); 

            var msgJson = JSON.parse(msg);
            if(msgJson.sensor_id == 'temperature'){
                if(msgJson.value < 20){
                    viewer.setThemingColor(
                        testdbid, 
                        new THREE.Vector4(0, 1, 1,1)
                    );
               }
               else if(msgJson.value > 20 && msgJson.value<30){
                viewer.setThemingColor(
                    testdbid, 
                    new THREE.Vector4(0, 0.5, 1,1)
                );
               } 
               else
               {
                viewer.setThemingColor(
                    dbid, 
                    new THREE.Vector4(1, 0, 0,1)
                );
               }
            } 
            
        });
    });

    //unsubscribe the socket data 
    $("#endwebsocket").click(function(res){
        socketio.removeAllListeners(SOCKET_TOPIC_IN); 
    }); 

});