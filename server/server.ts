import express from "express";
import * as http from "http-server"
import {join} from "path"

const app = express()
const server = http.createServer(app)

server.listen(3000, () => {
  console.log('Server listening on *:3000');
})  