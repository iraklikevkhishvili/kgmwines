export const Keys = {
    Enter: 'Enter',
    Space: 'Space',
    ArrowUp: 'ArrowUp',
    ArrowDown: 'ArrowDown',
    ArrowLeft: 'ArrowLeft',
    ArrowRight: 'ArrowRight',
    Home: 'Home',
    End: 'End',
    Escape: 'Escape',
};

// Normalize browser quirks: ' ', 'Spacebar', 'Esc'
export function normalizeKey(e) {
    const k = e.key;
    if (k === ' ' || k === 'Spacebar') return Keys.Space;
    if (k === 'Esc') return Keys.Escape;
    return k;
}

export function hasModifier(e) {
    return e.ctrlKey || e.altKey || e.metaKey;
}
export function hasAnyShift(e) {
    return !!e.shiftKey;
}

// Don’t hijack typing fields (unless you explicitly opt in)
export function isTypingField(el) {
    if (!el) return false;
    const tag = el.tagName;
    return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        el.isContentEditable ||
        (tag === 'SELECT') // treat selects as typing/own nav
    );
}

/* ---------- Activation (Enter/Space or left click) ---------- */
export function isActivationKey(e) {
    if (hasModifier(e)) return false;
    const k = normalizeKey(e);
    return k === Keys.Enter || k === Keys.Space;
}
export function isActivationClick(e) {
    if (e.type === 'click') return e.button === 0;       // primary mouse
    if (e.type === 'keydown') return isActivationKey(e);
    return false;
}

/* -------------------- Arrows & movement --------------------- */
export function isArrowKey(e) {
    const k = normalizeKey(e);
    return (
        k === Keys.ArrowUp || k === Keys.ArrowDown ||
        k === Keys.ArrowLeft || k === Keys.ArrowRight
    );
}
export function arrowIntent(e) {
    const k = normalizeKey(e);
    if (k === Keys.ArrowUp || k === Keys.ArrowLeft) return -1;
    if (k === Keys.ArrowDown || k === Keys.ArrowRight) return +1;
    return 0;
}
// Horizontal vs vertical axis: 'x' | 'y' | null
export function arrowAxis(e) {
    const k = normalizeKey(e);
    if (k === Keys.ArrowLeft || k === Keys.ArrowRight) return 'x';
    if (k === Keys.ArrowUp || k === Keys.ArrowDown) return 'y';
    return null;
}

/* ---------------- Home/End & Escape helpers ----------------- */
export function isHomeEnd(e) {
    const k = normalizeKey(e);
    return { isHome: k === Keys.Home, isEnd: k === Keys.End };
}
export function isEscape(e) {
    return normalizeKey(e) === Keys.Escape;
}

/* --------------- Small convenience utilities ---------------- */
// Prev/next from arrows only (returns -1/0/+1); ignores modifiers & typing fields
export function prevNext(e) {
    if (hasModifier(e) || isTypingField(e.target)) return 0;
    return arrowIntent(e);
}

// Generic activation handler; handles Space preventDefault to stop page scroll
export function handleActivation(e, onActivate) {
    if (e.type === 'keydown') {
        if (!isActivationKey(e) || isTypingField(e.target)) return;
        // Space scrolls page by default; prevent it on activation
        if (normalizeKey(e) === Keys.Space) e.preventDefault();
        onActivate?.(e);
    } else if (e.type === 'click' && e.button === 0) {
        onActivate?.(e);
    }
}
