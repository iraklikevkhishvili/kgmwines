// js/a11y/trap.js
import { focusElement, focusFirst, getTabbable } from './focusable.js';

const trapStack = [];
let listenersBound = false;

function trapDocument(trap) {
    return trap.root?.ownerDocument || document;
}

function currentTrap() {
    return trapStack.length ? trapStack[trapStack.length - 1] : null;
}

function resolveTarget(target, trap) {
    if (!target) return null;
    if (typeof target === 'function') {
        try {
            return target(trap.root, trap);
        } catch (err) {
            return null;
        }
    }
    if (typeof target === 'string') {
        return trap.root ? trap.root.querySelector(target) : document.querySelector(target);
    }
    return target instanceof HTMLElement ? target : null;
}

function syncLastFocused(trap) {
    const doc = trapDocument(trap);
    const active = doc.activeElement;
    if (active instanceof HTMLElement && trap.root?.contains(active)) {
        trap.lastFocused = active;
        return true;
    }
    return false;
}

function focusInitial(trap, explicitInitial) {
    if (!trap.root || trap.paused) return;
    const initial = explicitInitial ?? trap.options.initialFocus;

    const tryFocus = (target) => {
        const resolved = resolveTarget(target, trap);
        if (!resolved) return false;
        const didFocus = focusElement(resolved, { preventScroll: true });
        if (didFocus) syncLastFocused(trap);
        return didFocus;
    };

    if (tryFocus(initial)) return;
    if (focusFirst(trap.root, { fallbackToContainer: false })) {
        if (syncLastFocused(trap)) return;
    }
    if (tryFocus(trap.options.fallbackFocus)) return;
    if (trap.options.fallbackToRoot !== false) {
        if (focusElement(trap.root, { preventScroll: true, ensureTabbable: true })) {
            syncLastFocused(trap);
        }
    }
}

function restorePreviousFocus(trap) {
    const prev = trap.previousFocused;
    if (prev && prev.isConnected) {
        focusElement(prev, { preventScroll: true });
    }
    trap.previousFocused = null;
}

function allowOutsideFocus(trap, event) {
    const { allowOutsideFocus } = trap.options;
    if (!allowOutsideFocus) return false;
    if (typeof allowOutsideFocus === 'function') {
        try {
            return !!allowOutsideFocus(event, trap);
        } catch (err) {
            return false;
        }
    }
    return !!allowOutsideFocus;
}

function redirectFocus(trap, { direction = null } = {}) {
    if (!trap.root || trap.paused) return;
    if (!trap.root.isConnected) return;

    const doc = trapDocument(trap);
    const active = doc.activeElement;
    if (active instanceof HTMLElement && trap.root.contains(active)) {
        trap.lastFocused = active;
        return;
    }

    const tabbables = getTabbable(trap.root);
    let target = null;

    if (trap.lastFocused && trap.root.contains(trap.lastFocused)) {
        target = trap.lastFocused;
    }

    if (!target && direction) {
        if (direction === 'backward' && tabbables.length) target = tabbables[tabbables.length - 1];
        if (direction === 'forward' && tabbables.length) target = tabbables[0];
    }

    if (!target && tabbables.length) {
        target = direction === 'backward' ? tabbables[tabbables.length - 1] : tabbables[0];
    }

    if (!target) {
        target = resolveTarget(trap.options.fallbackFocus, trap);
    }

    if (!target && trap.options.fallbackToRoot !== false) {
        target = trap.root;
    }

    if (target) {
        focusElement(target, { preventScroll: true, ensureTabbable: true });
        syncLastFocused(trap);
    }
}

function internalPause(trap) {
    trap._internalPauseCount += 1;
    if (!trap.paused) {
        trap.paused = true;
        trap.options.onPause?.(trap);
    }
}

function internalResume(trap) {
    if (trap._internalPauseCount > 0) trap._internalPauseCount -= 1;
    if (trap._internalPauseCount === 0 && !trap._userPaused && trap.paused) {
        trap.paused = false;
        trap.options.onResume?.(trap);
        redirectFocus(trap);
    }
}

function pushTrap(trap) {
    const current = currentTrap();
    if (current && current !== trap) internalPause(current);
    trapStack.push(trap);
    bindListeners();
}

