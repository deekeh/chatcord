const chatForm = document.getElementById('chat-form');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

// join chatroom
socket.emit('joinRoom', { username, room });

// get room info
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

socket.on('msg', msg => {
    outputMsg(msg);

    // scroll down
    document.querySelector('.chat-messages').scrollTop = document.querySelector('.chat-messages').scrollHeight;
});

chatForm.addEventListener('submit', e => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;
    socket.emit('chatMsg', msg);

    // clear text field
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// dom manipulation
function outputMsg(msg) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
    <p class="meta">${msg.username} <span>${msg.time}</span></p>
    <p class="text">
        ${msg.text}
	</p>
    `;
    document.querySelector('.chat-messages').appendChild(div);
}


// add room name
function outputRoomName(room) {
    roomName.innerText = room;
}

// add users
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}