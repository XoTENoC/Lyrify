const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const defaultListenPort = 80;

const fs = require("fs");

const JSONdatafile = "presentationbridge-data.json";

// onbject for ProPresenter, resolume ip and port.
let ip_information_local = {}


const { Client, Message } = require('node-osc');

const WebSocket = require('ws');

//contecting to client (webview)
io.sockets.on("connection", function(socket) {

    socket.on("ip_update", function(ip_information) {

        ip_information_local = ip_information;
        saveFile();
        
    })

    socket.on("load_request", function() {
        io.emit("data", ip_information_local);
    })

    // request for connecting the nodes
    socket.on("connect_nodes", function() {
        connect_nodes();
    });

});


// setting up connection variables
var client = null;
var socket = null;

// opening sockets for connecting to nodes
function connect_nodes() {
    client = new Client(ip_information_local.resolumeIP, ip_information_local.resolumePORT);
    socket = new WebSocket("ws://"+ ip_information_local.proPresenterIP +":" + ip_information_local.proPresenterPORT + "/remote");

    console.log("connecting");

    socket.onopen = () => {
    };

    var slide_number = 0;

    lyrics_received()
}

function lyrics_received(){
    socket.onmessage = function (event) {
        var msg = JSON.parse(event.data);
        // console.log(msg);
        
        switch (msg.action) {
            case "presentationCurrent":

                var presentationSlideGroups_num = 0;
                var groupSlides = 0;

                for(let i = 0; i < slide_number; i++){
                    slideGroupObjects = msg.presentation.presentationSlideGroups[presentationSlideGroups_num];
                }

                x = msg.presentation.presentationSlideGroups[0].groupSlides;
                console.log(x.length);

                
                // x = msg.presentation.presentationSlideGroups[0].groupSlides[slide_number].slideText;
                // document.getElementById("slide_text").innerHTML = x;

                // var one_line = x.replace(/(\r\n|\n|\r)/gm,' ');

                // console.log(one_line);

                // assigning what the message is to resolume
                // var message = new Message('/composition/layers/4/clips/1/video/source/textgenerator/text/params/lines');
    
                // sending the message to resolume
                // try{
                //     message.append(one_line);
                //     client.send(message, (err) => {
                //         if (err) {
                //             console.error(new Error(err));
                //         }
                //     });
                // }
                // catch(err){

                // }
                break;
            case "presentationTriggerIndex":
                slide_number = msg.slideIndex;
                // console.log(slide_number);
                get_slide();
                break;
        }
    };
}


app.get('/config', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
})


function loadFile() //loads settings on first load of app
{   
    try
    {
        let rawdata = fs.readFileSync(JSONdatafile); 
        let myJson = JSON.parse(rawdata); 

        ip_information_local = myJson.ip_information;
    }
    catch (error)
    {
        
    }
}

function saveFile() //saves settings to a local storage file for later recalling
{
    var myJson = {
        ip_information: ip_information_local
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

// Listening to for the client

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

// Check if the webscocket is connected
function check_socket() {
    if (!socket) return err("SOCKET NOT CONNECTED");
    if (socket.readyState != 1) return err("SOCKET NOT READY");
    return true;
}

function emit(obj) {
    var json = JSON.stringify(obj);
    if (check_socket()) socket.send(json);
    else return err("SOCKET EMIT FAILED");
}

function get_slide() {
    emit({ action: "presentationCurrent" });
}

loadFile();