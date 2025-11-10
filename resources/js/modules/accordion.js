// resources/js/components/accordion.js
import {
    setAriaExpanded,
    setAriaHidden,
    isActivationKey,
    arrowIntent,
    isHomeEnd,
    onEscapeWithin,
} from '../core/a11y/index.js';


const accordionSelector = '[data-accordion]';
const accordionItemSelector = '[data-accordion-item]';
const accordionTriggerSelector = '[data-accordion-trigger]';
const accordionContentSelector = '[data-accordion-content]';


/*======================================================
 Animation + sizing helpers ---------------------------
=======================================================*/
function setMax(panel, px) {
    const v = `${Math.max(0, px)}px`;
    if (panel.style.getPropertyValue('--acc-max') !== v) {
        panel.style.setProperty('--acc-max', v);
    }
}

function measure(panel) {
    return (panel && panel.scrollHeight) || 0;
}

function animateOpen(panel) {
    setMax(panel, measure(panel));
}

function animateClose(panel) {
    setMax(panel, measure(panel));
    requestAnimationFrame(() => setMax(panel, 0));
}

/** If panel is open, keep its --acc-max in sync with current content size. */
function updatePanelMaxHeight(panel) {
    if (panel instanceof HTMLElement && panel.getAttribute('aria-hidden') !== 'true') {
        setMax(panel, measure(panel));
    }
}

/** Recalculate --acc-max for any open ancestor accordion panels (for nesting). */
function syncOpenAncestorPanels(fromEl) {
    let node = fromEl?.parentElement;
    while (node) {
        if (node.matches?.(accordionContentSelector) && node.getAttribute('aria-hidden') === 'false') {
            setMax(node, measure(node));
        }
        node = node.parentElement;
    }
}

/** Run after layout settles (2 rAFs ≈ next paint). */
function afterLayout(cb) {
    requestAnimationFrame(() => requestAnimationFrame(cb));
}

/*======================================================
 Observers ---------------------------------------------
=======================================================*/
function bindResizeObservers(entries) {
    const disposers = [];

    entries.forEach(({panel}) => {
        const ro = new ResizeObserver(() => {
            if (panel.getAttribute('aria-hidden') === 'false') {
                setMax(panel, measure(panel));
                syncOpenAncestorPanels(panel);
            }
        });
        ro.observe(panel);
        disposers.push(() => ro.disconnect());
    });

    const onWin = () => {
        entries.forEach(({panel}) => {
            if (panel.getAttribute('aria-hidden') === 'false') {
                setMax(panel, measure(panel));
                syncOpenAncestorPanels(panel);
            }
        });
    };
    window.addEventListener('resize', onWin);
    disposers.push(() => window.removeEventListener('resize', onWin));

    return () => disposers.forEach((off) => off && off());
}


/*======================================================
 Ancestor snap hook ------------------------------------
=======================================================*/
function msFromTimeString(s) {
    return s.endsWith('ms') ? parseFloat(s) : parseFloat(s || 0) * 1000;
}

function getTransitionMs(el, prop = 'max-height') {
    const cs = getComputedStyle(el);
    const props = cs.transitionProperty.split(',').map((x) => x.trim());
    const durs = cs.transitionDuration.split(',').map((x) => x.trim());
    const dels = cs.transitionDelay.split(',').map((x) => x.trim());
    const len = Math.max(props.length, durs.length, dels.length);
    let best = 0;
    for (let i = 0; i < len; i++) {
        const p = props[i] || props[props.length - 1] || 'all';
        const dur = msFromTimeString(durs[i] || durs[durs.length - 1] || '0s');
        const del = msFromTimeString(dels[i] || dels[dels.length - 1] || '0s');
        if (p === prop || p === 'all') best = Math.max(best, dur + del);
    }
    return best;
}

function getOpenAncestorPanels(fromEl) {
    const list = [];
    let node = fromEl?.parentElement;
    while (node) {
        if (node.matches?.(accordionContentSelector) && node.getAttribute('aria-hidden') === 'false') {
            list.push(node);
        }
        node = node.parentElement;
    }
    return list;
}

function snapAncestorsDuring(panel, run) {
    const ancestors = getOpenAncestorPanels(panel);
    if (!ancestors.length) {
        run?.();
        return;
    }
    if (panel._accSnap && typeof panel._accSnap.cleanup === 'function') {
        panel._accSnap.cleanup();
    }
    ancestors.forEach((p) => p.style.setProperty('--acc-dur', '0s'));

    let done = false;
    const onEnd = (e) => {
        if (e.propertyName === 'max-height') cleanup();
    };
    const fallbackMs = Math.max(200, getTransitionMs(panel, 'max-height') + 50);
    const fallback = setTimeout(() => cleanup(), fallbackMs);

    function cleanup() {
        if (done) return;
        done = true;
        ancestors.forEach((p) => p.style.removeProperty('--acc-dur'));
        panel.removeEventListener('transitionend', onEnd);
        clearTimeout(fallback);
        panel._accSnap = null;
    }

    panel.addEventListener('transitionend', onEnd);
    panel._accSnap = {cleanup};

    run?.();
}


/*======================================================
 Query + state helpers----------------------------------
=======================================================*/
function getAccordionEntries(root) {
    const items = Array.from(root.querySelectorAll(accordionItemSelector))
        .filter((item) => item.closest(accordionSelector) === root);

    return items
        .map((item) => {
            const trigger = item.querySelector(accordionTriggerSelector);
            const panel = item.querySelector(accordionContentSelector);
            if (!trigger || !panel) return null;
            return {item, trigger, panel};
        })
        .filter(Boolean);
}

