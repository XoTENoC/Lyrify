var express = require('express');
const WebSocket = require('ws');

const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.statusCode = 200;
    res.sendFile(__dirname + '/views/index.html');
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

const socket = new WebSocket("ws://10.0.5.104:4444/remote");

socket.onopen = () => {
};

socket.onmessage = (data) => {
  console.log(data);
};