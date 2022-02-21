var express = require('express');
const io = require('socket.io');
const { Client, Message } = require('node-osc');

const WebSocket = require('ws');

const app = express()
const port = 3000

// setting up osc
const client = new Client('192.168.86.25', 7000);

app.get('/', (req, res) => {
    res.statusCode = 200;
    res.sendFile(__dirname + '/views/index.html');
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

const socket = new WebSocket("ws://192.168.86.25:4444/remote");

socket.onopen = () => {
};

var slide_number = 0;

socket.onmessage = function (event) {
    var msg = JSON.parse(event.data);
    // console.log(msg);
    
    switch (msg.action) {
        case "presentationCurrent":
            console.log(slide_number);
            x = msg.presentation.presentationSlideGroups[0].groupSlides[slide_number].slideText;
            // document.getElementById("slide_text").innerHTML = x;

            // assigning what the message is to resolume
            var message = new Message('/composition/layers/4/clips/1/video/source/textgenerator/text/params/lines');
            message.append(x);

            // sending the message to resolume
            client.send(message, (err) => {
                if (err) {
                    console.error(new Error(err));
                }
            });

            console.log(x);
            break;
        case "presentationTriggerIndex":
            slide_number = msg.slideIndex;
            // console.log(slide_number);
            get_slide();
            break;
    }
};

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