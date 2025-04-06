import { $ } from './utils.js';
const socket = io();

let userName = '';
let playerSombol = '';
let currentPlayerSombol = 'X';
let isCurrentPlayer = false;
const AVATAR_INDEX = Math.floor(Math.random() * 10) + 1;

$('#login-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!$('#login-form input').value) return;

    userName = $('#login-form input').value;
    $('#login-form').classList.add('hidden');
    socket.emit('username submited', userName);
});

socket.on('load game', (userNames, boardData) => {
    console.log('load game!!');
    renderGame(userNames, boardData);
});

socket.on('load player data', (data) => {
    console.log('load player data!!');
    playerSombol = data.playerSombol;
    isCurrentPlayer = data.isCurrentPlayer;
});

function renderGame(userNames, boardData) {
    if ($('.game')) $('.game').remove();
    function renderRow(y) {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row');
        rowDiv.id = y;
        boardData[y].forEach((cell, x) => {
            const cellDiv = document.createElement('div');
            cellDiv.className = `cell ${cell}`;
            cellDiv.id = `${y}-${x}`;
            cellDiv.textContent = cell;
            cellDiv.addEventListener('click', () => {
                console.log(y, x);
                if (boardData[y][x] || !isCurrentPlayer) return;
                
                isCurrentPlayer = false;
                currentPlayerSombol = currentPlayerSombol === 'X' ? 'O' : 'X';
                boardData[y][x] = playerSombol;
                socket.emit('load game', boardData);
            });
            rowDiv.appendChild(cellDiv);
        });
        return rowDiv;
        // return `
        //     <div class="row" id="${y}">
        //         ${boardData[y].map((cell, x) => 
        //             `<div class="cell ${cell}" id="${y}-${x}">${cell}</div>`
        //         ).join('')}
        //     </div>
        // `
    }
    const gameNode = document.createElement('div');
    gameNode.classList.add('game');

    const gameInfoNode = document.createElement('div');
    gameInfoNode.classList.add('game-info');
    gameInfoNode.innerHTML = userNames.map(userName => `
        <div class="player-info card align-items-center">
            <img src="img/avatar/${AVATAR_INDEX}.jpg" class="rounded-circle" width="120" alt="Avatar Picture">
            <h5 class="card-title text-truncate" style="width: 180px;">${userName}</h5>
        </div>
    `).join('');
    if (userNames.length < 2) {

        //Nếu chỉ có một người thì thẻ thứ 2 sẽ hiện gif loading...
        const div = document.createElement('div');
        div.classList.add('player-info', 'card');
        div.innerHTML = `
            <svg width="120" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle fill="#FF156D" stroke="#FF156D" stroke-width="15" r="15" cx="40" cy="100"><animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></circle><circle fill="#FF156D" stroke="#FF156D" stroke-width="15" r="15" cx="100" cy="100"><animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></circle><circle fill="#FF156D" stroke="#FF156D" stroke-width="15" r="15" cx="160" cy="100"><animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></circle></svg>
            <h5 class="card-title">Chờ người chơi khác...</h5>
        `
        gameInfoNode.appendChild(div);
    }

    const boardNode = document.createElement('div');
    boardNode.classList.add('board');
    boardData.forEach((_, y) => {
        boardNode.appendChild(renderRow(y));
    });

    gameNode.appendChild(gameInfoNode);
    gameNode.appendChild(boardNode);
    document.body.appendChild(gameNode);
}

function renderRoomCard(roomID, userNames = []) {
    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `
        <img src="/img/${Math.floor(Math.random() * 10) + 1}.jpg" width="100" height="100" class="card-img-top" alt="This is an image">
        <div class="card-body">
            <h5 class="card-title">Người chơi:</h5>
            <ul class="list-group">
                ${userNames.map(userName => `<li class="list-group-item text-truncate" style="max-width: 103px;">${userName}</li>`).join('')}
            </ul>
            <button type="button" id="${roomID}" 
                class="btn ${userNames.length < 2 ? 'btn-outline-success' : 'btn-danger'}" 
                ${userNames.length < 2 ? '' : 'disabled'}
            >
                ${userNames.length < 2 ? 'Vào phòng' : 'Phòng đã đầy'}
            </button>
        </div>
    `;
    $('.room-list').appendChild(div);
    // console.log(div);

    document.getElementById(roomID).addEventListener('click', () => {
        console.log({ roomID, userName });
        socket.emit('join room', { roomID, userName });
        socket.emit('load room data');
    });
}