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

  let answer = NaN
  io.on('connection', (socket) => {
    const newUser = userList.add(socket.id)
    console.log(userList)  // DELETE LATER
    userList.clients = socket.server.eio.clientsCount
    io.emit('numUsers', userList.clients)
    socket.emit(newUser.action, JSON.stringify(newUser))

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
      io.emit('guess', guess)
      if (guess === answer) {
        let id = NaN
        let index = NaN
        userList.forEach((obj, ind) => {
          if (obj.action === Drawer()) {
            id = obj.id
            index = ind
          }
        })
        userList[index].action = Guesser()
        io.to(id).emit(Guesser(), JSON.stringify(userList[index]))

        newUser.action = Drawer()
        socket.emit('drawer', JSON.stringify(newUser))
      }
    })

    socket.on('answer', (word) => {
      answer = word
    })
  })

  server.listen(process.env.PORT || 8080)

  // Create User Class
  function User (id) {
    this.id = id
    // no  forEach, first user is drawer
    if (userList.hasDrawer()) {
      this.action = Guesser()
    } else {
      this.action = Drawer()
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
      if (obj.action === Drawer()) {
        return true
      } else { return prev }
    }
  }
  userList.disconnect = (id) => {
    const index = userList.indexOf(id)
    if (userList[index].action === Drawer() && userList.length >= 2) {
      console.log('Removing Drawer')
      userList.remove(id)
      userList[0].action = Drawer()
      console.log(io.clients)
      io.to(userList[0].id).emit(userList[0].action,
          JSON.stringify(userList[0]))
    } else {
      console.log('just remove')
      userList.remove(id)
    }
  }
}
