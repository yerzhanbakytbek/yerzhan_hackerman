document.addEventListener('DOMContentLoaded', () => {
    const videoModal = document.querySelector('.video-modal');
    const storyItems = document.querySelectorAll('.story-item');
    const modalVideo = videoModal.querySelector('video');
    const closeButton = videoModal.querySelector('.close-modal');

    // Массив с путями к видео файлам
    const videoSources = [
        'images/saqbol/video/video1.MP4',
        'images/saqbol/video/video2.MP4',
        'images/saqbol/video/video3.MP4',
        'images/saqbol/video/video4.MP4',
        'images/saqbol/video/video5.MP4',
        'images/saqbol/video/video6.MP4'
    ];

    // Добавляем обработчики для каждой истории
    storyItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            modalVideo.src = videoSources[index];
            videoModal.style.display = 'flex';
            modalVideo.play();
        });
    });

    // Закрытие модального окна
    closeButton.addEventListener('click', () => {
        videoModal.style.display = 'none';
        modalVideo.pause();
        modalVideo.currentTime = 0;
    });

    // Закрытие при клике вне видео
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            videoModal.style.display = 'none';
            modalVideo.pause();
            modalVideo.currentTime = 0;
        }
    });

    // Закрытие по клавише Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal.style.display === 'flex') {
            videoModal.style.display = 'none';
            modalVideo.pause();
            modalVideo.currentTime = 0;
        }
    });
}); 
