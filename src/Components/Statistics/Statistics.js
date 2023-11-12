import React from "react";

// var Statistics = React.createClass({
// 	render: function() {
// 		return(
// 			<div  className="stats" >
// 				<div className="half" style={{color: '#e26b6b'}}>
// 					Red(Player):<br/>
// 					{ (this.props.board.map( function(row){return(row.join(''))} ).join('').match(/r/g) || []).length} Soldiers<br/>
// 					{ (this.props.board.map( function(row){return(row.join(''))} ).join('').match(/r\sk/g) || []).length} Kings
// 				</div>
// 				<div className="half">
// 					Black(AI):<br/>
// 					{ (this.props.board.map( function(row){return(row.join(''))} ).join('').match(/b/g) || []).length} Soldiers<br/>
// 					{ (this.props.board.map( function(row){return(row.join(''))} ).join('').match(/b\sk/g) || []).length} Kings
// 				</div>
// 			</div>
// 		)
// 	}
// });

// export default Statistics;

export default function Statistics(props) {
    const boardStr = props.board.map(row => row.join('')).join('');
  
    const redSoldiers = (boardStr.match(/r/g) || []).length;
    const redKings = (boardStr.match(/r\sk/g) || []).length;
    const blackSoldiers = (boardStr.match(/b/g) || []).length;
    const blackKings = (boardStr.match(/b\sk/g) || []).length;
  
    return (
      <div className="mystats">
        <div className="myhalf" style={{ color: '#e75656' }}>
          Red(Player1)<br />
          {redSoldiers} Soldiers<br />
          {redKings} Kings
        </div>
        <div className="myhalf">
          Black(Player2)<br />
          {blackSoldiers} Soldiers<br />
          {blackKings} Kings
        </div>
      </div>
    );
}