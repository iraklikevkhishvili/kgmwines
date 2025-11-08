import { setExpanded, setHidden, isActivationKey, Keys } from '../core/a11y.js';

// resources/js/accordion-min.js
/*
document.addEventListener('DOMContentLoaded', () => {
    // Optional: initial ARIA sanity (safe if attributes already exist)
    document.querySelectorAll('[data-accordion-item]').forEach((item) => {
        const btn = item.querySelector('[data-accordion-trigger]');
        const panel = item.querySelector('[data-accordion-content]');
        if (!btn || !panel) return;
        if (!btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', 'false');
        if (!panel.hasAttribute('aria-hidden')) panel.setAttribute('aria-hidden', 'true');
    });

    // One delegated listener for all accordions
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-accordion-trigger]');
        if (!btn) return;

        const item = btn.closest('[data-accordion-item]');
        const root = btn.closest('[data-accordion]');
        const panel = item && item.querySelector('[data-accordion-content]');
        if (!item || !root || !panel) return;

        const willOpen = btn.getAttribute('aria-expanded') !== 'true';

        // If single-mode, close others first
        if (willOpen && root.getAttribute('data-accordion') === 'single') {
            root.querySelectorAll('[data-accordion-item]').forEach((i) => {
                if (i === item) return;
                i.classList.remove('is-open');
                i.querySelectorAll('[data-accordion-trigger]').forEach((t) => t.setAttribute('aria-expanded', 'false'));
                i.querySelectorAll('[data-accordion-content]').forEach((p) => p.setAttribute('aria-hidden', 'true'));
            });
        }

        // Toggle current
        btn.setAttribute('aria-expanded', String(willOpen));
        panel.setAttribute('aria-hidden', String(!willOpen));
        item.classList.toggle('is-open', willOpen);
    });

    // Optional: keyboard support for Enter/Space on custom elements
    document.addEventListener('keydown', (e) => {
        const btn = e.target.closest('[data-accordion-trigger]');
        if (!btn) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            btn.click();
        }
    });
});

document.querySelectorAll('[data-accordion-item]').forEach(item => {
    const panel = item.querySelector('[data-accordion-content]');
    const btn = item.querySelector('[data-accordion-trigger]');

    // set closed state initially
    panel.style.setProperty('--acc-max', panel.scrollHeight + 'px');
    if (panel.getAttribute('aria-hidden') !== 'false') {
        panel.setAttribute('aria-hidden', 'true');
    }

    btn.addEventListener('click', () => {
        const open = panel.getAttribute('aria-hidden') === 'false';
        if (!open) {
            // measure each time in case content changed
            panel.style.setProperty('--acc-max', panel.scrollHeight + 'px');
            panel.setAttribute('aria-hidden', 'false');
        } else {
            panel.setAttribute('aria-hidden', 'true');
        }
    });
});
*/


function initAccordion(root) {
    const items = Array.from(root.querySelectorAll('[data-accordion-item]'));
    const triggers = items.map(i => i.querySelector('[data-accordion-trigger]'));
    const panels = items.map(i => i.querySelector('[data-accordion-content]'));

    function toggle(i, force) {
        const open = force ?? (triggers[i].getAttribute('aria-expanded') !== 'true');
        setExpanded(triggers[i], open);
        setHidden(panels[i], !open);
        // (If animating height, do it here without breaking aria)
    }

    // Single mode: close siblings
    function openSingle(i) {
        triggers.forEach((_, idx) => toggle(idx, idx === i));
    }

    triggers.forEach((btn, i) => {
        btn.addEventListener('click', () => openSingle(i));
        btn.addEventListener('keydown', (e) => {
            if (isActivationKey(e)) { e.preventDefault(); openSingle(i); return; }
            if (e.key === Keys.ArrowDown) { e.preventDefault(); (triggers[i+1] ?? triggers[0]).focus(); }
            if (e.key === Keys.ArrowUp)   { e.preventDefault(); (triggers[i-1] ?? triggers[triggers.length-1]).focus(); }
            if (e.key === Keys.Home) { e.preventDefault(); triggers[0].focus(); }
            if (e.key === Keys.End)  { e.preventDefault(); triggers[triggers.length-1].focus(); }
        });
    });

    // Initial state (closed)
    //panels.forEach(p => setHidden(p, true));
    //triggers.forEach(t => setExpanded(t, false));
}

initAccordion();




