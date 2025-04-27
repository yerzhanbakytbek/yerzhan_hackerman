document.addEventListener('DOMContentLoaded', () => {
    // Stories data
    const stories = [
        {
            id: 1,
            icon: 'fa-shield-alt',
            title: 'Қауіпсіз интернет',
            content: `
                <p>Интернетте қауіпсіз болу үшін келесі ережелерді сақтаңыз:</p>
                <ul>
                    <li>Күшті құпия сөздерді қолданыңыз</li>
                    <li>Екі факторлы аутентификацияны қосыңыз</li>
                    <li>Күдікті сілтемелерді ашпаңыз</li>
                    <li>Жеке ақпаратты бөліспеңіз</li>
                    <li>Антивирус бағдарламасын орнатыңыз</li>
                </ul>
            `
        },
        {
            id: 2,
            icon: 'fa-user-shield',
            title: 'Әлеуметтік желідегі қауіпсіздік',
            content: `
                <p>Әлеуметтік желілерде өзіңізді қорғау үшін:</p>
                <ul>
                    <li>Жеке парақшаңызды қорғаңыз</li>
                    <li>Бейтаныс адамдардан сақ болыңыз</li>
                    <li>Күдікті хабарламаларға жауап бермеңіз</li>
                    <li>Орналасқан жеріңізді көрсетпеңіз</li>
                </ul>
            `
        },
        {
            id: 3,
            icon: 'fa-lock',
            title: 'Құпия сөз қауіпсіздігі',
            content: `
                <p>Құпия сөздеріңізді қорғау үшін:</p>
                <ul>
                    <li>Әр аккаунтқа бөлек құпия сөз қойыңыз</li>
                    <li>Құпия сөз менеджерін қолданыңыз</li>
                    <li>Жиі құпия сөздерді ауыстырыңыз</li>
                    <li>Ұзын және күрделі құпия сөздерді таңдаңыз</li>
                </ul>
            `
        },
        {
            id: 4,
            icon: 'fa-search',
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
            id: 5,
            icon: 'fa-shield',
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
            id: 6,
            icon: 'fa-satellite',
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

    let currentStoryIndex = 0;

    // Story Modal elements
    const modal = document.querySelector('.story-modal');
    const modalContent = modal.querySelector('.story-modal-content');
    const modalTitle = modal.querySelector('.story-modal-title');
    const modalIcon = modal.querySelector('.story-modal-icon i');
    const modalBody = modal.querySelector('.story-modal-body');
    const closeButton = modal.querySelector('.story-modal-close');
    const prevButton = modal.querySelector('.prev-story');
    const nextButton = modal.querySelector('.next-story');

    // Add click handlers to story items
    document.querySelectorAll('.story-item').forEach((item, index) => {
        item.addEventListener('click', () => openStory(index));
    });

    // Open story function
    function openStory(index) {
        const story = stories[index];
        
        // Update modal content
        modalIcon.className = `fas ${story.icon}`;
        modalTitle.textContent = story.title;
        modalBody.innerHTML = story.content;
        
        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Update current index and navigation
        currentStoryIndex = index;
        updateNavButtons();
    }

    // Update navigation buttons
    function updateNavButtons() {
        prevButton.disabled = currentStoryIndex === 0;
        nextButton.disabled = currentStoryIndex === stories.length - 1;
    }

    // Navigation functions
    function nextStory() {
        if (currentStoryIndex < stories.length - 1) {
            openStory(currentStoryIndex + 1);
        }
    }

    function prevStory() {
        if (currentStoryIndex > 0) {
            openStory(currentStoryIndex - 1);
        }
    }

    // Close modal function
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Event listeners
    closeButton.addEventListener('click', closeModal);
    prevButton.addEventListener('click', prevStory);
    nextButton.addEventListener('click', nextStory);

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (modal.classList.contains('active')) {
            switch(e.key) {
                case 'Escape':
                    closeModal();
                    break;
                case 'ArrowRight':
                    nextStory();
                    break;
                case 'ArrowLeft':
                    prevStory();
                    break;
            }
        }
    });

    // Add hover effect to story rings
    document.querySelectorAll('.story-ring').forEach(ring => {
        ring.addEventListener('mouseenter', () => {
            ring.style.transform = 'scale(1.1)';
        });
        
        ring.addEventListener('mouseleave', () => {
            ring.style.transform = 'scale(1)';
        });
    });
}); 
