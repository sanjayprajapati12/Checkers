import React, { useState , useEffect} from 'react';
import Popup from "../Popup/Popup";
import Row from "../Row/Row"
import Statistics from "../Statistics/Statistics";
import './AiBoard.css'

export default function AiBoard() {
	const [decisionTree , setDecisionTree] = useState({
		target:{
			attributes:{
				'data-row':{
					nodeValue:null
				},
				'data-cell':{
					nodeValue:null
				},
				'temp-data-row':{
					nodeValue:null
				},
				'temp-data-cell':{
					nodeValue:null
				}
			}
		}
	})

	const [decision , setDecision] = useState(false)

	let count = 0;
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
		popShown: false
	});

	const aboutPopOpen = () => {
		setState({ ...state, popShown: true });
	};

	const aboutPopClose = () => {
		setState({ ...state, popShown: false });
	};

	useEffect(() => {
		if (winDetection(state.board, state.activePlayer)) {
			setTimeout(alert(state.activePlayer + ' loose the game!') , 50)
			console.log(state.activePlayer+ ' losse the game!');
		}
		else if(state.activePlayer == 'b') {
			setTimeout(function() {ai();}.bind(this), 50);
		}
	}, [state.activePlayer]);
	
	useEffect(()=>{
		if(state.active==true && decision===true){
			console.log("activated " );
			let f = decisionTree.target.attributes['temp-data-row'].nodeValue
			let s = decisionTree.target.attributes['temp-data-cell'].nodeValue
			setDecisionTree((prevState) => {
				return {
				  target: {
					attributes: {
						'data-row':{
							nodeValue:f
						},
						'data-cell':{
							nodeValue:s
						},
						'temp-data-row':{
							nodeValue:null
						},
						'temp-data-cell':{
							nodeValue:null
						}
					},
				  },
				};
			  });
		}
	} , [state.active])

	useEffect(()=>{
		const my_fun = async function(){
			if(state.activePlayer == 'b' && decision===true){
				console.log("decision is made and useeffect " , decisionTree);
				const new_board = await handlePieceClick(decisionTree);
			}
		}
		my_fun();
	},[decision])

	useEffect(()=>{
		console.log(decisionTree);
		if(decisionTree.target.attributes['data-cell'].nodeValue!==null){
			if(decisionTree.target.attributes['temp-data-cell'].nodeValue===null){
				const my_fun = async function(){
					if(state.activePlayer == 'b'){
						if(state.active===true){
							console.log("before execution " , state);	
							const latest_boad = await handlePieceClick(decisionTree);
						}
					}
				}
				my_fun();
			}
			else{
				setDecision(true)
			}
		}
	} , [decisionTree])

	const updateBoard = (new_board) =>{
		console.log("update called");
		setState((prevState) => ({
			...prevState,
			board: new_board,
		}));
	};  
	

    const handlePieceClick = async(e) => {
		console.log("andar " , (e.target.attributes["data-cell"]));	

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
				setState((prevState) => {
					// Clone the board to avoid direct mutation
					let new_board = cloneBoard(state.board);
					new_board = executeMove(rowIndex, cellIndex, new_board, state.activePlayer);
				
					return { ...prevState, activePlayer: new_activePlayer , active: false , board: new_board };
				});

				// if (winDetection(state.board, state.activePlayer)) {
				// 	alert(state.activePlayer + 'won the game!');
				// 	console.log(state.activePlayer+ ' won the game!');
				// }
				// else {
					// console.log(state.activePlayer);
					// console.log("3");
					// async
					// setState((prevState) => ({
					// 	...prevState,
					// 	activePlayer : new_activePlayer,
					// }))
				// }
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
			board[rowIndex][cellIndex]+= ' k';
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
			active : false
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

	const winDetection = (board, enemyPlayer) =>{
		// let enemyPlayer = (activePlayer == 'r' ? 'b' : 'r');

		let result = true;
		for (let i = 0; i < board.length; i++) {
			for (let j = 0; j < board[i].length; j++) {
				if (board[i][j].indexOf(enemyPlayer) > -1) {
					result = false;
				}
			}
		}
		return result;
	}
	
	const cloneBoard = (board) =>{
		let output = [];
        for (let i = 0; i < board.length; i++) output.push(board[i].slice(0));
        return output;
    }

	const has_active = (rowIndex , cellIndex) =>{
		return (state.board[rowIndex][cellIndex].indexOf('a')>-1);
	};


	const ai =  async () => {
		//prep a branching future prediction
		// state = state;
		setDecision(false)
		count = 0;
		console.time('decisionTree');
		console.log('starting ai...........')
		const temp_decisionTree = await aiBranch(state.board, state.activePlayer, 1);
		
		console.log('done ai...........')
		console.timeEnd('decisionTree');

		console.log(count);
		// execute the most favorable move 
		if (temp_decisionTree !== null && temp_decisionTree.length > 0) {
			setDecisionTree((prevState) => {
				return {
				  target: {
					attributes: {
						'data-row':{
							nodeValue:temp_decisionTree[0].piece.targetRow
						},
						'data-cell':{
							nodeValue:temp_decisionTree[0].piece.targetCell
						},
						'temp-data-row':{
							nodeValue:temp_decisionTree[0].move.targetRow
						},
						'temp-data-cell':{
							nodeValue:temp_decisionTree[0].move.targetCell
						}
					},
				  },
				};
			  });
		}
		else {
			alert('no moves, you win!');
		}
	}

	const aiBranch = (hypotheticalBoard, activePlayer, depth) => {
		count++;
		let output = [];
		for (let i = 0; i < hypotheticalBoard.length; i++) {
			for (let j = 0; j < hypotheticalBoard[i].length; j++) {
				if (hypotheticalBoard[i][j].indexOf(activePlayer) > -1) {
					let possibleMoves = findAllPossibleMoves(i, j, hypotheticalBoard, activePlayer);
					for (let k = 0; k < possibleMoves.length; k++) {
						let tempBoard = cloneBoard(hypotheticalBoard);
                    	tempBoard[i][j] = 'a'+tempBoard[i][j];

						let buildHighlightTag = 'h ';
						for (let m = 0; m < possibleMoves[k].wouldDelete.length; m++) {
							buildHighlightTag += 'd'+String(possibleMoves[k].wouldDelete[m].targetRow) + String(possibleMoves[k].wouldDelete[m].targetCell)+' ';
						}
						tempBoard[possibleMoves[k].targetRow][possibleMoves[k].targetCell] = buildHighlightTag;

						let buildingObject = {
							piece: {targetRow: i, targetCell: j},
							move:possibleMoves[k],
							board: executeMove(possibleMoves[k].targetRow, possibleMoves[k].targetCell, tempBoard, activePlayer),
							terminal: null,
							children:[],
							score:0,
							activePlayer: activePlayer,
							depth: depth,
						}
						//does that move win the game?
						buildingObject.terminal = winDetection(buildingObject.board, activePlayer);						

						if (buildingObject.terminal) {
							//console.log('a terminal move was found');
							//if terminal, score is easy, just depends on who won
							if (activePlayer == state.activePlayer) {
								buildingObject.score = 100-depth;
							}
							else {
								buildingObject.score = -100-depth;
							}
						}
						else if(depth > state.aiDepthCutoff) {
							//don't want to blow up the call stack boiiiiii
							buildingObject.score = 0;
						}
						else {	
							buildingObject.children = aiBranch(buildingObject.board, (activePlayer == 'r' ? 'b' : 'r'), depth+1);
							//if not terminal, we want the best score from this route (or worst depending on who won)							
							let scoreHolder = [];
					        for (let l = 0; l < buildingObject.children.length; l++) {
					        	if (typeof buildingObject.children[l].score !== 'undefined'){
					        		scoreHolder.push(buildingObject.children[l].score);
					        	}
					        }

					        scoreHolder.sort(function(a,b){ if (a > b) return -1; if (a < b) return 1; return 0; });

					        if (scoreHolder.length > 0) {
						        if (activePlayer == state.activePlayer) {
									buildingObject.score = scoreHolder[scoreHolder.length-1];
								}
								else {
									buildingObject.score = scoreHolder[0];
								}
							}
							else {
								if (activePlayer == state.activePlayer) {
									buildingObject.score = 100-depth;
								}
								else {
									buildingObject.score = -100-depth;
								}
							}
						}

						if (activePlayer == state.activePlayer) {
							for (let n = 0; n < buildingObject.move.wouldDelete.length; n++) {
								if (hypotheticalBoard[buildingObject.move.wouldDelete[n].targetRow][buildingObject.move.wouldDelete[n].targetCell].indexOf('k') > -1) {
									buildingObject.score+=(25-depth);
								}
								else {
									buildingObject.score+=(10-depth);
								}
							}
							if ((JSON.stringify(hypotheticalBoard).match(/k/g) || []).length < (JSON.stringify(buildingObject.board).match(/k/g) || []).length) {
								//new king made after this move
								buildingObject.score+=(15-depth);
							}
						}
						else {
							for (let n = 0; n < buildingObject.move.wouldDelete.length; n++) {
								if (hypotheticalBoard[buildingObject.move.wouldDelete[n].targetRow][buildingObject.move.wouldDelete[n].targetCell].indexOf('k') > -1) {
									buildingObject.score-=(25-depth);
								}
								else {
									buildingObject.score-=(10-depth);
								}
							}							
							if ((JSON.stringify(hypotheticalBoard).match(/k/g) || []).length < (JSON.stringify(buildingObject.board).match(/k/g) || []).length) {
								//new king made after this move
								buildingObject.score-=(15-depth);
							}
						}
						buildingObject.score+=buildingObject.move.wouldDelete.length;
						output.push(buildingObject);
					}
				}
			}
		}

		output = output.sort(function(a,b){ if (a.score > b.score) return -1; if (a.score < b.score) return 1; return 0; });
		return output;
	}

  return (
	<>
		<div className="mycontainer">
		<h2>You are playing with AI</h2>
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
		</div>
	</>	
  );

}