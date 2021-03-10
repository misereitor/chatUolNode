const socket = io()
let username
let userList = []

const loginPage = document.querySelector('#loginPage')
const chatPage = document.querySelector('#chatPage')

const loginInput = document.querySelector('#loginNameInput')
const textInput = document.querySelector('#chatTextInput')

loginPage.style.display = 'flex'
chatPage.style.display = 'none'

function renderUserList () {
    const ul = document.querySelector('.userList')
    ul.innerHTML = ''
    userList.forEach(i => {
        ul.innerHTML += `<li>${i}</li>`
    })
}

function addMenssage (type, user, msg) {
    const ul = document.querySelector('.chatList')
    switch (type) {
        case 'status':
            ul.innerHTML += `<li class="m-status">${msg}</li>`
            break
        case 'msg':
            if (username == user) {
                ul.innerHTML += `<li class="m-txt me">${msg}</li>`
            } else {
                ul.innerHTML += `<li class="m-txt"><span>${user}: </span>${msg}</li>`
            }
            break
    }

    ul.scrollTop = ul.scrollHeight
}

loginInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        let name = loginInput.value.trim()
        if (name != '') {
            username = name
            document.title = `Chat (${username})`
            socket.emit('join-request', username)
        }
    }
})

textInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        let txt = textInput.value.trim()
        textInput.value = ''
        if (txt != '') {
            addMenssage('msg', username, txt)
            socket.emit('send-msg', txt)
        }
    }
})

socket.on('user-ok', (list) => {
    loginPage.style.display = 'none'
    chatPage.style.display = 'flex'
    textInput.focus()

    addMenssage('status', null, 'Conectado')

    userList = list
    renderUserList()
})

socket.on('list-update', (data) => {
    if (data.joined) {
        addMenssage('status', null, data.joined + ' Entrou no chat.')
    }

    if (data.left) {
        addMenssage('status', null, data.left + ' saiu no chat.')
    }
    userList = data.list
    renderUserList()
})

socket.on('show-msg', data => {
    addMenssage('msg', data.username, data.message)
})

socket.on('disconnect', () => {
    addMenssage('status', null, 'Você foi desconectado')
    userList = []
    renderUserList()
})

socket.on('reconnect_error', () => {
    addMenssage('status', null, 'Tentando reconectar...');
});

socket.on('reconect', () => {
    addMenssage('status', null, 'Reconectado!')
    if (username != '') {
        socket.emit('user-join', username)
    }
})