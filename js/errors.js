// One error reporter for boot and gameplay failures. Render messages as text.
window.addEventListener('error', event => {
    const log = document.getElementById('error-log');
    if (!log) return;
    log.style.display = 'block';
    const entry = document.createElement('pre');
    entry.style.whiteSpace = 'pre-wrap';
    entry.textContent = `${event.message}\n${event.filename}:${event.lineno}:${event.colno}`;
    log.appendChild(entry);
});
