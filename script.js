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
        e.target.appendChild(draggable);
        draggable.classList.remove('dragging');
        switchTurn();
    }
}

function switchTurn() {
    turn = turn === 'white' ? 'black' : 'white';
    document.getElementById('turn-indicator').innerText = `Turn: ${turn}`;
}

const turnIndicator = document.createElement('div');
turnIndicator.id = 'turn-indicator';
turnIndicator.innerText = `Turn: ${turn}`;
document.body.insertBefore(turnIndicator, document.body.firstChild);

const dragText = document.createElement('div');
dragText.id = 'drag-text';
dragText.innerText = 'Drag a piece to move it';
document.body.insertBefore(dragText, document.body.firstChild);
