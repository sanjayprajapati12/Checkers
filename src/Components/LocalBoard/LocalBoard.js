import React, { useState , useEffect} from 'react';
import Popup from "../Popup/Popup";
import Row from "../Row/Row"
import Statistics from "../Statistics/Statistics";
import './LocalBoard.css'

export default function LocalBoard() {
	const len = 8;

	const [state, setState] = useState({
		board: [
		['b', '-', 'b', '-', 'b', '-', 'b', '-'],
		['-', 'b', '-', 'b', '-', 'b', '-', 'b'],
		['b', '-', 'b', '-', 'b', '-', 'b', '-'],
		['-', '-', '-', '-', '-', '-', '-', '-'],
		['-', '-', '-', '-', '-', '-', '-', '-'],
		['-', 'r', '-', 'r', '-', 'r', '-', 'r'],
		['r', '-', 'r', '-', 'r', '-', 'r', '-'],
		['-', 'r', '-', 'r', '-', 'r', '-', 'r']
		],
		activePlayer: 'r',
		aiDepthCutoff: 3,
		count: 0,
		active : false,
		popShown: false,
		winner : '#'
	});

	const aboutPopOpen = () => {
		setState({ ...state, popShown: true });
	};

	const aboutPopClose = () => {
		setState({ ...state, popShown: false });
	};

	useEffect(()=>{
		console.log(state.winner);
		if(state.winner!=='#'){
			setTimeout(alert(state.winner + ' win the game !') , 500)
			reset();
		}
	} , [state.winner])

	useEffect(() => {
		const my_fun = async function(){
			let decide = await looseDetection(state.board, state.activePlayer)
			if(decide === true){
				if(state.activePlayer=='b'){
					setState((prevState)=> ({
						...prevState,
						winner : 'r'
					}))
				}
				else{
					setState((prevState)=> ({
						...prevState,
						winner : 'b'
					}))
				}
			}
		}
		my_fun();
	}, [state.activePlayer]);
	
	const updateBoard = (new_board) =>{
		console.log("update called");
		setState((prevState) => ({
			...prevState,
			board: new_board,
		}));
	};  

    const handlePieceClick = async (e) => {
		// console.log("andar " , e);
		let rowIndex = parseInt(e.target.attributes['data-row'].nodeValue);
		let cellIndex = parseInt(e.target.attributes['data-cell'].nodeValue);
		
			console.log(state.board[rowIndex][cellIndex].indexOf(state.activePlayer));
			if (state.board[rowIndex][cellIndex].indexOf(state.activePlayer) > -1) {
				console.log("1");
				//this is triggered if the piece that was clicked on is one of the player's own pieces, it activates it and highlights possible moves
				
				// async
				setState((prevState) => {
					// Clone the board to avoid direct mutation
					let newBoard = prevState.board.map((row) => row.map((cell) => cell.replace('a', '')));
					newBoard[rowIndex][cellIndex] = 'a' + newBoard[rowIndex][cellIndex];
				
					// Highlight possible moves
					const updatedBoard = highlightPossibleMoves(newBoard, rowIndex, cellIndex);
					
					return { ...prevState, active : true , board: updatedBoard };
				});
			}
			else if(state.board[rowIndex][cellIndex].indexOf('h') > -1) {
				console.log("2");
				//this is activated if the piece clicked is a highlighted square, it moves the active piece to that spot.

				let new_activePlayer = (state.activePlayer == 'r' ? 'b' : 'r');
				let new_board = cloneBoard(state.board);
				new_board =  await executeMove(rowIndex, cellIndex, new_board, state.activePlayer);
				setState((prevState) => {
					return { ...prevState, activePlayer: new_activePlayer , active: false , board: new_board };
				});
			}
			else{
				console.log("temp_if")
			}

		return state.board;
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

        if ( (activePlayer == 'b' && rowIndex == 7) || (activePlayer == 'r' && rowIndex == 0) ) {
			board[rowIndex][cellIndex] += ' k';
    	}

    	return board;
    }

    const highlightPossibleMoves = ( new_board , rowIndex , cellIndex ) =>{
        //unhighlight any previously highlighted cells
		// let new_board = state.board;
        
		new_board = new_board.map(function(row){return row.map(function(cell){return cell.replace('h', '-').replace(/d\d\d/g, '').trim()});}); 
        let possibleMoves = findAllPossibleMoves(rowIndex, cellIndex, new_board, state.activePlayer);
        
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
	
	const reset = () => {
		setState({
			...state,
			board: [
				['b', '-', 'b', '-', 'b', '-', 'b', '-'],
				['-', 'b', '-', 'b', '-', 'b', '-', 'b'],
				['b', '-', 'b', '-', 'b', '-', 'b', '-'],
				['-', '-', '-', '-', '-', '-', '-', '-'],
				['-', '-', '-', '-', '-', '-', '-', '-'],
				['-', 'r', '-', 'r', '-', 'r', '-', 'r'],
				['r', '-', 'r', '-', 'r', '-', 'r', '-'],
				['-', 'r', '-', 'r', '-', 'r', '-', 'r']
			],
			activePlayer: 'r',
			active : false,
			winner : '#'
		});
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
					board[sourceRowIndex+directions[k]][sourceCellIndex+leftOrRight[l]].indexOf((activePlayer === 'r' ? 'b' : 'r')) > -1 &&
					board[sourceRowIndex+(directions[k]*2)][sourceCellIndex+(leftOrRight[l]*2)] === '-'
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
				if(new_board[i][j].indexOf(state.activePlayer)>-1){
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

	const has_active = (rowIndex , cellIndex) =>{
		return (state.board[rowIndex][cellIndex].indexOf('a')>-1);
	};

	return (
	// <div className='main'>
		<div className="mycontainer">
		<div className={'board ' + state.activePlayer}>
			{state.board.map((row, index) => (
			<Row key={index} rowArr={row} handlePieceClick={handlePieceClick} rowIndex={index} />
			))}
		</div>
		<div className="clear"></div>
		<button className="board-btn" onClick={reset}>Reset</button>
		<button className="board-btn" onClick={aboutPopOpen}>Rules</button>
		<Statistics board={state.board}/>
		<Popup shown={state.popShown} close={aboutPopClose} copy="
				Hey! Thanks for checking out my checkers game. Before playing, keep in mind these Checkers rules.  Players start with 12 pieces each, moving diagonally forward and capturing opponents by jumping over them. When a piece reaches the opponent's last row, it becomes a king with the ability to move and capture in both directions. The goal is to capture all of the opponent's pieces or block them from making a legal move. Kings are crowned upon reaching the last row, and the game ends when one player accomplishes the objective or the opponent cannot make a legal move.
		"/>
		{/* Include <Statistics /> and <Popup /> components */}
		{/* </div> */}
	</div>
	);
}