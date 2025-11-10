// js/a11y/aria.js

/* --------------------------- internal helpers --------------------------- */

function setAttrIfChanged(el, name, value) {
    if (!el) return null;
    const v = value === undefined || value === null ? null : String(value);
    const cur = el.getAttribute(name);
    if (v === null) {
        if (cur !== null) el.removeAttribute(name);
    } else if (cur !== v) {
        el.setAttribute(name, v);
    }
    return el;
}

function reflectBoolean(el, name, on) {
    return setAttrIfChanged(el, name, on ? 'true' : 'false');
}

/** Ensure an element has a stable id and return it. */
export function ensureId(el, prefix = 'uid') {
    if (!el) return '';
    if (!el.id) el.id = `${prefix}-${Math.random().toString(36).slice(2)}`;
    return el.id;
}

/* ------------------------------ core states ----------------------------- */

export function setAriaExpanded(el, expanded) {
    return reflectBoolean(el, 'aria-expanded', !!expanded);
}

export function setAriaHidden(el, hidden) {
    return reflectBoolean(el, 'aria-hidden', !!hidden);
}

export function setAriaDisabled(el, disabled) {
    // Note: separate from the native [disabled] attribute.
    return reflectBoolean(el, 'aria-disabled', !!disabled);
}

export function setAriaSelected(el, selected) {
    return reflectBoolean(el, 'aria-selected', !!selected);
}

export function setAriaPressed(el, pressed) {
    return reflectBoolean(el, 'aria-pressed', !!pressed);
}

export function setAriaBusy(el, busy) {
    return reflectBoolean(el, 'aria-busy', !!busy);
}

export function setAriaReadOnly(el, readOnly) {
    return reflectBoolean(el, 'aria-readonly', !!readOnly);
}

/** Convenience for native [hidden] + aria-hidden.
 *  Use carefully with animations (set [hidden] after transitions).
 */
export function setHidden(el, hidden) {
    if (!el) return null;
    setAriaHidden(el, !!hidden);
    // If you animate close, delay this until transitionend.
    el.toggleAttribute('hidden', !!hidden);
    return el;
}

/* --------------------------- relationships ------------------------------ */

export function setAriaHasPopup(el, type /* 'menu'|'listbox'|'dialog'|... */) {
    // If truthy but no specific type is provided, default to boolean true.
    if (!el) return null;
    if (!type) return reflectBoolean(el, 'aria-haspopup', true);
    return setAttrIfChanged(el, 'aria-haspopup', type);
}

/** Link a control to a region: trigger[aria-controls] ↔ panel[id].
 *  Optionally back-link with panel[aria-labelledby]=trigger.id
 */
export function linkControls(trigger, panel, { labelledby = true } = {}) {
    if (!trigger || !panel) return null;
    const pid = ensureId(panel, 'region');
    setAttrIfChanged(trigger, 'aria-controls', pid);
    if (labelledby) {
        const tid = ensureId(trigger, 'ctrl');
        setAttrIfChanged(panel, 'aria-labelledby', tid);
    }
    return { trigger, panel };
}

/** Set aria-activedescendant on a container to point at an active item. */
export function setActiveDescendant(container, activeEl) {
    if (!container) return null;
    if (!activeEl) return setAttrIfChanged(container, 'aria-activedescendant', null);
    const id = ensureId(activeEl, 'item');
    return setAttrIfChanged(container, 'aria-activedescendant', id);
}

/* -------------------------- labelling & hints --------------------------- */

export function setAriaLabel(el, label /* string|null */) {
    return setAttrIfChanged(el, 'aria-label', label ?? null);
}

export function setAriaLabelledBy(el, idOrEl /* Element|string|null */) {
    if (!el) return null;
    if (!idOrEl) return setAttrIfChanged(el, 'aria-labelledby', null);
    const id = typeof idOrEl === 'string' ? idOrEl : ensureId(idOrEl, 'lbl');
    return setAttrIfChanged(el, 'aria-labelledby', id);
}

export function setAriaDescribedBy(el, ids /* string|Element|Array|Set|null */) {
    if (!el) return null;
    if (!ids) return setAttrIfChanged(el, 'aria-describedby', null);
    const list = Array.isArray(ids) || ids instanceof Set ? Array.from(ids) : [ids];
    const idStr = list
        .map(x => (typeof x === 'string' ? x : ensureId(x, 'desc')))
        .filter(Boolean)
        .join(' ');
    return setAttrIfChanged(el, 'aria-describedby', idStr || null);
}

/* ------------------------------ tiny guards ----------------------------- */

/** Dev-time sanity checks (call in non-prod builds). */
export function assertControlPair(trigger, panel) {
    if (!trigger || !panel) return false;
    const ctrlId = trigger.getAttribute('aria-controls');
    const pid = panel.id;
    if (!ctrlId || ctrlId !== pid) {
        // eslint-disable-next-line no-console
        console.warn('aria.js: trigger[aria-controls] must match panel[id]', { trigger, panel, ctrlId, pid });
        return false;
    }
    const labelledBy = panel.getAttribute('aria-labelledby');
    if (!labelledBy) {
        console.warn('aria.js: panel should reference its trigger via aria-labelledby', { panel, trigger });
    }
    return true;
}
