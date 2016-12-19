// public/main.js
/* global $, io */

start()
function start () {
  'use strict'

  $(document).ready(() => { pictionary() })
  function pictionary () {
    const socket = io()
    const canvas = $('canvas')
    const context = canvas[0].getContext('2d')
    canvas[0].width = canvas[0].offsetWidth
    canvas[0].height = canvas[0].offsetHeight

    let numUsers = 0
    let userElement = template`<div class = 'numUsers'> 
                        Users Connected: ${0}
                        </div>`
    $('#users').prepend(userElement(numUsers))

    // Local Events
    let drawing = false
    $(window).on('mousedown', () => {
      drawing = true
    })
    $(window).on('mouseup', () => {
      drawing = false
    })
    canvas.on('mousemove', (event) => {
      if (drawing && user.action === 'drawer') {
        const offset = canvas.offset()
        const position = {
          x: event.pageX - offset.left,
          y: event.pageY - offset.top
        }
        draw(position)

        socket.emit('draw', position)
      }
    })

    // Server Events
    var user = {}
    socket.on('numUsers', (numUsers) => {
      $('div.numUsers').replaceWith(userElement(numUsers))
    })

    socket.on('guesser', (jsonObj) => {
      $('#draw').remove()
      user = JSON.parse(jsonObj)
      $('#guess').show('fast')
      console.log(user)
    })

    socket.on('drawer', (jsonObj) => {
      $('#guess').hide('fast')
      user = JSON.parse(jsonObj)
      console.log(user)
      const index = getRandomIndex(WORDS().length)
      const word = WORDS()[index]
      $('h1').after(`<div id="draw"> Draw: ${word} </div>`)
      socket.emit('answer', word)
    })

    socket.on('guess', (guess) => {
      $('#guessList').append(`<li>${guess}</li>`)
    })

    socket.on('draw', (position) => {
      draw(position)
    })

    function draw (position) {
      context.beginPath()
      context.arc(position.x, position.y, 6, 0, 2 * Math.PI)
      context.fill()
    }

    // Guessing Logic
    $('#top-message').prepend(
      `<div id = "guess">
          Make a guess: <input type = "text">
      </div>`)
    const guessBox = $('#guess input')
    const onKeyDown = (event) => {
      if (event.keyCode !== 13) { // Enter: key code 13
        return
      }
      console.log(guessBox.val())
      let emitString = guessBox.val().toLowerCase()
      if (!(WORDS().includes(emitString))) {
        emitString = `${emitString} (Word not in List)`
      }
      socket.emit('guess', emitString)
      return emitString
    }
    guessBox.on('keydown', onKeyDown)

    function template (strings, ...keys) {
      return function (...values) {
        var dict = values[values.length - 1] || {}
        var result = [strings[0]]
        keys.forEach(function (key, i) {
          var value = Number.isInteger(key) ? values[key] : dict[key]
          result.push(value, strings[i + 1])
        })
        return result.join('')
      }
    }

    function WORDS () {
      return ['word', 'letter', 'number', 'person', 'pen', 'class', 'people', 'sound', 'water', 'side', 'place', 'man', 'men', 'woman', 'women', 'boy', 'girl', 'year', 'day', 'week', 'month', 'name', 'sentence', 'line', 'air', 'land', 'home', 'hand', 'house', 'picture', 'animal', 'mother', 'father', 'brother', 'sister', 'world', 'head', 'page', 'country', 'question', 'answer', 'school', 'plant', 'food', 'sun', 'state', 'eye', 'city', 'tree', 'farm', 'story', 'sea', 'night', 'day', 'life', 'north', 'south', 'east', 'west', 'child', 'children', 'example', 'paper', 'music', 'river', 'car', 'foot', 'feet', 'book', 'science', 'room', 'friend', 'idea', 'fish', 'mountain', 'horse', 'watch', 'color', 'face', 'wood', 'list', 'bird', 'body', 'dog', 'family', 'song', 'door', 'product', 'wind', 'ship', 'area', 'rock', 'order', 'fire', 'problem', 'piece', 'top', 'bottom', 'king', 'space']
    }
    function getRandomIndex (length) {
      return Math.floor(Math.random() * length)
    }
  }
}
