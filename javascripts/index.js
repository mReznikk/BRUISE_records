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