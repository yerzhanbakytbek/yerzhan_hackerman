document.addEventListener('DOMContentLoaded', () => {
    const storyModal = document.getElementById('storyModal');
    const modalTitle = document.querySelector('.story-modal-title-text');
    const modalIcon = document.querySelector('.story-modal-icon');
    const modalContent = document.querySelector('.story-modal-text');
    const closeButton = document.querySelector('.story-modal-close');
    const prevButton = document.getElementById('prevStory');
    const nextButton = document.getElementById('nextStory');

    let currentStoryId = null;

    // Stories data
    const stories = [
        {
            id: 1,
            title: 'Фишинг деген не?',
            icon: '🔎',
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
            title: 'IP арқылы ақпарат табу',
            icon: '🔎',
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
            title: 'Ең жақсы 5 OSINT құралы',
            icon: '🗂️',
            content: `
                <p>OSINT зерттеулері үшін ең пайдалы құралдар:</p>
                <ol>
                    <li>Maltego - байланыстарды визуализациялау</li>
                    <li>Shodan - интернетке қосылған құрылғыларды іздеу</li>
                    <li>TheHarvester - email және домендерді жинау</li>
                    <li>Recon-ng - веб-реконнессанс</li>
                    <li>SpiderFoot - автоматты OSINT</li>
                </ol>
            `
        },
        {
            id: 4,
            title: 'Құпия сөзді қорғаудың 5 әдісі',
            icon: '🛡️',
            content: `
                <p>Құпия сөздерді қорғау үшін маңызды ережелер:</p>
                <ol>
                    <li>Ұзын құпия сөздер қолданыңыз (кем дегенде 12 таңба)</li>
                    <li>Әртүрлі таңбаларды араластырыңыз</li>
                    <li>Әр сервис үшін бөлек құпия сөз қолданыңыз</li>
                    <li>Құпия сөз менеджерін пайдаланыңыз</li>
                    <li>Екі факторлы аутентификацияны қосыңыз</li>
                </ol>
            `
        },
        {
            id: 5,
            title: 'Shodan қалай жұмыс істейді?',
            icon: '📡',
            content: `
                <p>Shodan - интернетке қосылған құрылғыларды іздейтін қуатты құрал.</p>
                <p>Негізгі мүмкіндіктері:</p>
                <ul>
                    <li>Порттарды сканерлеу</li>
                    <li>Сервистерді анықтау</li>
                    <li>Осал құрылғыларды табу</li>
                    <li>Бейнекамераларды іздеу</li>
                </ul>
                <p>Маңызды: Shodan-ды тек заңды мақсаттарда қолданыңыз!</p>
            `
        }
    ];

    // Story cards click handler
    document.querySelectorAll('.story-card').forEach(card => {
        card.addEventListener('click', () => {
            const storyId = parseInt(card.dataset.storyId);
            showStory(storyId);
        });
    });

    // Show story in modal
    function showStory(id) {
        const story = stories.find(s => s.id === id);
        if (!story) return;

        currentStoryId = id;
        modalTitle.textContent = story.title;
        modalIcon.textContent = story.icon;
        modalContent.innerHTML = story.content;
        storyModal.classList.add('active');
        updateNavigationButtons();
    }

    // Update navigation buttons
    function updateNavigationButtons() {
        prevButton.disabled = currentStoryId === 1;
        nextButton.disabled = currentStoryId === stories.length;
    }

    // Navigation handlers
    prevButton.addEventListener('click', () => {
        if (currentStoryId > 1) {
            showStory(currentStoryId - 1);
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentStoryId < stories.length) {
            showStory(currentStoryId + 1);
        }
    });

    // Close modal handlers
    closeButton.addEventListener('click', () => {
        storyModal.classList.remove('active');
    });

    storyModal.addEventListener('click', (e) => {
        if (e.target === storyModal) {
            storyModal.classList.remove('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && storyModal.classList.contains('active')) {
            storyModal.classList.remove('active');
        }
    });
}); 