function entryForNode(node, entries) {
    if (!node) return null;
    const el = node.closest?.(accordionItemSelector);
    if (!el) return null;
    return entries.find((e) => e.item === el) || null;
}

function setInitialState(root, entries) {
    entries.forEach(({item, trigger, panel}) => {
        const isOpen =
            trigger.getAttribute('aria-expanded') === 'true' ||
            panel.getAttribute('aria-hidden') === 'false' ||
            item.classList.contains('is-open');

        setAriaExpanded(trigger, isOpen);
        setAriaHidden(panel, !isOpen);
        item.classList.toggle('is-open', isOpen);
        setMax(panel, isOpen ? measure(panel) : 0);
    });
}

/**========================================================
 * Toggle one entry (returns final open state) ------------
 * =======================================================*/
function toggleEntry(entry, forceOpen) {
    const {item, trigger, panel} = entry;
    const open = forceOpen ?? trigger.getAttribute('aria-expanded') !== 'true';

    setAriaExpanded(trigger, open);
    setAriaHidden(panel, !open);
    item.classList.toggle('is-open', open);

    snapAncestorsDuring(panel, () => {
        open ? animateOpen(panel) : animateClose(panel);
    });

    afterLayout(() => {
        updatePanelMaxHeight(panel);
        syncOpenAncestorPanels(panel);
    });

    return open;
}

function closeAll(entries) {
    entries.forEach((e) => toggleEntry(e, false));
}

/**========================================================
 * Mouse + keyboard events --------------------------------
 * =======================================================*/
function bindClickHandling(root, entries) {
    const onClick = (event) => {
        const trigger = event.target.closest(accordionTriggerSelector);
        if (!trigger) return;
        if (trigger.closest(accordionSelector) !== root) return;

        const entry = entries.find((e) => e.trigger === trigger);
        if (!entry) return;

        const mode = root.getAttribute('data-accordion'); // 'single' | 'multiple' | null
        const willOpen = trigger.getAttribute('aria-expanded') !== 'true';

        if (willOpen && mode === 'single') {
            entries.forEach((other) => {
                if (other !== entry) toggleEntry(other, false);
            });
        }

        toggleEntry(entry, willOpen);
        afterLayout(() => syncOpenAncestorPanels(entry.panel));
    };

    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
}

function bindKeyboardNavigation(root, entries) {
    const triggers = entries.map((e) => e.trigger);

    const onKeyDown = (event) => {
        const target = event.target;
        if (!triggers.includes(target)) return;
        if (target.closest(accordionSelector) !== root) return;

        // Enter / Space toggles
        if (isActivationKey(event)) {
            event.preventDefault();
            target.click();
            return;
        }

        // Arrow navigation (RTL/vertical agnostic via intent)
        const intent = arrowIntent(event);
        if (intent !== 0) {
            event.preventDefault();
            const i = triggers.indexOf(target);
            const next = triggers[(i + intent + triggers.length) % triggers.length];
            next?.focus();
            return;
        }

        // Home / End jump
        const {isHome, isEnd} = isHomeEnd(event);
        if (isHome || isEnd) {
            event.preventDefault();
            (isHome ? triggers[0] : triggers[triggers.length - 1])?.focus();
        }
    };

    root.addEventListener('keydown', onKeyDown);
    return () => root.removeEventListener('keydown', onKeyDown);
}

/**
 * ESC closes the relevant panel:
 *  - If focus is on a trigger: close that trigger’s panel (if open).
 *  - If focus is inside a panel: close the owning panel and move focus back to its trigger.
 *  In 'single' mode with no focused item’s panel open, does nothing.
 */
function bindEscapeClose(root, entries) {
    const off = onEscapeWithin(
        root,
        (e) => {
            const active = document.activeElement;
            let entry = null;

            // Focus on trigger?
            if (active && active.matches?.(accordionTriggerSelector)) {
                entry = entries.find((en) => en.trigger === active) || null;
                if (entry && entry.trigger.getAttribute('aria-expanded') === 'true') {
                    e.preventDefault();
                    toggleEntry(entry, false);
                    return;
                }
            }

            // Focus inside a panel?
            const panel = active?.closest?.(accordionContentSelector);
            if (panel) {
                entry = entries.find((en) => en.panel === panel) || null;
                if (entry && entry.panel.getAttribute('aria-hidden') === 'false') {
                    e.preventDefault();
                    toggleEntry(entry, false);
                    // Return focus to owning trigger
                    entry.trigger.focus({preventScroll: true});
                    return;
                }
            }
        },
        {prevent: true, stop: true, ignoreInInputs: true},
    );

    return off;
}

/* -------------------- Setup / Init -------------------- */
function setupAccordion(root) {
    if (!(root instanceof Element)) return;
    if (root.dataset.accordionInit === 'true') return;

    const entries = getAccordionEntries(root);
    if (entries.length === 0) {
        root.dataset.accordionInit = 'true';
        return;
    }

    setInitialState(root, entries);

    const disposers = [];
    disposers.push(bindClickHandling(root, entries));
    disposers.push(bindKeyboardNavigation(root, entries));
    disposers.push(bindEscapeClose(root, entries));
    disposers.push(bindResizeObservers(entries));

    root.dataset.accordionInit = 'true';
    root._accDispose = () => disposers.forEach((off) => off && off());
}

export function initAccordion(context = document) {
    const scope =
        context instanceof Element || context instanceof DocumentFragment ? context : document;
    scope.querySelectorAll(accordionSelector).forEach(setupAccordion);
}

// Auto-init for static pages
document.addEventListener('DOMContentLoaded', () => initAccordion(document));
