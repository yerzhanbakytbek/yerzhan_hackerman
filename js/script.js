// Story modal functionality
document.addEventListener('DOMContentLoaded', () => {
    const storyItems = document.querySelectorAll('.story-item');
    const storyModal = document.querySelector('.story-modal');
    const modalVideo = document.querySelector('.story-modal-content video');
    const closeModal = document.querySelector('.close-modal');

    const videoSources = [
        'images/saqbol/video/video1.mp4',
        'images/saqbol/video/video2.mp4',
        'images/saqbol/video/video3.mp4',
        'images/saqbol/video/video4.mp4',
        'images/saqbol/video/video5.mp4',
        'images/saqbol/video/video6.mp4'
    ];

    storyItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            const videoSource = modalVideo.querySelector('source');
            videoSource.src = videoSources[index];
            modalVideo.load();
            storyModal.classList.add('active');
            modalVideo.play();
        });
    });

    closeModal.addEventListener('click', () => {
        storyModal.classList.remove('active');
        modalVideo.pause();
        modalVideo.currentTime = 0;
    });

    storyModal.addEventListener('click', (e) => {
        if (e.target === storyModal) {
            storyModal.classList.remove('active');
            modalVideo.pause();
            modalVideo.currentTime = 0;
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && storyModal.classList.contains('active')) {
            storyModal.classList.remove('active');
            modalVideo.pause();
            modalVideo.currentTime = 0;
        }
    });
});

// Чат функционалы
class ChatManager {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendMessage');
        this.isProcessing = false;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                ${this.escapeHtml(message)}
            </div>
        `;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    async sendMessage() {
        if (this.isProcessing) return;

        const message = this.messageInput.value.trim();
        if (!message) return;

        try {
            this.isProcessing = true;
            this.sendButton.disabled = true;
            this.messageInput.disabled = true;

            // Пайдаланушы хабарламасын көрсету
            this.addMessage(message, true);
            this.messageInput.value = '';

            // Жүктеу хабарламасын көрсету
            this.addMessage('Жауапты күтіңіз...', false);

            // API-ға сұраныс жіберу
            const response = await fetch('http://localhost:5500/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            // Жүктеу хабарламасын жою
            this.chatMessages.removeChild(this.chatMessages.lastChild);

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const data = await response.json();
            this.addMessage(data.response, false);

        } catch (error) {
            console.error('Error:', error);
            this.chatMessages.removeChild(this.chatMessages.lastChild);
            this.addMessage('Қате орын алды. Қайталап көріңіз.', false);
        } finally {
            this.isProcessing = false;
            this.sendButton.disabled = false;
            this.messageInput.disabled = false;
            this.messageInput.focus();
        }
    }
}

// Чатты іске қосу
document.addEventListener('DOMContentLoaded', () => {
    new ChatManager();
}); 