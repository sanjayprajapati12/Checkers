import React from "react";

const Cell = React.memo((props) => {
    return (
      <div className={'mycell mycell-' + props.cell}>
        <div onClick={props.handlePieceClick} data-row={props.rowIndex} data-cell={props.index} className="gamePiece"></div>
      </div>
    );
})

export default Cell;
  

