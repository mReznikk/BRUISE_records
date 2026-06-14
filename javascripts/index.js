(function () {
    const overlay = document.getElementById('agreement-overlay');
    const btn = document.getElementById('agreement-btn');

    document.body.style.overflow = 'hidden';

    btn.addEventListener('click', function () {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    });
})();

function updateCountdown() {
    const target = new Date('2026-07-01T00:00:00'); // change to your release date
    const now = new Date();
    const diff = target - now;

    if (diff <= 0) {
        document.getElementById('countdown').textContent = 'УЖЕ ВЫШЛО';
        return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    document.getElementById('countdown').textContent =
        `${d}D ${String(h).padStart(2,'0')}H ${String(m).padStart(2,'0')}M ${String(s).padStart(2,'0')}S`;
}

setInterval(updateCountdown, 1000);
updateCountdown();

// --- Poster stack reveal on scroll ---
(function () {
    const section = document.querySelector('.manifest-posters');
    const posters = document.querySelectorAll('.poster');
    const total = posters.length;

    if (!section || total === 0) return;

    function update() {
        const rect = section.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Total range the section spends "in view": from entering at the
        // bottom (rect.top = viewportHeight) to exiting at the top
        // (rect.top = -rect.height).
        const range = viewportHeight + rect.height;

        // progress = 0 when section just enters from below,
        // progress = 1 when section has fully scrolled past above.
        let progress = (viewportHeight - rect.top) / range;
        progress = Math.min(Math.max(progress, 0), 1);

        const activeCount = Math.round(progress * total);

        posters.forEach((poster, i) => {
            poster.classList.toggle('active', i < activeCount);
        });
    }

    window.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    update();
})();