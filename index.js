const http = require('http');
const express = require('express');
const pty = require('node-pty');

const os = require('os')

var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

const {Server:wsServer} = require('socket.io');

var ptyProcess = pty.spawn('wsl', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.INIT_CWD,
    env: process.env
  });
  

const app = express();

const server = http.createServer(app);

const io = new wsServer();

io.attach(server);

ptyProcess.onData(data => {
    io.emit('terminal:data', data)
})

io.on('connection' , (socket)=>{
    console.log(socket.id);

    socket.on('terminal:write' , (data)=>{
        ptyProcess.write(data);
    })
})

io.on('disconnect' , ()=>{
    console.log("hoo")
})

server.listen(9000 , ()=> console.log("Server on") )