function removeTrap(trap) {
    const idx = trapStack.indexOf(trap);
    if (idx === -1) return;
    const wasTop = idx === trapStack.length - 1;
    trapStack.splice(idx, 1);
    if (wasTop) {
        const next = currentTrap();
        if (next) internalResume(next);
    }
    if (trapStack.length === 0) unbindListeners();
}

function onKeyDown(e) {
    const trap = currentTrap();
    if (!trap || !trap.active || trap.paused) return;
    if (e.key !== 'Tab' || e.metaKey || e.altKey || e.ctrlKey) return;

    const { root } = trap;
    if (!root || !root.isConnected) {
        trap.deactivate({ returnFocus: false });
        return;
    }

    const tabbables = getTabbable(root);
    if (!tabbables.length) {
        e.preventDefault();
        redirectFocus(trap);
        return;
    }

    const doc = trapDocument(trap);
    const active = doc.activeElement;
    const first = tabbables[0];
    const last = tabbables[tabbables.length - 1];
    const within = active instanceof HTMLElement && root.contains(active);

    if (e.shiftKey) {
        if (!within || active === first) {
            e.preventDefault();
            focusElement(last, { preventScroll: true });
            trap.lastFocused = last;
        }
    } else if (!within || active === last) {
        e.preventDefault();
        focusElement(first, { preventScroll: true });
        trap.lastFocused = first;
    }
}

function onFocusIn(e) {
    const trap = currentTrap();
    if (!trap || !trap.active || trap.paused) return;

    const { root } = trap;
    if (!root || !root.isConnected) {
        trap.deactivate({ returnFocus: false });
        return;
    }

    const target = e.target;
    if (target instanceof HTMLElement && root.contains(target)) {
        trap.lastFocused = target;
        return;
    }

    if (allowOutsideFocus(trap, e)) return;

    queueMicrotask(() => redirectFocus(trap));
}

function bindListeners() {
    if (listenersBound) return;
    listenersBound = true;
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('focusin', onFocusIn, true);
}

function unbindListeners() {
    if (!listenersBound) return;
    listenersBound = false;
    document.removeEventListener('keydown', onKeyDown, true);
    document.removeEventListener('focusin', onFocusIn, true);
}

export function createFocusTrap(root, options = {}) {
    const trap = {
        root,
        options: {
            initialFocus: null,
            fallbackFocus: null,
            returnFocus: true,
            fallbackToRoot: true,
            allowOutsideFocus: false,
            ...options,
        },
        active: false,
        paused: false,
        lastFocused: null,
        previousFocused: null,
        _internalPauseCount: 0,
        _userPaused: false,
    };

    trap.activate = ({ initialFocus } = {}) => {
        if (trap.active || !trap.root) return;
        const doc = trapDocument(trap);
        const active = doc.activeElement;
        trap.previousFocused = active instanceof HTMLElement ? active : null;
        trap.active = true;
        trap.paused = false;
        trap._internalPauseCount = 0;
        trap._userPaused = false;
        pushTrap(trap);
        focusInitial(trap, initialFocus);
        trap.options.onActivate?.(trap);
    };

    trap.deactivate = ({ returnFocus } = {}) => {
        if (!trap.active) return;
        trap.active = false;
        removeTrap(trap);
        trap.options.onDeactivate?.(trap);
        const shouldReturn = returnFocus ?? trap.options.returnFocus;
        if (shouldReturn) restorePreviousFocus(trap);
        trap.lastFocused = null;
    };

    trap.pause = () => {
        if (!trap.active) return;
        trap._userPaused = true;
        if (!trap.paused) {
            trap.paused = true;
            trap.options.onPause?.(trap);
        }
    };

    trap.resume = () => {
        if (!trap.active) return;
        trap._userPaused = false;
        if (trap._internalPauseCount === 0 && trap.paused) {
            trap.paused = false;
            trap.options.onResume?.(trap);
            redirectFocus(trap);
        }
    };

    trap.updateRoot = (nextRoot) => {
        if (!nextRoot || nextRoot === trap.root) return;
        trap.root = nextRoot;
        if (trap.active && !trap.paused) {
            redirectFocus(trap);
        }
    };

    return trap;
}

export function trapFocus(root, options) {
    const trap = createFocusTrap(root, options);
    trap.activate();
    return () => trap.deactivate();
}

export function getActiveFocusTrap() {
    return currentTrap();
}
