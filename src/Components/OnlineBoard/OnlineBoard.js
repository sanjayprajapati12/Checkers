import React, { useEffect} from 'react';
import Popup from "../Popup/Popup";
import Row from "../Row/Row"
import Statistics from "../Statistics/Statistics";
import {socket} from '../Helper/Socket'
import useCustom from '../CustomHooks/useCustom';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './OnlineBoard.css'


export default function OnlineBoard({gameId,player,oponent}) {
	const navigate = useNavigate();

	const can = useCustom(false);
	const board = useCustom([
			['b', '-', 'b', '-', 'b', '-', 'b', '-'],
			['-', 'b', '-', 'b', '-', 'b', '-', 'b'],
			['b', '-', 'b', '-', 'b', '-', 'b', '-'],
			['-', '-', '-', '-', '-', '-', '-', '-'],
			['-', '-', '-', '-', '-', '-', '-', '-'],
			['-', 'r', '-', 'r', '-', 'r', '-', 'r'],
			['r', '-', 'r', '-', 'r', '-', 'r', '-'],
			['-', 'r', '-', 'r', '-', 'r', '-', 'r']
	]);
	const activePlayer = useCustom('r');
	const popShown = useCustom(false);
	const winner = useCustom('#')
	
	const len = 8;
	// const [state, setState] = useState({
	// 	board: [
	// 	['b', '-', 'b', '-', 'b', '-', 'b', '-'],
	// 	['-', 'b', '-', 'b', '-', 'b', '-', 'b'],
	// 	['b', '-', 'b', '-', 'b', '-', 'b', '-'],
	// 	['-', '-', '-', '-', '-', '-', '-', '-'],
	// 	['-', '-', '-', '-', '-', '-', '-', '-'],
	// 	['-', 'r', '-', 'r', '-', 'r', '-', 'r'],
	// 	['r', '-', 'r', '-', 'r', '-', 'r', '-'],
	// 	['-', 'r', '-', 'r', '-', 'r', '-', 'r']
	// 	],
	// 	activePlayer: 'r',
	// 	popShown: false,
	// 	winner : '#'
	// });
	
	useEffect(()=>{
		
		socket.on("declareWinner" , (win)=>{
			winner.set(win);
		})
		
		socket.on("move" , async (e)=>{
			console.log("taken move " , e);
			console.log("taken board " , board.get());
			console.log("taken active player " , board.get());
			
			await handlePieceClick(e);

		})

	} , [socket ])
	
	const aboutPopOpen = () => {
		popShown.set(true);
		// setState({ ...state, popShown: true });
	};

	const aboutPopClose = () => {
		// setState({ ...state, popShown: false });
		popShown.set(false);
	};

	useEffect(()=>{
		const my_fun = async()=>{
			console.log(winner.get());
			if(winner.get()!=='#'){
				if(winner.get()===player){
					await Swal.fire({
						title: 'Game Over',
						icon: 'success',
						text: `Congratulations ! You won the game`,
						showCancelButton: false,
						showConfirmButton: true,
					});
					navigate('/online' , {replace:false})
				}
				else{
					await Swal.fire({
						title: 'Game Over',
						icon: 'error',
						text: `Sorry, you lost.Better luck next time`,
						showCancelButton: false,
						showConfirmButton: true,
					});
					navigate('/online' , {replace:false})
				}
			}
		}

		my_fun();
	} , [winner.get()])

	useEffect(() => {
		const my_fun = async function(){
			if(activePlayer.get()===player){
				// setCan(true);
				can.set(true);
			}
			else{
				// setCan(false);
				can.set(false);
			}

			let decide = await looseDetection(board.get(), activePlayer.get())
			if(decide === true){
				if(activePlayer.get()==='b'){
					const data = {
						gameId : gameId,
						win : 'r'
					}
					socket.emit("declareWinner" , data);
				}else{
					const data = {
						gameId : gameId,
						win : 'b'
					}
					socket.emit("declareWinner" , data);				
				}
			}
		}
		my_fun();
	}, [activePlayer.get()]);
	
	const updateBoard = (new_board) =>{
		console.log("update called");
		board.set(new_board);
	};  

	const socketHandlePieceClick = (e)=>{
		console.log("can hai ye " , can.get());
		console.log("cur" , player);
		console.log("active " , activePlayer.get());
		if(can.get()===true){
			console.log("give")
			let rowId = parseInt(e.target.attributes["data-row"].nodeValue);
			let colId = parseInt(e.target.attributes["data-cell"].nodeValue);
			const data = {
				gameId : gameId,
				move : {
					moveRow : rowId,
					moveCol : colId
				} 
			}
			console.log(data);
			socket.emit("moveByClient",data);
		}
	}

    const handlePieceClick = async (e) => {
		
		let rowIndex = e.moveRow;
		let cellIndex = e.moveCol;
		
			if (board.get()[rowIndex][cellIndex].indexOf(activePlayer.get()) > -1) {
				let newBoard = board.get().map((row) => row.map((cell) => cell.replace('a', '')));
				newBoard[rowIndex][cellIndex] = 'a' + newBoard[rowIndex][cellIndex];
						
				const updatedBoard = await highlightPossibleMoves(newBoard, rowIndex, cellIndex);
				board.set(updatedBoard);
				// setState((prevState) => {
				// 	return { ...prevState, board: updatedBoard };
				// });
			}
			else if(board.get()[rowIndex][cellIndex].indexOf('h') > -1) {
				let new_activePlayer = (activePlayer.get() == 'r' ? 'b' : 'r');
				let new_board = cloneBoard(board.get());
				new_board =  await executeMove(rowIndex, cellIndex, new_board, activePlayer.get());
				activePlayer.set(new_activePlayer);
				board.set(new_board);
				// setState((prevState) => {
				// 	return { ...prevState, activePlayer: new_activePlayer ,  board: new_board };
				// });
			}
			else{
				console.log("dusre ka access kiya")
			}

		return board.get();
    }
	

    const executeMove = (rowIndex, cellIndex, board, activePlayer) => {
		let activePiece;
        for (let i = 0; i < board.length; i++) {
        	//for each row
        	for (let j = 0; j < board[i].length; j++) {
				if (board[i][j].indexOf('a')>-1) {
        			activePiece = board[i][j];
        		}
        	}
        }
		
		// console.log("activePiece , " , activePiece);
    	//make any jump deletions

        let deletions = board[rowIndex][cellIndex].match(/d\d\d/g);
        if (typeof deletions !== undefined && deletions !== null && deletions.length > 0) {
			for (let k = 0; k < deletions.length; k++) {
				let deleteCoords = deletions[k].replace('d', '').split('');
    			board[deleteCoords[0]][deleteCoords[1]] = '-';
    		}
        }

    	//remove active piece from it's place
    	board = board.map(function(row){return row.map(function(cell){return cell.replace(activePiece, '-')});});

	    //unhighlight
        board = board.map(function(row){return row.map(function(cell){return cell.replace('h', '-').replace(/d\d\d/g, '').trim()});}); 

    	//place active piece, now unactive, in it's new place
        board[rowIndex][cellIndex] = activePiece.replace('a', '');

        if ( (activePlayer === 'b' && rowIndex === 7) || (activePlayer === 'r' && rowIndex === 0) ) {
			board[rowIndex][cellIndex] += ' k';
    	}

    	return board;
    }

    const highlightPossibleMoves = ( new_board , rowIndex , cellIndex ) =>{
        //unhighlight any previously highlighted cells
		// let new_board = state.board;
        
		new_board = new_board.map(function(row){return row.map(function(cell){return cell.replace('h', '-').replace(/d\d\d/g, '').trim()});}); 
        let possibleMoves = findAllPossibleMoves(rowIndex, cellIndex, new_board, activePlayer.get());
        
		// testing
		// console.log(possibleMoves);

        //actually highlight the possible moves on the board
        //the 'highlightTag' inserts the information in to a cell that specifies

        for (let j = 0; j < possibleMoves.length; j++) {
            let buildHighlightTag = 'h ';
            for (let k = 0; k < possibleMoves[j].wouldDelete.length; k++) {
				buildHighlightTag += 'd'+String(possibleMoves[j].wouldDelete[k].targetRow) + String(possibleMoves[j].wouldDelete[k].targetCell)+' ';
            }
            new_board[possibleMoves[j].targetRow][possibleMoves[j].targetCell] = buildHighlightTag;
        }
		
		return new_board;
    };
	

	const findAllPossibleMoves = (rowIndex, cellIndex, board, activePlayer) =>{
		let possibleMoves = [];
		let directionOfMotion = [];
		let leftOrRight = [1,-1];
		let isKing = board[rowIndex][cellIndex].indexOf('k') > -1;
		if (activePlayer == 'b') {
			directionOfMotion.push(1);
		}
		else {
			directionOfMotion.push(-1);
		}
		
		//if it's a king, we allow it to both go forward and backward, otherwise it can only move in it's color's normal direction
		//the move loop below runs through every direction of motion allowed, so if there are two it will hit them both
		if (isKing) {
			directionOfMotion.push(directionOfMotion[0]*-1);
		}
		
		//normal move detection happens here (ie. non jumps)
		//for each direction of motion allowed to the piece it loops (forward for normal pieces, both for kings)
		//inside of that loop, it checks in that direction of motion for both left and right (checkers move diagonally)
		//any moves found are pushed in to the possible moves array
		for (let j = 0; j < directionOfMotion.length; j++) {
			for (let i = 0; i < leftOrRight.length; i++) {			
				if (
					typeof board[rowIndex+directionOfMotion[j]] !== 'undefined' &&
					typeof board[rowIndex+directionOfMotion[j]][cellIndex + leftOrRight[i]] !== 'undefined' &&
					board[rowIndex+directionOfMotion[j]][cellIndex + leftOrRight[i]] == '-'
					){
						if (possibleMoves.map(function(move){return String(move.targetRow)+String(move.targetCell);}).indexOf(String(rowIndex+directionOfMotion[j])+String(cellIndex+leftOrRight[i])) < 0) {
						possibleMoves.push({targetRow: rowIndex+directionOfMotion[j], targetCell: cellIndex+leftOrRight[i], wouldDelete:[]});
					}
				}
			}
		}
		
		//get jumps
		let jumps = findAllJumps(rowIndex, cellIndex, board, directionOfMotion[0], [], [], isKing, activePlayer);
		
		//loop and push all jumps in to possibleMoves
		for (let i = 0; i < jumps.length; i++) {
			possibleMoves.push(jumps[i]);
		}
		return possibleMoves;
	}

	const resign = ()=>{
		console.log("resign is pressed")
		const data = {
			gameId : gameId,
			win : oponent
		}
		socket.emit("declareWinner" , data);

	}

	const reset = () => {
		board.set( [
			['b', '-', 'b', '-', 'b', '-', 'b', '-'],
			['-', 'b', '-', 'b', '-', 'b', '-', 'b'],
			['b', '-', 'b', '-', 'b', '-', 'b', '-'],
			['-', '-', '-', '-', '-', '-', '-', '-'],
			['-', '-', '-', '-', '-', '-', '-', '-'],
			['-', 'r', '-', 'r', '-', 'r', '-', 'r'],
			['r', '-', 'r', '-', 'r', '-', 'r', '-'],
			['-', 'r', '-', 'r', '-', 'r', '-', 'r']
		]);
		activePlayer.set('r');
		winner.set('#')
		// setState({
		// 	...state,
		// 	board: [
		// 		['b', '-', 'b', '-', 'b', '-', 'b', '-'],
		// 		['-', 'b', '-', 'b', '-', 'b', '-', 'b'],
		// 		['b', '-', 'b', '-', 'b', '-', 'b', '-'],
		// 		['-', '-', '-', '-', '-', '-', '-', '-'],
		// 		['-', '-', '-', '-', '-', '-', '-', '-'],
		// 		['-', 'r', '-', 'r', '-', 'r', '-', 'r'],
		// 		['r', '-', 'r', '-', 'r', '-', 'r', '-'],
		// 		['-', 'r', '-', 'r', '-', 'r', '-', 'r']
		// 	],
		// 	activePlayer: 'r',
		// 	active : false,
		// 	winner : '#'
		// });
	};
	
	const findAllJumps = (sourceRowIndex, sourceCellIndex, board, directionOfMotion, possibleJumps, wouldDelete, isKing, activePlayer) =>{

		//jump moves
		let thisIterationDidSomething = false;
		let directions = [directionOfMotion];
		let leftOrRight = [1, -1];
		if (isKing) {
			//if it's a king, we'll also look at moving backwards
			directions.push(directions[0]*-1);
		}
		
		//here we detect any jump possible moves
		//for each direction available to the piece (based on if it's a king or not) 
		//and for each diag (left or right) we look 2 diag spaces away to see if it's open and if we'd jump an enemy to get there.
		for (let k = 0; k < directions.length; k++) {
			for (let l = 0; l < leftOrRight.length; l++) {
				// leftOrRight[l]
				if (
					typeof board[sourceRowIndex+directions[k]] !== 'undefined' &&
					typeof board[sourceRowIndex+directions[k]][sourceCellIndex+leftOrRight[l]] !== 'undefined' &&
					typeof board[sourceRowIndex+(directions[k]*2)] !== 'undefined' &&
					typeof board[sourceRowIndex+(directions[k]*2)][sourceCellIndex+(leftOrRight[l]*2)] !== 'undefined' &&
					board[sourceRowIndex+directions[k]][sourceCellIndex+leftOrRight[l]].indexOf((activePlayer == 'r' ? 'b' : 'r')) > -1 &&
					board[sourceRowIndex+(directions[k]*2)][sourceCellIndex+(leftOrRight[l]*2)] == '-'
					){
					if (possibleJumps.map(function(move){return String(move.targetRow)+String(move.targetCell);}).indexOf(String(sourceRowIndex+(directions[k]*2))+String(sourceCellIndex+(leftOrRight[l]*2))) < 0) {
						//this eventual jump target did not already exist in the list
						let tempJumpObject = {
							targetRow: sourceRowIndex+(directions[k]*2),
							targetCell: sourceCellIndex+(leftOrRight[l]*2),
							wouldDelete:[
								{
									targetRow:sourceRowIndex+directions[k],
									targetCell:sourceCellIndex+leftOrRight[l]
								}
							]
						};
						for (let i = 0; i < wouldDelete.length; i++) {
							tempJumpObject.wouldDelete.push(wouldDelete[i]);
						}
						possibleJumps.push(tempJumpObject);
						thisIterationDidSomething = true;
					}
				}
			}
		}
		
		//if a jump was found, thisIterationDidSomething is set to true and this function calls itself again from that source point, this is how we recurse to find multi jumps
		if(thisIterationDidSomething) {
			for (let i = 0; i < possibleJumps.length; i++) {
				let coords = [possibleJumps[i].targetRow, possibleJumps[i].targetCell];
				let children = findAllJumps(coords[0], coords[1], board, directionOfMotion, possibleJumps, possibleJumps[i].wouldDelete, isKing, activePlayer);
				for (let j = 0; j < children.length; j++) {
					if (possibleJumps.indexOf(children[j]) < 0) {
						possibleJumps.push(children[j]);
					}
				}
			}
		}
		return possibleJumps;
	}

	const looseDetection = (new_board, player) =>{
		for(let i=0 ; i<len ; i++){
			for(let j=0 ; j<len ; j++){
				if(new_board[i][j].indexOf(activePlayer.get())>-1){
					let possibleMoves = findAllPossibleMoves(i, j, new_board, player);
					if(possibleMoves.length>0){
						return false;
					}
				}
			}
		}
		return true;
	}
	
	const cloneBoard = (board) =>{
		let output = [];
        for (let i = 0; i < board.length; i++) output.push(board[i].slice(0));
        return output;
    }

	return (
		<>
		<div className="mycontainer">
			<h3> Your Piece : {player==='b' ? "Black" : "Red"}</h3>
			<h3> {activePlayer.get()===player ? "Your Move" : "Opponent Move"}</h3>
			<div className={'board ' + {player}}>
				{board.get().map((row, index) => (
				<Row key={index} rowArr={row} handlePieceClick={socketHandlePieceClick} rowIndex={index} />
				))}
			</div>
			<div className="clear"></div>
			<button className="board-btn" onClick={resign}>Resign</button>
			<button className="board-btn" onClick={aboutPopOpen}>Rules</button>
			<Statistics board={board.get()}/>
			<Popup shown={popShown.get()} close={aboutPopClose} copy="
				Hey! Thanks for checking out my checkers game. Before playing, keep in mind these Checkers rules.  Players start with 12 pieces each, moving diagonally forward and capturing opponents by jumping over them. When a piece reaches the opponent's last row, it becomes a king with the ability to move and capture in both directions. The goal is to capture all of the opponent's pieces or block them from making a legal move. Kings are crowned upon reaching the last row, and the game ends when one player accomplishes the objective or the opponent cannot make a legal move.
			"/>
			{/* Include <Statistics /> and <Popup /> components */}
		</div>
		</>
	);
}