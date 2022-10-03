import express from "express"
import * as http from "http"
import * as socket from "socket.io"

import {join} from "path"

import { Player } from "./socket/player"
import { UUID } from "./socket/utils"

const app = express()
const server = http.createServer(app);
const io = new socket.Server(server);

app.use(express.static(join(__dirname, "client-test")))

const sessions:{
  [session:string]: Player
} = {}

io.on('connection', (socket) => {
  socket.on("session", (session) => {
    console.log(session)
    var player:Player

    const listener = () => {
      console.log("aha")
      player.once("end", () => {
        player.ClearPlayer()
        console.log("asasaasasasaha")

        delete session[session]
      })
    }

    if (!session || !sessions[session]) {
      session = UUID(false)

      player = new Player(socket)

      sessions[session] = player
    } else {
      player = sessions[session]
      player.ReplaceSocket(socket)
      
      player.removeAllListeners("end")
      socket.emit("GameJoin")
    }

    
    socket.on("disconnect", listener)  
    socket.emit("session", session)
  })
})

server.listen(3000, () => {
  console.log("Server listening on http://localhost:3000")
})  