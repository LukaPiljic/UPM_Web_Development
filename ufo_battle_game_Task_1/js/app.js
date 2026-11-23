// Shared app helpers (Prefs + header)
(function (global) {

    const PREF_KEYS = {ufos: 'prefs.ufos', time: 'prefs.time', dbl: 'prefs.double'};
    const Prefs = {};

    /**
     * Load preferences from localStorage with validation & sane defaults.
     * - ufos: only 1, 5, or 9 are valid (default: 5)
     * - time: only 60, 120, or 180 seconds (default: 60)
     * - doubleSpeed: boolean flag
     */

    Prefs.load = () => {
        const ufos = parseInt(localStorage.getItem(PREF_KEYS.ufos) ?? '5', 10);
        const time = parseInt(localStorage.getItem(PREF_KEYS.time) ?? '60', 10);
        const dbl = (localStorage.getItem(PREF_KEYS.dbl) ?? 'false') === 'true';
        return {
            ufos: [1, 5, 9].includes(ufos) ? ufos : 5,
            time: [60, 120, 180].includes(time) ? time : 60,
            doubleSpeed: !!dbl
        };
    };

        //Save preferences to localStorage.
        Prefs.save = (p) => {
        localStorage.setItem(PREF_KEYS.ufos, String(p.ufos));
        localStorage.setItem(PREF_KEYS.time, String(p.time));
        localStorage.setItem(PREF_KEYS.dbl, String(!!p.doubleSpeed));
    };
    global.Prefs = Prefs;
})(window);

// init header auth state
window.addEventListener('DOMContentLoaded', () => {
    if (window.API && window.API.updateAuthUI) window.API.updateAuthUI();
});

// THEME HANDLING
(function () {
    const THEME_KEY = 'ufo_theme';

    // Default berücksichtigen, wenn wir noch nichts gewählt haben
    const prefersDark = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch {
        }
        updateThemeButton(theme);
    }

    function currentTheme() {
        try {
            const saved = localStorage.getItem(THEME_KEY);
            if (saved === 'light' || saved === 'dark') return saved;
        } catch {
        }
        return prefersDark() ? 'dark' : 'light';  // Startzustand
    }

    function updateThemeButton(theme) {
        const btn = document.getElementById('btnTheme');
        if (!btn) return;
        const icon = btn.querySelector('i');
        const text = btn.querySelector('span');
        if (theme === 'dark') {
            icon.className = 'fa-solid fa-moon';
            if (text) text.textContent = 'Dark';
            btn.title = 'Switch to light mode';
            btn.setAttribute('aria-label', 'Switch to light mode');
        } else {
            icon.className = 'fa-solid fa-sun';
            if (text) text.textContent = 'Light';
            btn.title = 'Switch to dark mode';
            btn.setAttribute('aria-label', 'Switch to dark mode');
        }
    }

    // Bootstrap theme handling once DOM is ready.
    document.addEventListener('DOMContentLoaded', () => {
        applyTheme(currentTheme());

        const btn = document.getElementById('btnTheme');
        if (btn) {
            btn.addEventListener('click', () => {
                const next = (document.documentElement.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
                applyTheme(next);
            });
        }

        // 3) If no manual theme is stored, follow OS changes live (that's optional)
        if (!localStorage.getItem(THEME_KEY) && window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                applyTheme(e.matches ? 'dark' : 'light');
            });
        }
    });
})();
