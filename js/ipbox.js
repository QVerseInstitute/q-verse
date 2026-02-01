document.querySelectorAll('.ip-box').forEach(btn => {
    btn.addEventListener('click', () => {
        const ip = btn.dataset.ip;

        navigator.clipboard.writeText(ip).then(() => {
            btn.classList.add('copied');
            setTimeout(() => btn.classList.remove('copied'), 500);
        });
    });
});