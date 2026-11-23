// Runs as early as possible to set data-theme before first paint
// Injected into every *.html file
(function () {
    try {
        const saved = localStorage.getItem('ufo_theme');
        const prefersDark = window.matchMedia &&
            matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = (saved === 'light' || saved === 'dark')
            ? saved
            : (prefersDark ? 'dark' : 'light');

        document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
    }
})();
