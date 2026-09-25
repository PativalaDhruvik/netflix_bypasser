document.addEventListener('DOMContentLoaded', () => {
    const donateBtn = document.getElementById('donateButton');

    if (donateBtn) {
        donateBtn.addEventListener('click', () => {
            const api = typeof browser !== 'undefined' ? browser : chrome;
            api.tabs.create({ url: 'https://buymeacoffee.com/khushwnt' });
        });
    }
});
