const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const defaultListenPort = 80;

const fs = require("fs");

const JSONdatafile = "presentationbridge-data.json";

// vaiables for ProPresenter, resolume ip and port.
var proPresenter_ip;
var proPresenter_port;
var resolume_ip;
var resolume_port;


// const { Client, Message } = require('node-osc');

const WebSocket = require('ws');

//contecting to client (webview)
io.sockets.on("connection", function(socket) {

    socket.on("config_test", function(test_info) {
        proPresenter_ip = test_info[0];
        proPresenter_port = test_info[1];
        resolume_ip = test_info[2];
        resolume_port = test_info[3];
        saveFile();
    })

});


// setting up osc
// const client = new Client('192.168.86.25', 7000);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

let listenPort = defaultListenPort;

let cli_listenPort = process.argv[2];

if (parseInt(cli_listenPort) !== 'NaN')
{
    intPort = parseInt(cli_listenPort);
    
    if ((intPort > 1024) && (intPort <= 65535))
    {
        listenPort = intPort;
    }
}

http.listen(listenPort, function () {
    console.log("listening on *:" + listenPort);
});



function loadFile() //loads settings on first load of app
{   
    try
    {
        let rawdata = fs.readFileSync(JSONdatafile); 
        let myJson = JSON.parse(rawdata); 

        proPresenter_ip = myJson.proPresenter_ip;
        proPresenter_port = myJson.proPresenter_port;
        resolume_ip = myJson.resolume_ip;
        resolume_port = myJson.resolume_port;
    }
    catch (error)
    {
        
    }
}

function saveFile() //saves settings to a local storage file for later recalling
{
    var myJson = {
        proPresenter_ip: proPresenter_ip,
        proPresenter_port: proPresenter_port,
        resolume_ip: resolume_ip,
        resolume_port: resolume_port
    };

    console.log(myJson);

    fs.writeFileSync(JSONdatafile, JSON.stringify(myJson), "utf8", function(error) {
        if (error)
        { 
          console.log('error: ' + error);
        }
        else
        {
          console.log('file saved');
        }
    });
}



// LISTIENING FOR PROPRESENTER

// const socket = new WebSocket("ws://192.168.86.25:4444/remote");

// socket.onopen = () => {
// };

// var slide_number = 0;

// socket.onmessage = function (event) {
//     var msg = JSON.parse(event.data);
//     // console.log(msg);
    
//     switch (msg.action) {
//         case "presentationCurrent":
//             console.log(slide_number);
//             x = msg.presentation.presentationSlideGroups[0].groupSlides[slide_number].slideText;
//             // document.getElementById("slide_text").innerHTML = x;

//             // assigning what the message is to resolume
//             var message = new Message('/composition/layers/4/clips/1/video/source/textgenerator/text/params/lines');
//             message.append(x);

//             // sending the message to resolume
//             client.send(message, (err) => {
//                 if (err) {
//                     console.error(new Error(err));
//                 }
//             });

//             console.log(x);
//             break;
//         case "presentationTriggerIndex":
//             slide_number = msg.slideIndex;
//             // console.log(slide_number);
//             get_slide();
//             break;
//     }
// };

// // Check if the webscocket is connected
// function check_socket() {
//     if (!socket) return err("SOCKET NOT CONNECTED");
//     if (socket.readyState != 1) return err("SOCKET NOT READY");
//     return true;
// }

// function emit(obj) {
//     var json = JSON.stringify(obj);
//     if (check_socket()) socket.send(json);
//     else return err("SOCKET EMIT FAILED");
// }

// function get_slide() {
//     emit({ action: "presentationCurrent" });
// }