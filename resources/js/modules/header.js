document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const btnOpen = document.querySelector('.header__toggle-open');
    const btnClose = document.querySelector('.header__toggle-close');
    const headerNav = document.querySelector('.header-nav');

    function toggleNav() {
        btnOpen.addEventListener('click', () => {
            headerNav.classList.add('open');
            header.classList.add('open');
        });
        btnClose.addEventListener('click', () => {
            headerNav.classList.remove('open');
            header.classList.remove('open');
        });
    }
toggleNav();
});
