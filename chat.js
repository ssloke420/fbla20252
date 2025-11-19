let activeUsers = new Set();
let typingTimeout;
let isAdmin = false;
let bannedWords = [];

// Check if user is admin
function checkAdmin() {
    if (sessionStorage.getItem("isAdmin") === "true") {
        isAdmin = true;
    }
}

// Add and remove users
function addUser(username) {
    activeUsers.add(username);
    updateUserList();
}

function removeUser(username) {
    activeUsers.delete(username);
    updateUserList();
}

// Fetch bad words from JSON
fetch("extras/badwords.json")
  .then(response => response.json())
  .then(data => {
      bannedWords = data.words || [];
  })
  .catch(err => console.error("Failed to load bad words:", err));

// Check if text contains any banned word
function containsBadWord(text) {
    return bannedWords.some(word => {
        const regex = new RegExp(`\\b${word}\\b`, "i");
        return regex.test(text);
    });
}

// Update active users list
function updateUserList() {
    const userList = document.getElementById('userList');
    userList.innerHTML = '<strong>Active Users:</strong><br>' + Array.from(activeUsers).join('<br>');
}

// Show typing indicator
function showTypingIndicator(username) {
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.textContent = `${username} is typing...`;
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        typingIndicator.textContent = '';
    }, 3000);
}

// Check if URL is an image
function isImageURL(url) {
    return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
}

// Add message to chat
function addMessage(message, username) {
    const chatMessages = document.getElementById('messages');
    const timestamp = new Date().toLocaleTimeString();
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    const messageElement = document.createElement('p');

    if (isImageURL(message)) {
        messageElement.innerHTML = `[${timestamp}] <b>${username}</b>:<br><img src="${message}" style="max-width: 100%; max-height: 200px;">`;
    } else {
        messageElement.textContent = `[${timestamp}] ${username}: ${message}`;
    }

    // Admin delete feature
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

// Save and load messages
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

// Reset messages every hour
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

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    checkAdmin();
    loadMessages();
    resetMessages();
    setInterval(resetMessages, 60 * 60 * 1000);

    const chatInput = document.getElementById('chat');
    const usernameInput = document.getElementById('username');

    chatInput.addEventListener('keydown', function(event) {
        const username = usernameInput.value.trim();
        if (event.key === 'Enter') {
            const message = chatInput.value.trim();
            if (!message || !username) {
                alert("Please enter both your name and a message.");
                return;
            }

            // Prevent sending if bad word exists
            if (containsBadWord(message)) {
                alert("Your message contains inappropriate words and cannot be sent.");
                return;
            }

            if (isAdmin && message.startsWith('/ban ')) {
                const userToBan = message.substring(5).trim();
                activeUsers.delete(userToBan);
                updateUserList();
                addMessage(`User '${userToBan}' has been banned by Admin.`, 'Admin');
            } else {
                addMessage(message, username);
            }

            chatInput.value = '';
        } else {
            if (username) showTypingIndicator(username);
        }
    });

    usernameInput.addEventListener('blur', function() {
        const username = usernameInput.value.trim();
        if (username) addUser(username);
    });

    usernameInput.addEventListener('focus', function() {
        const username = usernameInput.value.trim();
        if (username) removeUser(username);
    });
});
