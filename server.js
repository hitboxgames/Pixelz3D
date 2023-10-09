import { createShape } from "./public/modules/Shapes/ObjectBuilder.js"
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import request from 'request'
import axios from 'axios'


const app = express()
const server = createServer(app)
const io = new Server(server, { cors: { origin: "*" } })
const port = process.env.PORT || 3000

app.use(express.static('public'))
app.use(express.json());

app.set('view engine', 'ejs')


app.get('/welcome', (req, res) => {
    res.render('welcome')
})

//* is used to represent all routes
app.get('/*', (req, res) => {
    res.render('index')
})

app.post("/3D", async (req, res) => {
    const { prompt } = req.body
    res.json(await make3D(req.body.prompt))
})

server.listen(port, () => {
    console.log("server is running...")
})

io.on("connection", (socket) => {
    console.log("1. User connected: " + socket.id)

    socket.on("joinRoom", (room) => {
        if (room == "") room = "Default"
        socket.join(room)
        socket.to(room).emit("newRoomConnection")
        console.log("2. " + socket.id + " is in Room " + room)
    })

    socket.on("spawnObject", (shape, roomVal) => {
        io.to(roomVal).emit("spawnObject", shape, uuidv4())
    })

    socket.on("deleteObject", (uuid, roomVal) => {
        io.to(roomVal).emit("deleteObject", uuid);
    })

    socket.on("modifiedObject", (modifications, uuid, roomVal) => {
        io.to(roomVal).emit("modifiedObject", modifications, uuid)
    })

    socket.on("disableObject", (uuid) => {
        socket.broadcast.emit("disableObject", uuid);
    })

    socket.on("enableObject", (uuid) => {
        socket.broadcast.emit("enableObject", uuid);
    })
})

async function make3D(prompt) {
    let data = JSON.stringify({
        "prompt": "a red car"
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://pixelz.duckdns.org:1337/generate_glb',
        headers: {
            'api-key': 'galactusrgl6a1rGOsInagZcdH3QYuGb6bAZDsimIY2yO9PuTXOpCRZOiaz',
            'Content-Type': 'application/json'
        },
        data: data,
    };

    axios.request(config)
        .then((response) => {
            console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
            console.log(error);
        });
}