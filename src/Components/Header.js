import './Header.css'
import { useParams } from 'react-router-dom'
import {socket} from './Helper/Socket'
import { useEffect, useState } from 'react';
import OnlineBoard from './OnlineBoard/OnlineBoard';
import Waiting from './Waiting/Waiting';
import useCustom from './CustomHooks/useCustom';

const Header = () => {
  const {gameId} = useParams();
  const error = useCustom('');
  const start = useCustom(false);
  const player = useCustom('#');
  
  socket.on("setPlayer" , (e)=>{
    player.set(e);
  })

  socket.on("startgame" , ()=>{
      start.set(true);
  })

  useEffect(()=>{
    if(start.get()===false){
      console.log("gameid : ",gameId)
      const idData = {
        gameId : gameId,    
      } 
      socket.emit("playerJoinsGame",idData)
       
      socket.on("playerJoinedRoom" , (idData)=>{
        console.log(idData)
        // setPlayer(idData.playerType)
      })
    }
  }, [])
  
  socket.on('error',(e)=>{
    error.set(e);
    // socket.emit("disconnect" , (gameId));
    // socket.on("disconnect" , ()=>{
    //   window.location.href = `http://localhost:3000/online`;
    // })
  })

  const takeoponent = ()=>{
    if(player==='r'){
      return 'b';
    }
    else{
      return 'r';
    }
  }

  return (
    (error.get()) ?
        <div className='errorContainer'>
          <p> Sorry ! {error.get()} </p>
        </div>
    :
    (
      (start.get()===true) ?
        <OnlineBoard gameId={gameId} player={player.get()} oponent={takeoponent(player.get())}></OnlineBoard>
      :
        <Waiting gameId={gameId}></Waiting>
    )
  )
}

export default Header