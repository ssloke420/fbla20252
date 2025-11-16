let activeUsers = new Set();
let typingTimeout;
let isAdmin = false;

/* Check if user is admin from sessionStorage */
function checkAdmin() {
    isAdmin = sessionStorage.getItem("isAdmin") === "true";
}

/* Add user to active users set */
function addUser(username) {
    activeUsers.add(username);
    updateUserList();
}

/* Remove a user from active users set */
function removeUser(username) {
    activeUsers.delete(username);
    updateUserList();
}

/* Re-render the active users list */
function updateUserList() {
    const userList = document.getElementById('userList');
    userList.innerHTML = '<strong>Active Users:</strong><br>' + Array.from(activeUsers).join('<br>');
}

/* Show typing message for 3 seconds */
function showTypingIndicator(username) {
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.textContent = username + " is typing...";
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        typingIndicator.textContent = "";
    }, 3000);
}

/* Create and display a chat message */
function addMessage(message, username) {
    const chatMessages = document.getElementById('messages');
    const timestamp = new Date().toLocaleTimeString();

    /* Unique ID for message */
    const messageID = Date.now();

    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');
    messageContainer.dataset.id = messageID;

    const messageElement = document.createElement('p');

    /* Check if message is an image URL */
    if (isImageURL(message)) {
        messageElement.innerHTML =
            "[" + timestamp + "] <b>" + username + "</b>:<br>" +
            "<img src=\"" + message + "\" style=\"max-width: 100%; max-height: 200px;\">";
    } else {
        messageElement.innerHTML =
            "[" + timestamp + "] <b>" + username + "</b>: " + message;
    }

    messageContainer.appendChild(messageElement);

    /* Admin click to delete message */
    messageContainer.addEventListener("click", function () {
        if (isAdmin) {
            const confirmDelete = confirm("Delete this message");
            if (!confirmDelete) return;
            deleteMessage(messageID);
            messageContainer.remove();
        }
    });

    chatMessages.appendChild(messageContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    saveMessages();
}

/* Determine if a string is an image URL */
function isImageURL(url) {
    return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
}

/* Save all messages to localStorage */
function saveMessages() {
    const containers = document.querySelectorAll(".message-container");

    const saved = Array.from(containers).map(c => {
        return {
            id: c.dataset.id,
            html: c.innerHTML
        };
    });

    localStorage.setItem('chatMessages', JSON.stringify(saved));
}

/* Load all messages from localStorage */
function loadMessages() {
    const chatMessages = document.getElementById('messages');
    const saved = JSON.parse(localStorage.getItem('chatMessages')) || [];

    chatMessages.innerHTML = "";

    saved.forEach(m => {
        const container = document.createElement('div');
        container.classList.add('message-container');
        container.dataset.id = m.id;
        container.innerHTML = m.html;

        /* Admin click-delete behavior */
        container.addEventListener("click", function () {
            if (isAdmin) {
                const confirmDelete = confirm("Delete this message");
                if (!confirmDelete) return;
                deleteMessage(m.id);
                container.remove();
            }
        });

        chatMessages.appendChild(container);
    });
}

/* Remove a specific message from localStorage */
function deleteMessage(id) {
    let saved = JSON.parse(localStorage.getItem('chatMessages')) || [];
    saved = saved.filter(m => m.id != id);
    localStorage.setItem('chatMessages', JSON.stringify(saved));
}

/* Auto-clear messages every hour */
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

/* On page load, set up chat */
document.addEventListener('DOMContentLoaded', () => {
    checkAdmin();
    loadMessages();
    resetMessages();
    setInterval(resetMessages, 60 * 60 * 1000);
});

/* Handle sending messages and typing indicator */
document.getElementById('chat').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const message = document.getElementById('chat').value.trim();
        const username = document.getElementById('username').value.trim();

        if (message && username) {
            if (isAdmin && message.startsWith('/ban ')) {
                const userToBan = message.substring(5).trim();
                activeUsers.delete(userToBan);
                updateUserList();
                addMessage("User '" + userToBan + "' has been banned by Admin.", "Admin");
            } else {
                addMessage(message, username);
            }
            document.getElementById('chat').value = "";
        } else {
            alert("Please enter both your name and a message.");
        }
    } else {
        const username = document.getElementById('username').value.trim();
        if (username) showTypingIndicator(username);
    }
});

/* Add user when they leave the username box */
document.getElementById('username').addEventListener('blur', function() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        addUser(username);
        checkAdmin();
    }
});

/* Remove user when they focus the username box */
document.getElementById('username').addEventListener('focus', function() {
    const username = document.getElementById('username').value.trim();
    if (username) removeUser(username);
});