/*document.addEventListener('DOMContentLoaded', () => {
    // Utility: focusable elements (for inert fallback)
    const focusableSel = [
        'a[href]',
        'area[href]',
        'button:not([disabled])',
        'input:not([disabled]):not([type="hidden"])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[contenteditable="true"]',
        '[tabindex]'
    ].join(',');

    const hasInert = 'inert' in HTMLElement.prototype;

    function setFocusableDisabled(container, disabled) {
        container.querySelectorAll(focusableSel).forEach(el => {
            if (disabled) {
                if (!el.hasAttribute('data-prev-tabindex') && el.hasAttribute('tabindex')) {
                    el.setAttribute('data-prev-tabindex', el.getAttribute('tabindex'));
                }
                el.setAttribute('tabindex', '-1');
            } else {
                if (el.hasAttribute('data-prev-tabindex')) {
                    el.setAttribute('tabindex', el.getAttribute('data-prev-tabindex'));
                    el.removeAttribute('data-prev-tabindex');
                } else if (el.getAttribute('tabindex') === '-1') {
                    el.removeAttribute('tabindex');
                }
            }
        });
    }

    // Root scoping helpers
    function getRootItems(root) {
        return Array.from(root.querySelectorAll('[data-accordion-item]'))
            .filter(i => i.closest('[data-accordion]') === root);
    }
    function getRootButtons(root) {
        return Array.from(root.querySelectorAll('[data-accordion-trigger]'))
            .filter(b => b.closest('[data-accordion]') === root && b.closest('[data-accordion-item]'));
    }
    function getDirectParts(item) {
        const btn = item.querySelector(':scope [data-accordion-trigger]');
        const panel = item.querySelector(':scope [data-accordion-content]');
        return { btn, panel };
    }

    // Height utilities
    function measureForOpen(panel) {
        panel.style.setProperty('--acc-max', panel.scrollHeight + 'px');
    }
    function setAuto(panel) {
        panel.style.setProperty('--acc-max', 'max-content'); // or 'none'
    }
    function isAuto(panel) {
        const v = panel.style.getPropertyValue('--acc-max').trim();
        return v === 'max-content' || v === 'none';
    }

    // Swap to auto AFTER open transition
    function cancelAuto(panel) {
        if (panel._accAutoTimer) {
            clearTimeout(panel._accAutoTimer);
            panel._accAutoTimer = null;
        }
        if (panel._accAutoEndHandler) {
            panel.removeEventListener('transitionend', panel._accAutoEndHandler);
            panel._accAutoEndHandler = null;
        }
    }

    function scheduleAuto(panel, delay = 300) {
        cancelAuto(panel);

        // Prefer transitionend (exact), fall back to a timer
        const handler = (e) => {
            if (e && e.propertyName !== 'max-height') return;
            cancelAuto(panel);
            // Only auto if still open
            if (panel.getAttribute('aria-hidden') === 'false') {
                setAuto(panel);
            }
        };
        panel._accAutoEndHandler = handler;
        panel.addEventListener('transitionend', handler, { once: true });

        panel._accAutoTimer = setTimeout(handler, delay + 50);
    }

    // Re-measure this panel and all open ancestor panels so outer max-heights stay correct
    function refreshOpenAncestors(startPanel) {
        let p = startPanel;
        while (p && p instanceof HTMLElement) {
            if (p.matches('[data-accordion-content]')) {
                if (p.getAttribute('aria-hidden') === 'false') {
                    // If ancestor is already auto, keep it auto (no need to force px)
                    if (!isAuto(p)) measureForOpen(p);
                }
            }
            const next = p.parentElement ? p.parentElement.closest('[data-accordion-content]') : null;
            p = next;
        }
    }

    // (Optional) burst syncing kept as-is if you still want it
    function cancelBurst(panel) {
        if (panel && panel._accBurstRaf) {
            cancelAnimationFrame(panel._accBurstRaf);
            panel._accBurstRaf = null;
        }
    }
    function burstAncestors(panel, duration = 380) {
        cancelBurst(panel);
        const start = performance.now();
        const tick = (now) => {
            refreshOpenAncestors(panel);
            if (now - start < duration && panel.isConnected) {
                panel._accBurstRaf = requestAnimationFrame(tick);
            } else {
                panel._accBurstRaf = null;
            }
        };
        panel._accBurstRaf = requestAnimationFrame(tick);
    }

    function openItem(item) {
        const { btn, panel } = getDirectParts(item);
        if (!btn || !panel) return;

        btn.setAttribute('aria-expanded', 'true');
        panel.setAttribute('aria-hidden', 'false');

        // Animate from 0 -> px height, then settle to auto so nested changes are instant
        measureForOpen(panel);
        scheduleAuto(panel, 300);
        burstAncestors(panel, 380);

        if (hasInert) panel.inert = false;
        else setFocusableDisabled(panel, false);
    }

    function closeItem(item) {
        const { btn, panel } = getDirectParts(item);
        if (!btn || !panel) return;

        btn.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true');

        // If it was auto, lock it to px first so collapse animates
        if (isAuto(panel)) {
            panel.style.setProperty('--acc-max', panel.scrollHeight + 'px');
            // force reflow to ensure transition picks up
            // eslint-disable-next-line no-unused-expressions
            panel.offsetHeight;
        }
        cancelAuto(panel);
        // Now animate to 0
        panel.style.setProperty('--acc-max', '0px');

        const parentPanel = panel.parentElement ? panel.parentElement.closest('[data-accordion-content]') : null;
        if (parentPanel) burstAncestors(parentPanel, 220);

        if (hasInert) panel.inert = true;
        else setFocusableDisabled(panel, true);
    }

    function toggleItem(item, willOpen, root) {
        if (willOpen && root?.getAttribute('data-accordion') === 'single') {
            getRootItems(root).forEach(i => { if (i !== item) closeItem(i); });
        }
        willOpen ? openItem(item) : closeItem(item);
    }

    // Keep --acc-max fresh on actual content resizes (images, etc.)
    const ro = 'ResizeObserver' in window ? new ResizeObserver(entries => {
        for (const entry of entries) {
            const panel = entry.target;
            const isHidden = panel.getAttribute('aria-hidden') === 'true';
            if (!isHidden) {
                if (!isAuto(panel)) {
                    // during opening animation, track px height
                    measureForOpen(panel);
                }
                // if already auto, no need to touch (it will adapt naturally)
                refreshOpenAncestors(panel);
            }
        }
    }) : null;

    // Initialize each accordion root
    document.querySelectorAll('[data-accordion]').forEach(root => {
        const items = getRootItems(root);

        items.forEach(item => {
            const { btn, panel } = getDirectParts(item);
            if (!btn || !panel) return;

            if (!btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', 'false');
            if (!panel.hasAttribute('aria-hidden')) panel.setAttribute('aria-hidden', 'true');

            // Initial measurement: if open at load, go straight to auto; else set px for closed/open logic
            const isOpen = btn.getAttribute('aria-expanded') === 'true' || panel.getAttribute('aria-hidden') === 'false';
            if (isOpen) {
                setAuto(panel); // already open -> no pixel measuring; nested changes will be instant
            } else {
                panel.style.setProperty('--acc-max', '0px'); // closed initial state
            }

            if (hasInert) panel.inert = !isOpen;
            else setFocusableDisabled(panel, !isOpen);

            if (ro) ro.observe(panel);

            // If panels contain images that load later, update on load
            panel.querySelectorAll('img').forEach(img => {
                img.addEventListener('load', () => {
                    if (panel.getAttribute('aria-hidden') === 'false') {
                        if (!isAuto(panel)) measureForOpen(panel);
                        refreshOpenAncestors(panel);
                    }
                });
            });
        });

        // Click (delegated) — scope strictly to this root
        root.addEventListener('click', e => {
            const btn = e.target.closest('[data-accordion-trigger]');
            if (!btn) return;
            if (btn.closest('[data-accordion]') !== root) return;

            const item = btn.closest('[data-accordion-item]');
            if (!item || item.closest('[data-accordion]') !== root) return;

            const willOpen = btn.getAttribute('aria-expanded') !== 'true';
            toggleItem(item, willOpen, root);
        });

        // Keyboard (delegated)
        root.addEventListener('keydown', e => {
            const currentBtn = e.target.closest('[data-accordion-trigger]');
            if (!currentBtn || currentBtn.closest('[data-accordion]') !== root) return;

            const allBtns = getRootButtons(root);
            const idx = allBtns.indexOf(currentBtn);
            if (idx === -1) return;

            switch (e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    currentBtn.click();
                    break;
                case 'ArrowDown':
                case 'ArrowRight': {
                    e.preventDefault();
                    const next = allBtns[(idx + 1) % allBtns.length];
                    next?.focus();
                    break;
                }
                case 'ArrowUp':
                case 'ArrowLeft': {
                    e.preventDefault();
                    const prev = allBtns[(idx - 1 + allBtns.length) % allBtns.length];
                    prev?.focus();
                    break;
                }
                case 'Home':
                    e.preventDefault();
                    allBtns[0]?.focus();
                    break;
                case 'End':
                    e.preventDefault();
                    allBtns[allBtns.length - 1]?.focus();
                    break;
                default:
                    break;
            }
        });

        // Optional: if a nested panel starts changing max-height, keep ancestors synced during open animation
        root.addEventListener('transitionrun', (e) => {
            const t = e.target;
            if (!(t instanceof HTMLElement)) return;
            if (!t.matches('[data-accordion-content]')) return;
            if (e.propertyName !== 'max-height') return;
            burstAncestors(t, 320);
        });
    });
});*/
