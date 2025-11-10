// escape.js
import { isEscape } from './keys.js';

let _escInit = false;
const _escStack = []; // { root, handler, ignoreInInputs, prevent, stop, ignoreRepeats, enabled:true, dispose }
const _escItems = new Map(); // disposer -> item
function isEditable(el) {
    if (!(el instanceof HTMLElement)) return false;
    const tag = el.tagName;
    return el.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

function inRoot(e, root) {
    if (!root) return true;
    const path = typeof e.composedPath === 'function' ? e.composedPath() : null;
    if (path) return path.some(node => node instanceof Node && root.contains(node));
    // fallback if composedPath not available
    const target = e.target;
    const active = document.activeElement;
    return (target instanceof Node && root.contains(target)) || (active instanceof Node && root.contains(active));
}

function _ensureEscInit() {
    if (_escInit) return;
    _escInit = true;

    document.addEventListener('keydown', (e) => {
        if (!isEscape(e) || e.metaKey || e.ctrlKey || e.altKey) return;

        // Walk the stack top-down (last registered wins)
        for (let i = _escStack.length - 1; i >= 0; i--) {
            const item = _escStack[i];
            if (!item || !item.enabled) continue;

            const { root, handler, ignoreInInputs, prevent, stop, ignoreRepeats } = item;

            // prune disconnected roots
            if (root && !root.isConnected) {
                _escItems.delete(item.dispose);
                _escStack.splice(i, 1);
                continue;
            }

            if (ignoreRepeats && e.repeat) continue;
            if (!inRoot(e, root)) continue;

            const tgt = e.target;
            if (ignoreInInputs && isEditable(tgt)) continue;

            if (stop) e.stopPropagation();
            if (prevent) e.preventDefault();
            handler(e);
            break; // only top-most handler fires
        }
    }, true); // capture to beat app-level handlers
}

/** Scoped listener on an element (bubbles inside it). */
export function onEscapeWithin(
    root,
    handler,
    { prevent = true, stop = true, ignoreInInputs = false, ignoreRepeats = true } = {}
) {
    if (!root) return () => {};
    const fn = (e) => {
        if (!isEscape(e) || e.metaKey || e.ctrlKey || e.altKey) return;
        if (ignoreRepeats && e.repeat) return;

        if (!inRoot(e, root)) return;

        if (ignoreInInputs && isEditable(e.target)) return;

        if (stop) e.stopPropagation();
        if (prevent) e.preventDefault();
        handler(e);
    };
    root.addEventListener('keydown', fn);
    return () => root.removeEventListener('keydown', fn);
}

/** Global stacked escape, optionally scoped to a root. Returns an unregister fn. */
export function registerEscape(
    handler,
    {
        root = null,
        ignoreInInputs = true,
        prevent = true,
        stop = true,
        ignoreRepeats = true,
        signal,          // optional AbortSignal
    } = {}
) {
    _ensureEscInit();
    const item = { root, handler, ignoreInInputs, prevent, stop, ignoreRepeats, enabled: true, dispose: null };
    _escStack.push(item);

    const dispose = () => {
        const i = _escStack.indexOf(item);
        if (i >= 0) _escStack.splice(i, 1);
        _escItems.delete(dispose);
    };
    item.dispose = dispose;
    _escItems.set(dispose, item);

    if (signal && typeof signal.addEventListener === 'function') {
        if (signal.aborted) dispose();
        else signal.addEventListener('abort', dispose, { once: true });
    }

    return dispose;
}

/** Temporarily disable/enable a registered escape without removing it. */
export function setEscapeEnabled(disposerOrBool, maybeBool) {
    // convenience: setEscapeEnabled(item, false) or setEscapeEnabled(false) for all
    if (typeof disposerOrBool === 'boolean') {
        const val = disposerOrBool;
        _escStack.forEach(it => { if (it) it.enabled = !!val; });
    } else if (typeof disposerOrBool === 'function') {
        const item = _escItems.get(disposerOrBool);
        if (item) item.enabled = !!maybeBool;
    }
}
