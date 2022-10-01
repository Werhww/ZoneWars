import express from "express"
import * as http from "http"
import * as socket from "socket.io"

import {join} from "path"

import { GameConnection } from "./game/player"
import { ShrinkGameZoneInterval } from "./game/game"

const app = express()
const server = http.createServer(app);
const io = new socket.Server(server);

app.use(express.static(join(__dirname, "client-test")))

io.on('connection', (socket) => {
  new GameConnection(socket)
})

server.listen(3000, () => {
  ShrinkGameZoneInterval()
  console.log("Server listening on http://localhost:3000")
})  