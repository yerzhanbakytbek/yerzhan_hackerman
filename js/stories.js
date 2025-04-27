document.addEventListener('DOMContentLoaded', () => {
    // Stories data
    const stories = [
        {
            id: 1,
            icon: '🔎',
            title: 'Фишинг деген не?',
            content: `
                <p>Фишинг - бұл киберқылмыскерлердің қолданушылардың жеке ақпаратын алу әдісі.</p>
                <p>Негізгі белгілері:</p>
                <ul>
                    <li>Шұғыл әрекет етуді талап ету</li>
                    <li>Грамматикалық қателер</li>
                    <li>Күдікті URL мекенжайлары</li>
                    <li>Жеке ақпаратты сұрау</li>
                </ul>
                <p>Әрқашан URL мекенжайын және жіберушінің электрондық поштасын тексеріңіз!</p>
            `
        },
        {
            id: 2,
            icon: '🔎',
            title: 'IP арқылы ақпарат табу',
            content: `
                <p>IP мекенжайы арқылы келесі ақпаратты табуға болады:</p>
                <ul>
                    <li>Географиялық орналасуы</li>
                    <li>Интернет провайдері</li>
                    <li>Хостинг провайдері</li>
                    <li>Қолданылатын порттар</li>
                </ul>
                <p>Ескерту: Бұл ақпарат әрқашан 100% дәл болмауы мүмкін.</p>
            `
        },
        {
            id: 3,
            icon: '🗂️',
            title: 'Ең жақсы 5 OSINT құралы',
            content: `
                <p>OSINT зерттеулері үшін ең пайдалы құралдар:</p>
                <ol>
                    <li>Maltego - байланыстарды визуализациялау</li>
                    <li>Shodan - интернетке қосылған құрылғыларды іздеу</li>
                    <li>TheHarvester - домен туралы ақпарат жинау</li>
                    <li>Recon-ng - автоматтандырылған OSINT платформасы</li>
                    <li>SpiderFoot - автоматты ақпарат жинау</li>
                </ol>
            `
        },
        {
            id: 4,
            icon: '🛡️',
            title: 'Құпия сөзді қорғаудың 5 әдісі',
            content: `
                <p>Құпия сөздеріңізді қорғаудың негізгі әдістері:</p>
                <ol>
                    <li>Ұзын құпия сөздер қолданыңыз (12+ таңба)</li>
                    <li>Әртүрлі таңбаларды араластырыңыз</li>
                    <li>2FA қосыңыз</li>
                    <li>Құпия сөздер менеджерін қолданыңыз</li>
                    <li>Құпия сөздерді қайталамаңыз</li>
                </ol>
            `
        },
        {
            id: 5,
            icon: '📡',
            title: 'Shodan қалай жұмыс істейді?',
            content: `
                <p>Shodan - интернетке қосылған құрылғыларды іздейтін қуатты құрал.</p>
                <p>Негізгі мүмкіндіктері:</p>
                <ul>
                    <li>Порттарды сканерлеу</li>
                    <li>Баннерлерді жинау</li>
                    <li>Осал құрылғыларды табу</li>
                    <li>Фильтрлер арқылы іздеу</li>
                </ul>
                <p>Тек заңды мақсаттарда қолданыңыз!</p>
            `
        }
    ];

    // Initialize Swiper
    const swiper = new Swiper('.stories-slider', {
        slidesPerView: 'auto',
        spaceBetween: 20,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            320: {
                slidesPerView: 2,
            },
            768: {
                slidesPerView: 3,
            },
            1024: {
                slidesPerView: 4,
            }
        }
    });

    // Story Modal functionality
    const modal = document.querySelector('.story-modal');
    const modalContent = modal.querySelector('.story-modal-content');
    const closeBtn = modal.querySelector('.story-modal-close');

    // Story cards click handlers
    document.querySelectorAll('.story-card').forEach(card => {
        card.addEventListener('click', () => {
            const storyId = parseInt(card.dataset.storyId);
            const story = stories.find(s => s.id === storyId);
            if (story) {
                openStory(story);
            }
        });
    });

    function openStory(story) {
        modalContent.innerHTML = `
            <div class="story-modal-header">
                <span class="story-modal-icon">${story.icon}</span>
                <h3>${story.title}</h3>
                <button class="story-modal-close">&times;</button>
            </div>
            <div class="story-modal-body">
                ${story.content}
            </div>
        `;

        modal.classList.add('active');

        // Add close button functionality
        modal.querySelector('.story-modal-close').addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}); 
