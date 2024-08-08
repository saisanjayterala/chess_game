const pieces = document.querySelectorAll('.piece');
const squares = document.querySelectorAll('.square');
let turn = 'white'; // to Track the current player's turn
let gameState = 'in_progress'; //to  Track the game state (in_progress, checkmate, stalemate, draw)
let enPassantTarget = null; // to  Track the en-passant target square
let fiftyMoveRule = 0; // to Track the number of moves without a pawn move or capture
let promotionQueue = []; // to Track pieces to be promoted
let boardHistory = []; // to Track the board state history

pieces.forEach(piece => {
    piece.addEventListener('dragstart', dragStart);
    piece.addEventListener('dragend', dragEnd);
});

squares.forEach(square => {
    square.addEventListener('dragover', dragOver);
    square.addEventListener('drop', drop);
});

function dragStart(e) {
    const pieceColor = e.target.id.includes('_w') ? 'white' : 'black';
    if (pieceColor !== turn || gameState !== 'in_progress') {
        e.preventDefault();
        return;
    }
    e.dataTransfer.setData('text/plain', e.target.id);
    e.target.classList.add('dragging');
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const draggable = document.getElementById(id);
    const targetSquare = e.target.classList.contains('square') ? e.target : e.target.parentElement;

    if (isValidMove(draggable, targetSquare)) {
        const capturedPiece = targetSquare.querySelector('.piece');
        if (capturedPiece) {
            targetSquare.removeChild(capturedPiece);
            targetSquare.classList.add('capture');
            setTimeout(() => {
                targetSquare.classList.remove('capture');
            }, 1000);
        }
        targetSquare.appendChild(draggable);
        draggable.classList.remove('dragging');
        targetSquare.classList.add('highlight');
        setTimeout(() => {
            targetSquare.classList.remove('highlight');
        }, 1000);

        // Update the game state
        updateGameState(draggable, targetSquare);
        switchTurn();

        // Handle pawn promotion
        if (promotionQueue.length > 0) {
            promotePawns();
        }
    } else {
        targetSquare.classList.add('invalid-move');
        setTimeout(() => {
            targetSquare.classList.remove('invalid-move');
        }, 500);
    }
}

function switchTurn() {
    turn = turn === 'white' ? 'black' : 'white';
    document.getElementById('turn-indicator').innerText = `Turn: ${turn}`;
}

function isValidMove(piece, targetSquare) {
    const pieceType = piece.innerHTML;
    const pieceColor = piece.id.includes('_w') ? 'white' : 'black';
    const startSquare = piece.parentElement.id;
    const endSquare = targetSquare.id;

    switch (pieceType) {
        case '♙': // White Pawn
        case '♟': // Black Pawn
            return isValidPawnMove(pieceColor, startSquare, endSquare, targetSquare);
        case '♖': // Rook
            return isValidRookMove(pieceColor, startSquare, endSquare);
        case '♘': // Knight
            return isValidKnightMove(pieceColor, startSquare, endSquare);
        case '♗': // Bishop
            return isValidBishopMove(pieceColor, startSquare, endSquare);
        case '♕': // Queen
            return isValidQueenMove(pieceColor, startSquare, endSquare);
        case '♔': // King
            return isValidKingMove(pieceColor, startSquare, endSquare);
        default:
            return true;
    }
}

