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
    const newUser = userList.add(socket.id)
    console.log(userList)  // DELETE LATER
    userList.clients = socket.server.eio.clientsCount
    io.emit('numUsers', userList.clients)
    socket.emit(newUser.action(), newUser.action())

    socket.on('disconnect', () => {
      userList.clients = socket.server.eio.clientsCount
      io.emit('numUsers', userList.clients)
      userList.disconnect(socket.id)
      console.log(userList)  // DELETE LATER
    })

    socket.on('draw', (position) => {
      socket.broadcast.emit('draw', position)
    })

    socket.on('guess', (guess) => {
      socket.broadcast.emit('guess', guess)
    })
  })

  server.listen(process.env.PORT || 8080)

  // Create User Class
  function User (id) {
    this.id = id
    if (userList.hasDrawer()) {
      this.action = Guesser
    } else {
      this.action = Drawer
    }
  }
  function Drawer () {
    return 'drawer'
  }
  function Guesser () {
    return 'guesser'
  }
  var userList = []
  userList.clients = 0
  userList.add = (id) => {
    const newUser = new User(id)
    userList.push(newUser)
    return newUser
  }
  userList.remove = (id) => { userList.splice(userList.indexOf(id), 1) }
  userList.indexOf = (id) => {
    return userList.reduce(ifId, NaN)
    function ifId (prev, obj, index) {
      if (obj.id === id) {
        return index
      } else { return prev }
    }
  }
  userList.hasDrawer = () => {
    return userList.reduce(hasDrawer, false)
    function hasDrawer (prev, obj) {
      if (obj.action === Drawer) {
        return true
      } else { return prev }
    }
  }
  userList.disconnect = (id) => {
    const index = userList.indexOf(id)
    if (userList[index].action === Drawer && userList.length >= 2) {
      userList.remove(id)
      userList[0].action = Drawer
    } else {
      userList.remove(id)
    }
  }
}
