import React from "react";
import Cell from '../Cell/Cell'

const Row = React.memo((props) =>{
    return (
      <div className="myrow">
        {props.rowArr.map((cell, index) => (
          <Cell key={index} rowIndex={props.rowIndex} index={index} cell={cell} handlePieceClick={props.handlePieceClick} />
        ))}
      </div>
    );
})

export default Row;


