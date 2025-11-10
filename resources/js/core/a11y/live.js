let liveNode = null;

export function announce(msg) {
    if (!msg) return;

    if (!liveNode) {
        liveNode = document.createElement('div');
        liveNode.setAttribute('role', 'status');
        liveNode.setAttribute('aria-live', 'polite');
        liveNode.setAttribute('aria-atomic', 'true');
        liveNode.style.cssText = 'position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;';
        document.body.appendChild(liveNode);
    }
    liveNode.textContent = '';
    setTimeout(() => { if (liveNode) liveNode.textContent = String(msg); }, 10);
}
