// server.js

start()
function start () {
  'use strict'

  const http = require('http')
  const express = require('express')
  const socket_io = require('socket.io')

  const app = express()
  app.use(express.static('public'))

  const server = http.Server(app)
  const io = socket_io(server)

  server.listen(process.env.PORT || 8080)
}
