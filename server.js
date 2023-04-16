import { createShape } from "./public/modules/Shapes/ObjectBuilder.js"
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { v4 as uuidv4 } from 'uuid';


const app = express()
const server = createServer(app)
const io = new Server(server, { cors: { origin: "*" }})
const port = 3001

app.use(express.static('public'))

app.set('view engine', 'ejs')


app.get('/welcome', (req, res) => {
    res.render('welcome')
})

//* is used to represent all routes
app.get('/*', (req, res) => {
    res.render('index')
})

server.listen(port, () => {
    console.log("server is running...")
})

io.on("connection", (socket) => {
    console.log("1. User connected: " + socket.id)

    socket.on("joinRoom", (room) => {
        if(room == "") room = "Default"
        socket.join(room)
        socket.to(room).emit("newRoomConnection")
        console.log("2. " + socket.id + " is in Room " + room)  
    })

    socket.on("spawnObject", (shape , roomVal) => {
        io.to(roomVal).emit("spawnObject", shape, uuidv4())
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

