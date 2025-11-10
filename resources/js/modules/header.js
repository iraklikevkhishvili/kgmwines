import {
    setAriaExpanded,
    setAriaHidden,
    setAriaHasPopup,
    linkControls,
    ensureId,
    focusElement,
    getFirst,
    getTabbable,
    focusFirst,
    setDisabledFocusWithin,
    Keys,
    setEscapeEnabled,
    registerEscape,
    onClickOutside,
    getNext,
    getPrev,
    setPageInert,
    onEscapeWithin,
    isActivationKey,
    trapFocus,
} from '../core/a11y/index.js';

document.addEventListener('DOMContentLoaded', () => {

    const header = document.querySelector('.header');
    const btnOpen = document.querySelector('.header__toggle-open');
    const btnClose = document.querySelector('.header__toggle-close');
    const headerNav = document.querySelector('.header-nav-wrapper');

    if (!header || !btnOpen || !btnClose || !headerNav) return;


    // --- Relationships & initial state ---
    // Make sure the nav has an ID and link the opener to it for SRs.
    ensureId(headerNav, 'nav');
    linkControls(btnOpen, headerNav);           // sets aria-controls + aria-labelledby
    setAriaHasPopup(btnOpen, 'menu');


    // Initial mirror of state: closed nav
    setAriaExpanded(btnOpen, false);
    setAriaHidden(headerNav, true);
    header.classList.remove('open');
    headerNav.classList.remove('open');


    let undoInert;
    let disposeEsc;
    let releaseFocusTrap;
    let offOutside;

    // --- Open / Close handlers ---
    function openNav() {
        // If you animate, reveal first so the panel can measure/transition.
        setAriaHidden(headerNav, false);
        setAriaExpanded(btnOpen, true);
        header.classList.add('open');
        headerNav.classList.add('open');

        // Inert the rest of the page + lock scroll
        undoInert = setPageInert(headerNav, true, {lockScroll: true});
        disposeEsc = registerEscape(() => closeNav(), {
            header,
            ignoreInInputs: true
        });
        releaseFocusTrap = trapFocus(headerNav, {
            initialFocus: btnClose,
            fallbackFocus: btnClose,
            returnFocus: false,
        });
        offOutside = onClickOutside(headerNav, () => closeNav(), {
            exclude: [btnOpen, headerNav],
            capture: true
        });
        // Move focus after inerting so tab can't escape
        focusElement(btnClose, {defer: 'auto'});
    }

    function closeNav() {
        setAriaExpanded(btnOpen, false);
        setAriaHidden(headerNav, true);
        header.classList.remove('open');
        headerNav.classList.remove('open');

        // Restore inert + scroll
        if (typeof undoInert === 'function') {
            undoInert();
            undoInert = null;
        }
        if (typeof disposeEsc === 'function') {
            disposeEsc();
            disposeEsc = null;
        }
        if (typeof offOutside === 'function') {
            offOutside();
            offOutside = null;
        }
        if (typeof releaseFocusTrap === 'function') {
            releaseFocusTrap();
            releaseFocusTrap = null;
        }

        focusElement(btnOpen, {defer: 'auto'});
    }

    btnOpen.addEventListener('click', openNav);
    btnClose.addEventListener('click', closeNav);
    //btnOpen.addEventListener('mouseover', openNav);
});


const NAV_ROOT = 'nav[data-navigation]';
const ACC = {
    trigger: '[data-accordion-trigger]',
    panel: '[data-accordion-content]',
};
const ROW = '.header-nav__parent, .header-nav__submenu-parent';
const LINK = 'a.header-nav__link, a.header-nav__submenu-link';

/* ---------- utils ---------- */
function depth(el) {
    let d = 0, n = el;
    while (n && n.parentElement) {
        d++;
        n = n.parentElement;
    }
    return d;
}

