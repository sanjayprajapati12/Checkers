import { NavLink, redirect } from 'react-router-dom'
import './Header.css'
import { useParams } from 'react-router-dom'
import {socket} from './Helper/Socket'
import { useEffect, useState } from 'react';
import OnlineBoard from './OnlineBoard/OnlineBoard';
import Waiting from './Waiting/Waiting';

const Header = () => {
  const {gameId} = useParams();
  const [error , setError] = useState('')
  const [start , setStart] = useState(false)
  const [player , setPlayer] = useState('#')
  
  socket.on("setPlayer" , (e)=>{
    setPlayer(e);
  })

  socket.on("startgame" , ()=>{
      setStart(true);
  })

  useEffect(()=>{
    console.log("gameid : ",gameId)
    const idData = {
      gameId : gameId,    
    } 
    socket.emit("playerJoinsGame",idData)
     
    socket.on("playerJoinedRoom" , (idData)=>{
      console.log(idData)
      // setPlayer(idData.playerType)
    })
  }, [])
  
  socket.on('error',(e)=>{
    setError(e)
    // socket.emit("disconnect" , (gameId));
    // socket.on("disconnect" , ()=>{
    //   window.location.href = `http://localhost:3000/online`;
    // })
  })

  // const [player1 , setPlayer1] = useState(false);
  // const [player2 , setPlayer2] = useState(false);
  // useEffect(()=>{
  //   if(player1===true){
  //     if(player2===true){
  //       // both set
  //     }
  //     else{
  //       const idData = {
  //         gameId : gameId,
  //         player : 'b',
  //       } 
  //       socket.emit('playerJoinsGame',idData)
  //     }
  //   }
  //   else{
  //     const idData = {
  //       gameId : gameId,
  //       player : 'r',
  //     } 
  //     socket.emit('playerJoinsGame',idData)
  //   }
  // },[gameId])

  const takeoponent = ()=>{
    if(player==='r'){
      return 'b';
    }
    else{
      return 'r';
    }
  }
  return (
    (error) ?
        <div className='errorContainer'>
          <p> Sorry ! {error} </p>
        </div>
    :
    (
      (start===true) ?
        <OnlineBoard gameId={gameId} player={player} oponent={takeoponent(player)}></OnlineBoard>
      :
        <Waiting gameId={gameId}></Waiting>
    )
  )
}

export default Header