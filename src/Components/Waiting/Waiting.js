import './Waiting.css'

const Waiting = ({gameId}) => {
  return (
    <>
        <div className='container'>
          <p className='heading'>Room id : {gameId} </p>
          <p className='message'> Send the Room Id to your friend and wait for your friend to join </p>
        </div>
    </>
  )
}

export default Waiting;