// Блог мақалаларын жүктеу
async function loadBlogPosts(category = 'all', page = 1) {
    try {
        const response = await fetch(`/api/posts?category=${category}&page=${page}`);
        const data = await response.json();
        
        const postsGrid = document.querySelector('.posts-grid');
        postsGrid.innerHTML = ''; // Жаңа мақалаларды жүктеу алдында тазалау
        
        data.posts.forEach(post => {
            const postElement = createPostElement(post);
            postsGrid.appendChild(postElement);
        });

        updatePagination(data.totalPages, page);
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
        <div class="post-content">
            <span class="category">${post.category}</span>
            <h3>${post.title}</h3>
            <p>${post.excerpt}</p>
            <div class="post-meta">
                <span class="date">${post.date}</span>
                <span class="read-time">${post.readTime} мин оқу</span>
            </div>
            <a href="${post.url}" class="read-more">Толығырақ оқу</a>
        </div>
    `;
    
    return article;
}

// Санаттарды сұрыптау
document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Белсенді санатты өзгерту
        document.querySelector('.category-btn.active').classList.remove('active');
        this.classList.add('active');
        
        // Мақалаларды жүктеу
        const category = this.dataset.category;
        loadBlogPosts(category);
    });
});

// Беттерді ауыстыру
function updatePagination(totalPages, currentPage) {
    const pageNumbers = document.querySelector('.page-numbers');
    pageNumbers.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            const category = document.querySelector('.category-btn.active').dataset.category;
            loadBlogPosts(category, i);
        });
        pageNumbers.appendChild(button);
    }
}

// Алдыңғы/келесі бет
document.querySelector('.prev-page').addEventListener('click', () => {
    const currentPage = parseInt(document.querySelector('.page-numbers button.active').textContent);
    if (currentPage > 1) {
        const category = document.querySelector('.category-btn.active').dataset.category;
        loadBlogPosts(category, currentPage - 1);
    }
});

document.querySelector('.next-page').addEventListener('click', () => {
    const currentPage = parseInt(document.querySelector('.page-numbers button.active').textContent);
    const totalPages = document.querySelectorAll('.page-numbers button').length;
    if (currentPage < totalPages) {
        const category = document.querySelector('.category-btn.active').dataset.category;
        loadBlogPosts(category, currentPage + 1);
    }
});

// Сайт жүктелгенде мақалаларды жүктеу
document.addEventListener('DOMContentLoaded', () => {
    loadBlogPosts();
}); 