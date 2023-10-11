import { createShape } from "./public/modules/Shapes/ObjectBuilder.js"
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import request from 'request'
import axios from 'axios'
import cors from "cors"
import bodyParser from "body-parser"


const app = express()
const server = createServer(app)
const io = new Server(server, { cors: { origin: "*" } })
const port = process.env.PORT || 3000

app.use(express.static('public'))
app.use(express.json());
app.use(bodyParser.json())
app.use(cors())

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
    res.json(await make3D(prompt))
})

app.post("/SkyBox", async (req, res) => {
    const { prompt } = req.body
    res.json(await makeSkyBox(prompt))
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

    socket.on("spawnSkyBox", (shape, roomVal) => {
        io.to(roomVal).emit("spawnSkyBox", shape)
    })

    socket.on("sendWorldUpdate", (scene, skycolor, roomVal) => {
        io.to(roomVal).emit("sendWorldUpdate", scene, skycolor)
    })

    socket.on("deleteObject", (uuid, roomVal) => {
        io.to(roomVal).emit("deleteObject", uuid);
    })

    socket.on("modifiedObject", (modifications, uuid, roomVal) => {
        io.to(roomVal).emit("modifiedObject", modifications, uuid)
    })

    socket.on("modifiedSkyColor", (modifications, roomVal) => {
        io.to(roomVal).emit("modifiedSkyColor", modifications)
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
            return JSON.stringify(response.data);
        })
        .catch((error) => {
            console.log(error);
        });
}

async function makeSkyBox(prompt) {
    let data = JSON.stringify({
        "prompt": "<lora:LatentLabs360:1> a 360 equirectangular image of a " + prompt,
        "negative_prompt": "",
        "steps": 20,
        "width": 1024,
        "height": 512,
        "hr_upscaler": "ESRGAN_4x",
        "samples_index": "Euler a",
        "alwayson_scripts": {
          "Asymmetric tiling": {
            "args": [
              true,
              true,
              false,
              0,
              -1
            ]
          }
        }
      });
      
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://5c8d-2601-584-4101-1260-e141-370d-9cc3-180a.ngrok-free.app/sdapi/v1/txt2img',
        headers: { 
          'api-key': 'horizonc013c840-a554-4f80-8384-ba34bfa3b220', 
          'Content-Type': 'application/json'
        },
        data : data
      };
      
      return axios.request(config)
      .then((response) => {
        //response.data.images[0]
        let imageData = response.data;
        console.log(imageData);
        return imageData;
      })
      .catch((error) => {
        console.log(error);
        return undefined;
      });
}