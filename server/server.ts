import express from "express";
import * as http from "http-server"
import { Server } from "socket.io"
import {join} from "path"

import { Connection } from "./player"
import { ShrinkGameZoneInterval } from "./game"

const app = express()
const server = http.createServer(app)
const io = new Server(server)

ShrinkGameZoneInterval()

io.on('connection', (socket) => {
  new Connection(socket)
})

server.listen(3000, () => {
  console.log("Server listening on *:3000")
})  