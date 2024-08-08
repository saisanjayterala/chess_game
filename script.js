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
    if (e.target.classList.contains('square') && e.target.childNodes.length === 0) {
        if (isValidMove(draggable, e.target)) {
            e.target.appendChild(draggable);
            draggable.classList.remove('dragging');
            e.target.classList.add('highlight');
            switchTurn();
        }
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
        default:
            return true;
    }
}

function isValidPawnMove(color, start, end) {
    const [startFile, startRank] = [start.charCodeAt(0), parseInt(start[1])];
    const [endFile, endRank] = [end.charCodeAt(0), parseInt(end[1])];

    if (color === 'white') {
        return endFile === startFile && endRank === startRank + 1;
    } else {
        return endFile === startFile && endRank === startRank - 1;
    }
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
