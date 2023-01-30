const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const defaultListenPort = 8000;

const fs = require("fs");

const JSONdatafile = "presentationbridge-data.json";

// onbject for ProPresenter, resolume ip and port.
let ip_information_local = {};

const { Client, Message } = require("node-osc");

const WebSocket = require("ws");

//contecting to client (webview)
io.sockets.on("connection", function (socket) {
    socket.on("ip_update", function (ip_information) {
        ip_information_local = ip_information;
        saveFile();
    });

    socket.on("load_request", function () {
        io.emit("data", ip_information_local);
    });

    // request for connecting the nodes
    socket.on("connect_nodes", function () {
        connect_nodes();
    });

    // sending the text to the website.
    socket.on("message", function (msg) {
        io.emit("message", msg);
    });
});

// setting up connection variables
var client = null;
var socket = null;

// opening sockets for connecting to nodes
function connect_nodes() {
    client = new Client(
        ip_information_local.resolumeIP,
        ip_information_local.resolumePORT
    );
    socket = new WebSocket(
        "ws://" +
            ip_information_local.proPresenterIP +
            ":" +
            ip_information_local.proPresenterPORT +
            "/remote"
    );

    socket.onopen = () => {};

    var slide_number = 0;

    lyrics_received();
}

function getItem(presentationSlideGroups, targetItem) {
    let itemCount = 0;
    for (let group = 0; group < presentationSlideGroups.length; group++) {
        const groupSlides = presentationSlideGroups[group].groupSlides;
        for (let slide = 0; slide < groupSlides.length; slide++) {
            if (itemCount === targetItem) return groupSlides[slide];
            itemCount++;
        }
    }
}

var cachedPresentation;

function lyrics_received() {
    socket.onmessage = function (event) {
        var msg = JSON.parse(event.data);

        console.log(msg);

        switch (msg.action) {
            case "presentationCurrent":
                cachedPresentation = msg.presentation;

                break;
            case "presentationTriggerIndex":
                if (
                    !cachedPresentation ||
                    cachedPresentation.presentationPath !== msg.presentationPath
                ) {
                    get_slide();
                } else {
                    var number_of_groups =
                        cachedPresentation.presentationSlideGroups.length;

                    var item = getItem(
                        cachedPresentation.presentationSlideGroups,
                        slide_number
                    );

                    //assigning what the message is to resolume
                    var message = new Message(
                        "/composition/layers/4/clips/2/video/source/textgenerator/text/params/lines"
                    );
                    if (item) {
                        message.append(item.slideText);
                    } else {
                        console.log("Item not found");
                    }

                    // sending the message to resolume
                    try {
                        if (item) {
                            message.append(item.slideText);
                        } else {
                            console.log("Item not found");
                        }
                        client.send(message, (err) => {
                            if (err) {
                                console.error(new Error(err));
                            }
                        });
                    } catch (err) {}
                }
                break;
        }
    };
}

app.get("/config", function (req, res) {
    res.sendFile(__dirname + "/views/config.html");
});

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/views/index.html");
});

function loadFile() {
    //loads settings on first load of app
    try {
        let rawdata = fs.readFileSync(JSONdatafile);
        let myJson = JSON.parse(rawdata);

        ip_information_local = myJson.ip_information;
    } catch (error) {}
}

function saveFile() {
    //saves settings to a local storage file for later recalling
    var myJson = {
        ip_information: ip_information_local,
    };

    console.log(myJson);

    fs.writeFileSync(
        JSONdatafile,
        JSON.stringify(myJson),
        "utf8",
        function (error) {
            if (error) {
                console.log("error: " + error);
            } else {
                console.log("file saved");
            }
        }
    );
}

// Listening to for the client
let listenPort = defaultListenPort;

let cli_listenPort = process.argv[2];

if (parseInt(cli_listenPort) !== "NaN") {
    intPort = parseInt(cli_listenPort);

    if (intPort > 1024 && intPort <= 65535) {
        listenPort = intPort;
    }
}

http.listen(listenPort, function () {
    console.log("listening on *:" + listenPort);
});

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
