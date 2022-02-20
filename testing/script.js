var socket;
var host = "10.0.5.104";
var port = "4444";
var slide_number = 0;
var pesentation_name;


// Check for errors with the webscocket
function err(s) {
    console.log(s);
    return false;
}

// Check if the webscocket is connected
function check_socket() {
    if (!socket) return err("SOCKET NOT CONNECTED");
    if (socket.readyState != 1) return err("SOCKET NOT READY");
    return true;
}

// Setting up the connection to the websocket
function setup() {
    connect();
    listen();
}


// Websocket settings
function connect() {
    socket = new WebSocket(`ws://${host}:${port}/remote`);
    listen();
}

function listen() {
    socket.onmessage = function (event) {
        var msg = JSON.parse(event.data);
        console.log(msg);
        
        switch (msg.action) {
            case "presentationCurrent":
                console.log(slide_number);
                x = msg.presentation.presentationSlideGroups[0].groupSlides[slide_number].slideText;
                document.getElementById("slide_text").innerHTML = x;
                break;
            case "presentationTriggerIndex":
                slide_number = msg.slideIndex;
                console.log(slide_number);
                get_slide();
                break;
        }
    };
}

function emit(obj) {
    var json = JSON.stringify(obj);
    if (check_socket()) socket.send(json);
    else return err("SOCKET EMIT FAILED");
}

function get_slide() {
    emit({ action: "presentationCurrent" });
}

setup();
