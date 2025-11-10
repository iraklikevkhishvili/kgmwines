export function onClickOutside(
    root,
    handler,
    {
        capture = true,
        exclude = [],          // HTMLElement|Array<HTMLElement>
        signal,                // optional AbortSignal
        ignoreModifiers = true // ignore ctrl/alt/meta/shift clicks
    } = {}
) {
    if (!root) return () => {};

    const excluded = Array.isArray(exclude) ? exclude.filter(Boolean) : [exclude].filter(Boolean);

    const isWithin = (e) => {
        const path = typeof e.composedPath === 'function' ? e.composedPath() : null;
        const inRoot = path ? path.some(n => n instanceof Node && root.contains(n)) :
            (e.target instanceof Node && root.contains(e.target));
        const inExcluded = excluded.some(el => {
            if (!el) return false;
            return path
                ? path.some(n => n instanceof Node && el.contains(n))
                : (e.target instanceof Node && el.contains(e.target));
        });
        return inRoot || inExcluded;
    };

    let armed = false; // arm after one frame to avoid immediate false positives
    const arm = () => { armed = true; };
    const rAF = requestAnimationFrame(arm);

    const onPointerDown = (e) => {
        if (!armed) return;
        if (ignoreModifiers && (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey)) return;
        if (e.button !== 0) return; // left/primary only
        if (!root.isConnected) { cleanup(); return; }
        if (!isWithin(e)) handler(e);
    };

    document.addEventListener('pointerdown', onPointerDown, { capture });

    const cleanup = () => {
        cancelAnimationFrame(rAF);
        document.removeEventListener('pointerdown', onPointerDown, { capture });
    };

    if (signal) {
        if (signal.aborted) cleanup();
        else signal.addEventListener('abort', cleanup, { once: true });
    }

    return cleanup;
}
