let activeUsers = new Set();
let typingTimeout;
let isAdmin = false;

function checkAdmin() {
    if (sessionStorage.getItem("isAdmin") === "true") {
        isAdmin = true;
    }
}

function addUser(username) {
    activeUsers.add(username);
    updateUserList();
}

function removeUser(username) {
    activeUsers.delete(username);
    updateUserList();
}

function updateUserList() {
    const userList = document.getElementById('userList');
    userList.innerHTML = '<strong>Active Users:</strong><br>' + Array.from(activeUsers).join('<br>');
}

function showTypingIndicator(username) {
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.textContent = `${username} is typing...`;
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        typingIndicator.textContent = '';
    }, 3000);
}

function addMessage(message, username) {
    const chatMessages = document.getElementById('messages');
    const timestamp = new Date().toLocaleTimeString();

    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    const messageElement = document.createElement('p');
    if (isImageURL(message)) {
        messageElement.innerHTML = `[${timestamp}] <b>${username}</b>:<br><img src="${message}" style="max-width: 100%; max-height: 200px;">`;
    } else {
        messageElement.innerHTML = `[${timestamp}] <b>${username}</b>: ${message}`;
    }
    
    // Add click event to message if admin
    if (isAdmin) {
        messageContainer.style.cursor = 'pointer';
        messageContainer.addEventListener("click", function(e) {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this message?')) {
                messageContainer.remove();
                saveMessages();
            }
        });
    }

    messageContainer.appendChild(messageElement);
    chatMessages.appendChild(messageContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    saveMessages();
}

function isImageURL(url) {
    return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
}

function saveMessages() {
    const chatMessages = document.getElementById('messages');
    const messages = Array.from(chatMessages.children).map(child => child.innerHTML);
    localStorage.setItem('chatMessages', JSON.stringify(messages));
}

function loadMessages() {
    const chatMessages = document.getElementById('messages');
    const savedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    chatMessages.innerHTML = '';
    savedMessages.forEach(messageHTML => {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message-container');
        messageContainer.innerHTML = messageHTML;
        
        // Re-attach click handler for admin
        if (isAdmin) {
            messageContainer.style.cursor = 'pointer';
            messageContainer.addEventListener("click", function(e) {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this message?')) {
                    messageContainer.remove();
                    saveMessages();
                }
            });
        }
        
        chatMessages.appendChild(messageContainer);
    });
}

function resetMessages() {
    const now = new Date().getTime();
    const lastReset = localStorage.getItem('lastReset') || 0;
    const oneHour = 60 * 60 * 1000;
    if (now - lastReset > oneHour) {
        localStorage.setItem('lastReset', now);
        localStorage.removeItem('chatMessages');
        loadMessages();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAdmin();
    loadMessages();
    resetMessages();
    setInterval(resetMessages, 60 * 60 * 1000);
    
    document.getElementById('chat').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            const message = document.getElementById('chat').value.trim();
            const username = document.getElementById('username').value.trim();
            if (message && username) {
                if (isAdmin && message.startsWith('/ban ')) {
                    const userToBan = message.substring(5).trim();
                    activeUsers.delete(userToBan);
                    updateUserList();
                    addMessage(`User '${userToBan}' has been banned by Admin.`, 'Admin');
                } else {
                    addMessage(message, username);
                }
                document.getElementById('chat').value = '';
            } else {
                alert("Please enter both your name and a message.");
            }
        } else {
            const username = document.getElementById('username').value.trim();
            if (username) showTypingIndicator(username);
        }
    });

    document.getElementById('username').addEventListener('blur', function() {
        const username = document.getElementById('username').value.trim();
        if (username) {
            addUser(username);
        }
    });

    document.getElementById('username').addEventListener('focus', function() {
        const username = document.getElementById('username').value.trim();
        if (username) removeUser(username);
    });
});
