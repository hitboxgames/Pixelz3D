const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, { cors: { origin: "*" }})
const port = 3001

app.use(express.static('public'))

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index')
})

server.listen(port, () => {
    console.log("server is running...")
})

io.on("connection", (socket) => {
    console.log("User connected: " + socket.id)
})