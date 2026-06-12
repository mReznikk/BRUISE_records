(function () {
    const overlay = document.getElementById('agreement-overlay');
    const btn = document.getElementById('agreement-btn');

    document.body.style.overflow = 'hidden';

    btn.addEventListener('click', function () {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    });
})();