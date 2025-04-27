// Байланыс формасын өңдеу
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Форма деректерін алу
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };

    try {
        // Форманы жіберу
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            // Сәтті жіберілгенде
            showNotification('Хабарламаңыз сәтті жіберілді!', 'success');
            document.getElementById('contactForm').reset();
        } else {
            // Қате болғанда
            showNotification('Қате орын алды. Қайталап көріңіз.', 'error');
        }
    } catch (error) {
        console.error('Хабарлама жіберу кезінде қате:', error);
        showNotification('Қате орын алды. Қайталап көріңіз.', 'error');
    }
});

// Хабарлама көрсету функциясы
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // 3 секундтан кейін хабарламаны жою
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Форманы тексеру
function validateForm() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    if (!name || !email || !message) {
        showNotification('Барлық өрістерді толтырыңыз', 'error');
        return false;
    }

    // Email тексеру
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Жарамды email мекенжайын енгізіңіз', 'error');
        return false;
    }

    return true;
} 