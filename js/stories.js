document.addEventListener('DOMContentLoaded', () => {
    const storyItems = document.querySelectorAll('.story-item');
    const modal = document.querySelector('.story-modal');
    const modalContent = document.querySelector('.story-modal-content');
    const closeButton = document.querySelector('.story-modal-close');

    storyItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            const videoNumber = index + 1;
            const videoPath = `images/saqbol/video/video${videoNumber}.mp4`;
            
            modalContent.innerHTML = `
                <button class="story-modal-close">&times;</button>
                <video class="story-video" controls autoplay>
                    <source src="${videoPath}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            `;
            
            modal.classList.add('active');
        });
    });

    // Close modal when clicking outside or on close button
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('story-modal-close')) {
            modal.classList.remove('active');
            const video = modal.querySelector('video');
            if (video) {
                video.pause();
            }
        }
    });
}); 