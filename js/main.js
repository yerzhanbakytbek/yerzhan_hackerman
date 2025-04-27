// Мобильді мәзір
document.addEventListener('DOMContentLoaded', function() {
    const nav = document.querySelector('nav ul');
    const logo = document.querySelector('.logo');

    logo.addEventListener('click', function() {
        nav.classList.toggle('show');
    });
});

// Плавный скролл
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Соңғы мақалаларды жүктеу
async function loadLatestPosts() {
    try {
        const response = await fetch('/api/latest-posts');
        const posts = await response.json();
        
        const postsGrid = document.querySelector('.posts-grid');
        posts.forEach(post => {
            const postElement = createPostElement(post);
            postsGrid.appendChild(postElement);
        });
    } catch (error) {
        console.error('Мақалаларды жүктеу кезінде қате:', error);
    }
}

// Мақала элементін жасау
function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'post-card';
    
    article.innerHTML = `
        <img src="${post.image}" alt="${post.title}">
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
        <a href="${post.url}" class="read-more">Толығырақ оқу</a>
    `;
    
    return article;
}

// Сайт жүктелгенде соңғы мақалаларды жүктеу
document.addEventListener('DOMContentLoaded', loadLatestPosts);

// EmailJS инициализациясы
(function() {
    emailjs.init("1GIWgMWSt723HjhV6");
})();

// Форманы өңдеу
document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Жіберу түймесін өшіру
    document.querySelector('.submit-btn').disabled = true;
    document.querySelector('.submit-btn').textContent = 'Жіберілуде...';

    // EmailJS арқылы хабарлама жіберу
    emailjs.send('service_yerzhan', 'template_bd01dmm', {
        from_name: document.getElementById('name').value,
        from_email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    })
    .then(function(response) {
        console.log('SUCCESS!', response.status, response.text);
        alert('Хабарлама сәтті жіберілді!');
        
        // Форманы тазалау
        document.getElementById('contactForm').reset();
        
        // Жіберу түймесін қалпына келтіру
        document.querySelector('.submit-btn').disabled = false;
        document.querySelector('.submit-btn').textContent = 'Жіберу';
    }, function(error) {
        console.log('FAILED...', error);
        alert('Қате шықты. Қайталап көріңіз.');
        
        // Жіберу түймесін қалпына келтіру
        document.querySelector('.submit-btn').disabled = false;
        document.querySelector('.submit-btn').textContent = 'Жіберу';
    });
}); 