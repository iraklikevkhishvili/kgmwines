// js/a11y/focusable.js

// 1) Selector for *potentially* focusable things (before filtering)
export const FOCUSABLE_SEL = [
    'a[href]',
    'area[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'summary',
    'iframe',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]',                     // presence is enough
    '[tabindex]'                             // includes 0 and negatives (filtered later)
].join(',');

// 2) Quick checks used in filters
function hasHiddenAttribute(el) {
    return el.hasAttribute('hidden') || el.getAttribute('aria-hidden') === 'true';
}
function inInertSubtree(el) {
    return !!el.closest?.('[inert]');
}
function isDisabledByFieldset(el) {
    // Ignore if not form-associated or no disabled fieldset ancestor
    const fs = el.closest?.('fieldset[disabled]');
    if (!fs) return false;
    // First legend inside the disabled fieldset can contain enabled controls
    const firstLegend = fs.querySelector('legend');
    return !(firstLegend && firstLegend.contains(el));
}
function isDisplayed(el) {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    // If `offsetParent` is null and position !== fixed, likely not displayed
    if (el.offsetParent === null && style.position !== 'fixed') {
        // still allow elements that report client rects (e.g., transforms)
        if (el.getClientRects().length === 0) return false;
    }
    return true;
}

// 3) Visibility filter (fast path first)
export function isVisible(node) {
    if (!(node instanceof HTMLElement)) return false;
    if (hasHiddenAttribute(node)) return false;
    if (!isDisplayed(node)) return false;
    // Also ensure no inert ancestor
    if (inInertSubtree(node)) return false;
    return true;
}

// 4) Focusability / Tabbability predicates
export function isFocusable(el) {
    if (!(el instanceof HTMLElement)) return false;
    if (!isVisible(el)) return false;
    if (isDisabledByFieldset(el)) return false;

    // Presence of [tabindex] with any integer value means focusable programmatically.
    // Native controls are already filtered above (disabled/hidden/fieldset).
    return true;
}

export function isTabbable(el) {
    if (!isFocusable(el)) return false;
    // Tabbable only when tabIndex >= 0
    return el.tabIndex >= 0;
}

// 5) Collections
export function getFocusable(container) {
    if (!container) return [];
    const nodes = container.querySelectorAll(FOCUSABLE_SEL);
    return Array.from(nodes).filter(isFocusable);
}

/**
 * Returns tabbables in correct tab order:
 *  1) All with positive tabindex, ascending
 *  2) Then DOM-order items with tabindex === 0 (or no tabindex which resolves to 0)
 */
export function getTabbable(container) {
    const focusables = getFocusable(container);
    const pos = [];
    const zero = [];
    for (const el of focusables) {
        const t = el.tabIndex;
        if (t > 0) pos.push(el);
        else if (t === 0) zero.push(el);
    }
    pos.sort((a, b) => a.tabIndex - b.tabIndex);
    return pos.concat(zero);
}

// 6) Navigation helpers
export function getFirst(container) {
    const list = getTabbable(container);
    return list[0] || null;
}
export function getLast(container) {
    const list = getTabbable(container);
    return list.length ? list[list.length - 1] : null;
}
export function getNext(container, current) {
    const list = getTabbable(container);
    const i = list.indexOf(current);
    return i >= 0 && i + 1 < list.length ? list[i + 1] : null;
}
export function getPrev(container, current) {
    const list = getTabbable(container);
    const i = list.indexOf(current);
    return i > 0 ? list[i - 1] : null;
}

// 7) Focus utilities
export function focusFirst(container, { fallbackToContainer = true } = {}) {
    const el = getFirst(container) || null;
    if (el) {
        el.focus?.({ preventScroll: true });
        return true;
    }
    if (fallbackToContainer && container?.focus) {
        if (!container.hasAttribute('tabindex')) {
            container.setAttribute('tabindex', '-1');
            container.dataset.a11yTmpFocus = '1';
        }
        container.focus({ preventScroll: true });
        return true;
    }
    return false;
}

// 8) Temporarily disable focusability inside a container
const prevTabindex = new WeakMap();
/** Sets tabindex="-1" on currently focusable descendants, stores original values, restores later. */
export function setDisabledFocusWithin(container, disabled = true) {
    if (!container) return;
    const nodes = getFocusable(container);

    nodes.forEach(node => {
        if (disabled) {
            if (!prevTabindex.has(node)) {
                prevTabindex.set(node, node.hasAttribute('tabindex') ? node.getAttribute('tabindex') : null);
            }
            node.setAttribute('tabindex', '-1');
        } else if (prevTabindex.has(node)) {
            const prev = prevTabindex.get(node);
            if (prev === null) node.removeAttribute('tabindex');
            else node.setAttribute('tabindex', prev);
            prevTabindex.delete(node);
        }
    });

    if (!disabled && container.dataset?.a11yTmpFocus === '1') {
        container.removeAttribute('tabindex');
        delete container.dataset.a11yTmpFocus;
    }
}

/**
 * Focus a specific element reliably.
 * - defer: 'none' | 'raf' | 'auto'
 * - ensureTabbable: temporarily add tabindex="-1" if needed
 * Returns true if a focus attempt was made (not necessarily that the UA moved focus).
 */
export function focusElement(el, {
    preventScroll = true,
    defer = 'auto',
    ensureTabbable = true,
} = {}) {
    if (!(el instanceof HTMLElement)) return false;

    const doFocus = () => {
        let addedTempTabindex = false;
        if (ensureTabbable && el.tabIndex < 0) {
            el.setAttribute('tabindex', '-1');
            el.dataset.a11yTmpFocus = '1';
            addedTempTabindex = true;
        }
        el.focus({ preventScroll });

        // Cleanup temporary tabindex on microtask (after focus is processed)
        if (addedTempTabindex) {
            queueMicrotask(() => {
                if (el.dataset?.a11yTmpFocus === '1') {
                    el.removeAttribute('tabindex');
                    delete el.dataset.a11yTmpFocus;
                }
            });
        }
        return true;
    };

    // Decide when to run
    if (defer === 'none') {
        return doFocus();
    }

    if (defer === 'raf') {
        requestAnimationFrame(doFocus);
        return true;
    }

    // 'auto': try now; if not yet focusable/visible, try next frame
    if (isFocusable(el)) {
        return doFocus();
    }
    requestAnimationFrame(doFocus);
    return true;
}