function isValidPawnMove(color, start, end, targetSquare) {
    const [startFile, startRank] = [start.charCodeAt(0), parseInt(start[1])];
    const [endFile, endRank] = [end.charCodeAt(0), parseInt(end[1])];

    if (color === 'white') {
        if (endFile === startFile && endRank === startRank + 1) {
            return true;
        } else if (startRank === 2 && endFile === startFile && endRank === startRank + 2) {
            enPassantTarget = String.fromCharCode(startFile) + (startRank + 1);
            return true;
        } else if (endFile === startFile - 1 && endRank === startRank + 1 && targetSquare.querySelector('.piece')?.id.includes('_b')) {
            return true;
        } else if (endFile === startFile + 1 && endRank === startRank + 1 && targetSquare.querySelector('.piece')?.id.includes('_b')) {
            return true;
        } else if (enPassantTarget === end && endRank === startRank + 1) {
            const capturedPawn = document.getElementById(`pawn_b${end.charCodeAt(0) - 'a'.charCodeAt(0) + 1}`);
            targetSquare.removeChild(capturedPawn);
            enPassantTarget = null;
            return true;
        }
    } else {
        if (endFile === startFile && endRank === startRank - 1) {
            return true;
        } else if (startRank === 7 && endFile === startFile && endRank === startRank - 2) {
            enPassantTarget = String.fromCharCode(startFile) + (startRank - 1);
            return true;
        } else if (endFile === startFile - 1 && endRank === startRank - 1 && targetSquare.querySelector('.piece')?.id.includes('_w')) {
            return true;
        } else if (endFile === startFile + 1 && endRank === startRank - 1 && targetSquare.querySelector('.piece')?.id.includes('_w')) {
            return true;
        } else if (enPassantTarget === end && endRank === startRank - 1) {
            const capturedPawn = document.getElementById(`pawn_w${end.charCodeAt(0) - 'a'.charCodeAt(0) + 1}`);
            targetSquare.removeChild(capturedPawn);
            enPassantTarget = null;
            return true;
        }
    }

    return false;
}

function isValidRookMove(color, start, end) {
    const [startFile, startRank] = [start.charCodeAt(0), parseInt(start[1])];
    const [endFile, endRank] = [end.charCodeAt(0), parseInt(end[1])];

    // Rook can move horizontally or vertically
    if (startFile === endFile || startRank === endRank) {
        // Check for obstructions
        if (startFile === endFile) {
            const step = startRank < endRank ? 1 : -1;
            for (let rank = startRank + step; rank !== endRank; rank += step) {
                if (document.getElementById(String.fromCharCode(startFile) + rank)?.querySelector('.piece')) {
                    return false;
                }
            }
        } else {
            const step = startFile < endFile ? 1 : -1;
            for (let file = startFile + step; file !== endFile; file += step) {
                if (document.getElementById(String.fromCharCode(file) + startRank)?.querySelector('.piece')) {
                    return false;
                }
            }
        }
        return true;
    }

    return false;
}

function isValidKnightMove(color, start, end) {
    const [startFile, startRank] = [start.charCodeAt(0), parseInt(start[1])];
    const [endFile, endRank] = [end.charCodeAt(0), parseInt(end[1])];

    // Knight can move in an 'L' shape
    const deltaFile = Math.abs(endFile - startFile);
    const deltaRank = Math.abs(endRank - startRank);
    return (deltaFile === 2 && deltaRank === 1) || (deltaFile === 1 && deltaRank === 2);
}

function isValidBishopMove(color, start, end) {
    const [startFile, startRank] = [start.charCodeAt(0), parseInt(start[1])];
    const [endFile, endRank] = [end.charCodeAt(0), parseInt(end[1])];

    // Bishop can move diagonally
    const deltaFile = Math.abs(endFile - startFile);
    const deltaRank = Math.abs(endRank - startRank);
    if (deltaFile === deltaRank) {
        // Check for obstructions
        const fileStep = endFile > startFile ? 1 : -1;
        const rankStep = endRank > startRank ? 1 : -1;
        let file = startFile + fileStep;
        let rank = startRank + rankStep;
        while (file !== endFile && rank !== endRank) {
            if (document.getElementById(String.fromCharCode(file) + rank)?.querySelector('.piece')) {
                return false;
            }
            file += fileStep;
            rank += rankStep;
        }
        return true;
    }

    return false;
}

function isValidQueenMove(color, start, end) {
    // The queen can move like a rook or a bishop
    return isValidRookMove(color, start, end) || isValidBishopMove(color, start, end);
}

function isValidKingMove(color, start, end) {
    const [startFile, startRank] = [start.charCodeAt(0), parseInt(start[1])];
    const [endFile, endRank] = [end.charCodeAt(0), parseInt(end[1])];

    // King can move one square in any direction
    const deltaFile = Math.abs(endFile - startFile);
    const deltaRank = Math.abs(endRank - startRank);
    return (deltaFile === 1 && deltaRank <= 1) || (deltaFile <= 1 && deltaRank === 1);
}

