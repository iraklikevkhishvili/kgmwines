// tiny DOM helpers
export const qs = (sel, ctx = document) => ctx.querySelector(sel);
export const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// event delegation: one listener on root, reacts only for matches
export function delegate(root, type, selector, handler) {
    root.addEventListener(type, (e) => {
        const el = e.target.closest(selector);
        if (el && root.contains(el)) handler(e, el);
    });
}
