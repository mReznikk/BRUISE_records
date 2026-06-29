function showAgreement() {
    let agreement = localStorage.getItem('agreement');
    let overlay = document.getElementById('agreement-overlay');
    let btn = document.getElementById('agreement-btn');
    btn.addEventListener('click', function () {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
        localStorage.setItem('agreement', 1);
    });
    if (agreement == 0 || !agreement) {
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        return;
    }

};

document.addEventListener('DOMContentLoaded', showAgreement);

function updateCountdown() {
    let target = new Date('2026-08-01T00:00:00'); // change to your release date
    let now = new Date();
    let diff = target - now;

    if (diff <= 0) {
        document.getElementById('countdown').textContent = 'УЖЕ ВЫШЛО';
        return;
    }

    let d = Math.floor(diff / (1000 * 60 * 60 * 24));
    let h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    let m = Math.floor((diff / (1000 * 60)) % 60);
    let s = Math.floor((diff / 1000) % 60);

    document.getElementById('countdown').textContent =
        `${d}Н ${String(h).padStart(2, '0')}Д ${String(m).padStart(2, '0')}Ч ${String(s).padStart(2, '0')}С`;
}

setInterval(updateCountdown, 1000);
updateCountdown();

// Poster stack reveal on scroll
(function () {
    let section = document.querySelector('.manifest-posters');
    let posters = document.querySelectorAll('.poster');
    let total = posters.length;

    if (!section || total === 0) return;

    function update() {
        let rect = section.getBoundingClientRect();
        let viewportHeight = window.innerHeight;

        // Total range the section spends "in view": from entering at the
        // bottom (rect.top = viewportHeight) to exiting at the top
        // (rect.top = -rect.height).
        let range = viewportHeight + rect.height;

        // progress = 0 when section just enters from below,
        // progress = 1 when section has fully scrolled past above.
        let progress = (viewportHeight - rect.top) / range;
        progress = Math.min(Math.max(progress, 0), 1);

        let activeCount = Math.round(progress * total);

        posters.forEach((poster, i) => {
            poster.classList.toggle('active', i < activeCount);
        });
    }

    window.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    update();
})();