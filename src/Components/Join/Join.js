import React, { useEffect } from 'react'
import {useNavigate } from 'react-router-dom';
import './Join.css'
import { useState } from 'react'; 
import {socket} from '../Helper/Socket.js'
import makeid from '../Helper/makeid.js'

function Join() {
    const navigate = useNavigate();
    const [gameId , setGameId]  = useState("");
    const [room , setRoom] = useState("")
    
    const changeRoom = (e)=>{
        setRoom(e.target.value)
    }
    
    const handleCreate = () =>{
        console.log("creating..............")
        const newGameRoomId = makeid(6);
        console.log(gameId);
        console.log(newGameRoomId);
        console.log(socket);
        socket.emit("createNewGame", newGameRoomId)
        setGameId(newGameRoomId)
    }

    useEffect(()=>{
        if(gameId){
            navigate(`/online/game/${gameId}`)
            // window.location.href = `online/game/${gameId}`;
        }
    },[gameId])
    
    
    const handleJoin = () =>{
        if(room){
            navigate(`/online/game/${room}`)
            // window.location.href = `online/game/${room}`;
        }
    }

    return (
        <div className='JoinPage'>
            <div className='JoinContainer'> 
                <h1>Join online</h1>
                <button onClick={handleCreate} className='create-btn'> Create Room </button>
                <input onChange={changeRoom} className="joinInput" placeholder="Enter Room name" type="text" id='myname'></input>
                <button onClick={handleJoin} className='join-btn'> Join Room </button>
            </div>
        </div>
    )
}

export default Join;