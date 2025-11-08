// Focusable selector (covers links, buttons, inputs, etc.)
export const FOCUSABLE_SEL = [
    'a[href]:not([tabindex="-1"])',
    'area[href]:not([tabindex="-1"])',
    'button:not([disabled]):not([tabindex="-1"])',
    'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])',
    'select:not([disabled]):not([tabindex="-1"])',
    'textarea:not([disabled]):not([tabindex="-1"])',
    '[contenteditable="true"]:not([tabindex="-1"])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

export const hasInert = 'inert' in HTMLElement.prototype;

// --- ARIA/state helpers ---
export function setExpanded(el, expanded) {
    el.setAttribute('aria-expanded', String(expanded));
}
export function setHidden(el, hidden) {
    el.setAttribute('aria-hidden', String(hidden));
    if (hidden) el.setAttribute('hidden', ''); else el.removeAttribute('hidden');
}
export function setDisabledFocusWithin(container, disabled = true) {
    container.querySelectorAll(FOCUSABLE_SEL).forEach(node => {
        if (disabled) {
            if (!node.hasAttribute('data-prev-tabindex') && node.hasAttribute('tabindex')) {
                node.setAttribute('data-prev-tabindex', node.getAttribute('tabindex'));
            }
            node.setAttribute('tabindex', '-1');
        } else {
            if (node.hasAttribute('data-prev-tabindex')) {
                node.setAttribute('tabindex', node.getAttribute('data-prev-tabindex'));
                node.removeAttribute('data-prev-tabindex');
            } else {
                node.removeAttribute('tabindex');
            }
        }
    });
}

// --- Focus utils ---
export function focusFirst(container) {
    const el = container.querySelector(FOCUSABLE_SEL);
    if (el) el.focus();
}
export function getFocusable(container) {
    return Array.from(container.querySelectorAll(FOCUSABLE_SEL));
}

// --- Focus trap (for dialogs, menus) ---
export function trapFocus(container) {
    const focusables = getFocusable(container);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    function onKeydown(e) {
        if (e.key !== 'Tab') return;
        if (focusables.length === 0) { e.preventDefault(); return; }
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus();
        }
    }
    container.addEventListener('keydown', onKeydown);
    return () => container.removeEventListener('keydown', onKeydown); // disposer
}

// --- Inert rest of the page (for dialogs) ---
export function setPageInert(root, inert = true) {
    const siblings = Array.from(document.body.children).filter(n => n !== root);
    siblings.forEach(el => {
        if (inert && hasInert) {
            el.inert = true;
        } else if (inert) {
            el.setAttribute('aria-hidden', 'true');
            setDisabledFocusWithin(el, true);
        } else {
            if (hasInert) el.inert = false;
            else {
                el.removeAttribute('aria-hidden');
                setDisabledFocusWithin(el, false);
            }
        }
    });
}

// --- Keyboard helper ---
export const Keys = {
    Enter: 'Enter', Space: ' ', Spacebar: 'Spacebar',
    ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown',
    ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight',
    Home: 'Home', End: 'End', Escape: 'Escape',
};
export function isActivationKey(e) {
    return e.key === Keys.Enter || e.key === Keys.Space || e.key === Keys.Spacebar;
}

// --- Live region announcer (optional) ---
let live;
export function announce(msg) {
    if (!live) {
        live = document.createElement('div');
        live.setAttribute('aria-live', 'polite');
        live.setAttribute('aria-atomic', 'true');
        live.style.cssText = 'position:absolute;left:-9999px;height:1px;width:1px;overflow:hidden;';
        document.body.appendChild(live);
    }
    live.textContent = ''; // force change
    setTimeout(() => { live.textContent = msg; }, 10);
}
