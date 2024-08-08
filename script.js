const pieces = document.querySelectorAll('.piece');
const squares = document.querySelectorAll('.square');
let turn = 'white'; // Track the current player's turn

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
    if (pieceColor !== turn) {
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
        switchTurn();
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
            return isValidPawnMove(pieceColor, startSquare, endSquare);
        case '♖': // Rook
            return isValidRookMove(pieceColor, startSquare, endSquare);
        case '♘': // Knight
            return isValidKnightMove(pieceColor, startSquare, endSquare);
        case '♗': // Bishop
            return isValidBishopMove(pieceColor, startSquare, endSquare);
        // Add cases for other pieces
        default:
            return true;
    }
}

function isValidPawnMove(color, start, end) {
    const [startFile, startRank] = [start.charCodeAt(0), parseInt(start[1])];
    const [endFile, endRank] = [end.charCodeAt(0), parseInt(end[1])];

    if (color === 'white') {
        return (endFile === startFile && endRank === startRank + 1) || (startRank === 2 && endFile === startFile && endRank === startRank + 2);
    } else {
        return (endFile === startFile && endRank === startRank - 1) || (startRank === 7 && endFile === startFile && endRank === startRank - 2);
    }
}

function isValidRookMove(color, start, end) {
    const [startFile, startRank] = [start.charCodeAt(0), parseInt(start[1])];
    const [endFile, endRank] = [end.charCodeAt(0), parseInt(end[1])];

    return (startFile === endFile && startRank !== endRank) || (startFile !== endFile && startRank === endRank);
}

function isValidKnightMove(color, start, end) {
    const [startFile, startRank] = [start.charCodeAt(0), parseInt(start[1])];
    const [endFile, endRank] = [end.charCodeAt(0), parseInt(end[1])];

    const dx = Math.abs(endFile - startFile);
    const dy = Math.abs(endRank - startRank);

    return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
}

function isValidBishopMove(color, start, end) {
    const [startFile, startRank] = [start.charCodeAt(0), parseInt(start[1])];
    const [endFile, endRank] = [end.charCodeAt(0), parseInt(end[1])];

    return Math.abs(endFile - startFile) === Math.abs(endRank - startRank);
}

const turnIndicator = document.createElement('div');
turnIndicator.id = 'turn-indicator';
turnIndicator.innerText = `Turn: ${turn}`;
document.body.insertBefore(turnIndicator, document.body.firstChild);

const dragText = document.createElement('div');
dragText.id = 'drag-text';
dragText.innerText = 'Drag a piece to move it';
document.body.insertBefore(dragText, document.body.firstChild);

const style = document.createElement('style');
style.innerHTML = `
    #turn-indicator {
        font-size: 24px;
        margin-bottom: 10px;
        text-align: center;
    }
`;
document.head.appendChild(style);
