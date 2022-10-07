import express from "express"
import cors from "cors"

import * as http from "http"
import * as socket from "socket.io"

import { join } from "path"

import { Player } from "./socket/player"
import { UUID } from "./socket/utils"

const app = express()
const server = http.createServer(app)
const io = new socket.Server(server, {
  cors: {
    origin: "*",
  }
})

app.use(cors())

app.get("/", (req, res) => {
  res.send("Gameserver for @.zonewarz.com, version 1.0.1.")
})

const sessions:{
  [session:string]: Player
} = {}

io.on('connection', (socket) => {
  socket.on("error", (err) => err)

  socket.on("session", (session?:string) => {
    var player:Player

    //! Retrive session from client
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
    //!

    //! If player leaves window and game
    socket.on("disconnect", () => {
      player.once("end", () => {
        player.ClearPlayer()

        if (session) delete sessions[session]
      })
    }) 
    //! 

    //! Callback to client
    socket.emit("session", session)
    //!
  })
})

server.listen(80, () => {
  console.log("Server listening on http://localhost:80")
})  