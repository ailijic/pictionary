// server.js

start()
function start () {
  'use strict'

  const http = require('http')
  const express = require('express')
  const socketIO = require('socket.io')

  const app = express()
  app.use(express.static('public'))

  const server = http.Server(app)
  const io = socketIO(server)
  io.on('connection', (socket) => {
    socket.on('draw', (position) => {
      socket.broadcast.emit('draw', position)
    })

    socket.on('guess', (guess) => {
      socket.broadcast.emit('guess', guess)
    })
  })

  server.listen(process.env.PORT || 8080)
}
