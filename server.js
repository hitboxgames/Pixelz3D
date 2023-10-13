import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import cors from "cors"
import bodyParser from "body-parser"
import OpenAI from "openai"
import { textToGameRubric } from "./Chat/TextToVideogameRubric.js"
import Replicate from "replicate";
import serveFavicon from 'serve-favicon'

const openai = new OpenAI({
    organization: "org-vGii8WWXPJPEZTCiVzSzsu1X",
    apiKey: "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",
});

const app = express()
const server = createServer(app)
const io = new Server(server, { cors: { origin: "*"}, maxHttpBufferSize: 5e8 })
const port = 3000 || process.env.PORT

app.use(express.static('public'))
app.use(express.json());
app.use(bodyParser.json())
app.use(cors())

app.set('view engine', 'ejs')

//app.use(serveFavicon(__dirname + '/favicon.ico'))

app.get('/create', (req, res) => {
    res.redirect("../?" + uuidv4());
})

//* is used to represent all routes
app.get('/*', async (req, res) => {
    res.render('index')
})

app.post("/3D", async (req, res) => {
    const { prompt } = req.body
    res.json(await make3D(prompt))
})

app.post("/ChatAssist", async (req, res) => {
    const { message } = req.body

    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "user", content: "" + textToGameRubric() },
            { role: "user", content: `${message}` },
        ]
    })

    res.json({
        completion: completion.choices[0].message
    })
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

    socket.on("spawnJSON", (modelSrc, roomVal) => {
        io.to(roomVal).emit("spawnJSON", modelSrc, uuidv4())
    })

    socket.on("spawnSkyBox", (shape, roomVal) => {
        io.to(roomVal).emit("spawnSkyBox", shape)
    })

    socket.on("sendWorldUpdate", (sceneJson, skycolor, roomVal) => {
        io.to(roomVal).emit("sendWorldUpdate", sceneJson, skycolor)
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

async function makeGalactus3D(prompt) {
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

export async function make3D(prompt) {
    const REPLICATE_API_TOKEN = "r8_Q6NzIt6xFFE7QuNkBY5jUrRyNQh6u921dYzS9"

    const replicate = new Replicate({
        auth: REPLICATE_API_TOKEN,
    });

    console.log("Sending request to replicate.")
    const output = await replicate.run(
        "cjwbw/shap-e:5957069d5c509126a73c7cb68abcddbb985aeefa4d318e7c63ec1352ce6da68c",
        {
            input: {
                prompt: prompt,
                save_mesh: true,
            }
        }
    )
    return output
}