function updateGameState(piece, targetSquare) {
    const pieceType = piece.innerHTML;
    const pieceColor = piece.id.includes('_w') ? 'white' : 'black';
    const startSquare = piece.parentElement.id;
    const endSquare = targetSquare.id;
    const [endFile, endRank] = [endSquare.charCodeAt(0), parseInt(endSquare[1])];

    // Check for pawn promotion
    if (pieceType === '♙' && (pieceColor === 'white' && endRank === 8) || (pieceColor === 'black' && endRank === 1)) {
        promotionQueue.push({
            piece: piece,
            targetSquare: targetSquare
        });
    } else {
        // Increment the fifty-move rule counter
        if (pieceType !== '♙' && !targetSquare.querySelector('.piece')) {
            fiftyMoveRule++;
        } else {
            fiftyMoveRule = 0;
        }

        // Check for draw conditions
        if (fiftyMoveRule >= 50 || isDrawByRepetition() || isDrawByInsufficientMaterial()) {
            gameState = 'draw';
            document.getElementById('game-state').innerText = 'The game ends in a draw.';
        } else {
            checkGameState();
        }
    }
}

function promotePawns() {
    while (promotionQueue.length > 0) {
        const { piece, targetSquare } = promotionQueue.shift();
        const pieceColor = piece.id.includes('_w') ? 'white' : 'black';
        piece.innerHTML = '♕'; // Promote to Queen
        targetSquare.appendChild(piece);
        document.getElementById(`queen_${pieceColor}`).classList.add('hidden');
    }
}

function isDrawByRepetition() {
    const currentBoard = Array.from(document.querySelectorAll('.square')).map(square => square.innerHTML);
    if (boardHistory.includes(currentBoard.join(''))) {
        return true;
    }
    boardHistory.push(currentBoard.join(''));
    return false;
}

function isDrawByInsufficientMaterial() {
    const pieces = document.querySelectorAll('.piece');
    let pieceCount = {
        'white': 0,
        'black': 0
    };

    for (const piece of pieces) {
        const pieceColor = piece.id.includes('_w') ? 'white' : 'black';
        const pieceType = piece.innerHTML;
        if (pieceType === '♙' || pieceType === '♟') {
            return false; // There is at least one pawn, so not a draw
        }
        pieceCount[pieceColor]++;
    }

    // King vs. King
    if (pieceCount['white'] === 1 && pieceCount['black'] === 1) {
        return true;
    }

    // King vs. King and Bishop/Knight
    if ((pieceCount['white'] === 1 && pieceCount['black'] === 2) || (pieceCount['black'] === 1 && pieceCount['white'] === 2)) {
        return true;
    }

    return false;
}

function checkGameState() {
    const whiteKing = document.getElementById('king_w');
    const blackKing = document.getElementById('king_b');

    // Check checkmate
    if (isKingInCheck(whiteKing, 'black')) {
        if (!hasValidMoves('white')) {
            gameState = 'checkmate';
            document.getElementById('game-state').innerText = 'Checkmate! Black wins.';
        }
    } else if (isKingInCheck(blackKing, 'white')) {
        if (!hasValidMoves('black')) {
            gameState = 'checkmate';
            document.getElementById('game-state').innerText = 'Checkmate! White wins.';
        }
    } else if (!hasValidMoves('white') && !hasValidMoves('black')) {
        gameState = 'stalemate';
        document.getElementById('game-state').innerText = 'Stalemate! The game ends in a draw.';
    } else {
        gameState = 'in_progress';
        document.getElementById('game-state').innerText = '';
    }
}

function isKingInCheck(king, opposingColor) {
    const kingSquare = king.parentElement;
    const pieces = document.querySelectorAll(`.piece.${opposingColor}`);

    for (const piece of pieces) {
        if (isValidMove(piece, kingSquare)) {
            return true;
        }
    }

    return false;
}

function hasValidMoves(color) {
    const pieces = document.querySelectorAll(`.piece.${color}`);

    for (const piece of pieces) {
        for (const square of squares) {
            if (isValidMove(piece, square)) {
                return true;
            }
        }
    }

    return false;
}

// Initialize the game state
document.getElementById('turn-indicator').innerText = `Turn: ${turn}`;
document.getElementById('game-state').innerText = '';