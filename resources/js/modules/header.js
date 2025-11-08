document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const btnOpen = document.querySelector('.header__toggle-open');
    const btnClose = document.querySelector('.header__toggle-close');
    const headerNav = document.querySelector('.header-nav');

    function toggleNav() {
        btnOpen.addEventListener('click', () => {
            headerNav.classList.add('open');
            header.classList.add('open');
            headerNav.setAttribute('aria-hidden', 'false');
            btnOpen.setAttribute('aria-expanded', 'true');
        });
        btnClose.addEventListener('click', () => {
            headerNav.classList.remove('open');
            header.classList.remove('open');
            headerNav.setAttribute('aria-hidden', 'true');
        });
    }
toggleNav();
});
