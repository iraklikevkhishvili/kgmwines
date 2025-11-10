// js/a11y/inert.js
import { setDisabledFocusWithin } from './focusable.js';
import { setAriaHidden } from './aria.js';

export const hasInert = 'inert' in HTMLElement.prototype;

/* --------------------------- internal bookkeeping --------------------------- */
// Track previous aria-hidden so we can restore it exactly
const prevAria = new WeakMap(); // el -> { had: boolean, val: string|null }
// Reference counts so multiple overlays can safely share inerted siblings
const inertCounts = new WeakMap(); // el -> number

function topLevelUnderBody(el) {
    let n = el;
    while (n && n.parentElement && n.parentElement !== document.body) n = n.parentElement;
    return n || el;
}

function getCount(el) {
    return inertCounts.get(el) || 0;
}
function setCount(el, v) {
    inertCounts.set(el, v);
}

function applyInertFallback(el, makeInert) {
    if (makeInert) {
        // snapshot aria-hidden only once
        if (!prevAria.has(el)) {
            prevAria.set(el, { had: el.hasAttribute('aria-hidden'), val: el.getAttribute('aria-hidden') });
        }
        setAriaHidden(el, true);
        setDisabledFocusWithin(el, true);
    } else {
        // only restore when refcount hits zero (done by caller)
        const rec = prevAria.get(el);
        if (rec) {
            if (rec.had) setAriaHidden(el, rec.val);
            else setAriaHidden(el, null);
            prevAria.delete(el);
        } else {
            setAriaHidden(el, null);
        }
        setDisabledFocusWithin(el, false);
    }
}

function incInert(el) {
    const next = getCount(el) + 1;
    setCount(el, next);
    if (hasInert) {
        el.inert = true;             // property (no attribute churn)
    } else if (next === 1) {
        applyInertFallback(el, true);
    }
}

function decInert(el) {
    const next = Math.max(0, getCount(el) - 1);
    setCount(el, next);
    if (hasInert) {
        el.inert = next > 0;
    } else if (next === 0) {
        applyInertFallback(el, false);
    }
}

/**
 * Lock scroll position when inert.
 */
function lockScrollOn() {
    const c = +(document.body.dataset.scrollLockCount || 0);
    document.body.dataset.scrollLockCount = String(c + 1);
    if (c > 0) return; // already locked by someone else

    const y = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.dataset.scrollY = String(y);

    // Prevent layout shift, keep width, and pin the body
    document.documentElement.style.overflow = 'hidden'; // prevent iOS overscroll
    document.body.style.position = 'fixed';
    document.body.style.top = `-${y}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
}

function lockScrollOff() {
    const c = +(document.body.dataset.scrollLockCount || 0);
    const next = Math.max(0, c - 1);
    document.body.dataset.scrollLockCount = String(next);
    if (next > 0) return; // someone else still holds the lock

    const y = +(document.body.dataset.scrollY || 0);

    // Clear styles first, then restore scroll
    document.documentElement.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';

    // Restore without animation
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, y);
    document.documentElement.style.scrollBehavior = prev || '';
}


/* --------------------------------- API --------------------------------- */
/**
 * Inert all <body> children except the provided root(s).
 * - Works even if roots are nested deeply; we normalize to their top-level body child.
 * - Safe for multiple overlapping "page inert" calls via refcounts.
 * - Returns a disposer that fully restores prior states.
 *
 * @param {HTMLElement|HTMLElement[]} rootOrRoots
 * @param {boolean} inert - default true (set inert). The disposer always restores.
 * @param {{lockScroll?: boolean}} options
 * @returns {() => void} disposer
 */
export function setPageInert(rootOrRoots, inert = true, { lockScroll = false } = {}) {
    const roots = (Array.isArray(rootOrRoots) ? rootOrRoots : [rootOrRoots]).filter(Boolean);
    if (roots.length === 0) return () => {};

    // Normalize to the top-level elements directly under <body>
    const topLevelRoots = [...new Set(roots.map(topLevelUnderBody))];
    const siblings = Array.from(document.body.children).filter(el => !topLevelRoots.includes(el));

    // Apply or remove once, but the disposer will always remove our layer
    if (inert) siblings.forEach(incInert);
    else       siblings.forEach(decInert);

    // Optional scroll lock (fixed-body technique to avoid scroll jump)
    if (lockScroll && inert) lockScrollOn();
    if (lockScroll && !inert) lockScrollOff();


    // Disposer: always remove *this* inert layer and scroll lock
    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        siblings.forEach(decInert);
        if (lockScroll) lockScrollOff();
    };
}