function closeTriggers(triggers) {
    [...triggers]
        .sort((a, b) => depth(b) - depth(a))
        .forEach(t => t.getAttribute('aria-expanded') === 'true' && t.click());
}

function collapseAll(root) {
    const open = root.querySelectorAll(`${ACC.trigger}[aria-expanded="true"]`);
    closeTriggers(open);
}

function panelForTrigger(trigger) {
    const id = trigger.getAttribute('aria-controls');
    return id ? document.getElementById(id) : null;
}

function closeDescendantsOf(panel) {
    if (!panel) return;
    const open = panel.querySelectorAll(`${ACC.trigger}[aria-expanded="true"]`);
    closeTriggers(open);
}

/* ---------- 1) when a parent panel closes, close its descendants ---------- */
function bindCloseChildrenOnParentClose(nav) {
    const onClickCapture = (e) => {
        const trigger = e.target.closest(ACC.trigger);
        if (!trigger || !nav.contains(trigger)) return;

        // Only act when this click is about to CLOSE the current panel
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        if (!isOpen) return;

        const panel = panelForTrigger(trigger);
        closeDescendantsOf(panel);
    };
    nav.addEventListener('click', onClickCapture, true);
    return () => nav.removeEventListener('click', onClickCapture, true);
}

/* ---------- 2) ESC collapses all  |  3) click outside collapses all ---------- */
function bindGlobalCollapsers(nav) {
    const offEsc = onEscapeWithin(nav, () => collapseAll(nav), {
        prevent: true, stop: true, ignoreInInputs: true,
    });
    const offOutside = onClickOutside(nav, () => collapseAll(nav));
    return () => {
        offEsc();
        offOutside();
    };
}

/* ---------- 4) row/link behavior based on open/closed ---------- */
function bindRowAndLinkBehavior(nav) {
    // Row click: if CLOSED, row toggles; if OPEN, row does nothing (link remains live)
    const onRowClick = (e) => {
        const row = e.target.closest(ROW);
        if (!row || !nav.contains(row)) return;

        const trigger = row.querySelector(ACC.trigger);
        if (!trigger) return;

        // Don’t hijack explicit toggle button clicks
        if (e.target.closest(ACC.trigger)) return;

        const isOpen = trigger.getAttribute('aria-expanded') === 'true';

        if (!isOpen) {
            // Closed: row acts as toggle; suppress link navigation if the link was hit
            const link = row.querySelector(LINK);
            if (link && (e.target === link || link.contains(e.target))) {
                e.preventDefault();
            }
            e.stopPropagation();
            trigger.click();
        }
        // Open: row is inert; link is active; do nothing
    };

    // Links: when CLOSED, Enter/Space toggle instead of navigating
    const onLinkKeydown = (e) => {
        const link = e.target.closest(LINK);
        if (!link || !nav.contains(link)) return;

        const row = link.closest(ROW);
        const trigger = row?.querySelector(ACC.trigger);
        if (!trigger) return;

        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        if (!isOpen && isActivationKey(e)) {
            e.preventDefault();
            e.stopPropagation();
            trigger.click();
        }
    };

    nav.addEventListener('click', onRowClick);
    nav.addEventListener('keydown', onLinkKeydown);

    return () => {
        nav.removeEventListener('click', onRowClick);
        nav.removeEventListener('keydown', onLinkKeydown);
    };
}

/* ---------- init ---------- */
export function initHeaderNav(context = document) {
    const nav = (context instanceof Element ? context : document).querySelector(NAV_ROOT);
    if (!nav || nav.dataset.headerNavInit === 'true') return;

    const disposers = [
        bindCloseChildrenOnParentClose(nav),
        bindGlobalCollapsers(nav),
        bindRowAndLinkBehavior(nav),
    ];

    nav.dataset.headerNavInit = 'true';
    nav._headerNavDispose = () => disposers.forEach(off => off && off());
}

document.addEventListener('DOMContentLoaded', () => initHeaderNav());
