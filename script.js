const pieces = document.querySelectorAll('.piece');
const squares = document.querySelectorAll('.square');

pieces.forEach(piece => {
    piece.addEventListener('dragstart', dragStart);
});

squares.forEach(square => {
    square.addEventListener('dragover', dragOver);
    square.addEventListener('drop', drop);
});

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    setTimeout(() => {
        e.target.classList.add('hide');
    }, 0);
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const draggable = document.getElementById(id);
    if (e.target.classList.contains('square')) {
        e.target.appendChild(draggable);
        draggable.classList.remove('hide');
    }
}
