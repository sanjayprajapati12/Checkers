import io from 'socket.io-client'

const URL = 'https://checkers-server.onrender.com'
// const URL = 'http://localhost:4000/'

const socket = io(URL)

var mySocketId

socket.on("createNewGame", statusUpdate => {
    console.log("A new game has been created! Username: " + statusUpdate.userName + ", Game id: " + statusUpdate.gameId + " Socket id: " + statusUpdate.mySocketId)
    mySocketId = statusUpdate.mySocketId
})

export {
    socket,
    mySocketId
}