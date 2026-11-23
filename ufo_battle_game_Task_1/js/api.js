// Basic API client for the UFO Battle practice
(function (global) {
    //has to be port 10000
    // URL of the game backend (users, login, global records). Not included in this repository.
    const API_BASE = 'http://localhost:10000';
    const AUTH_KEYS = {user: 'auth.user', token: 'auth.token', at: 'auth.at'};
    const API = {};

    function loadAuth() {
        return {
            user: localStorage.getItem(AUTH_KEYS.user) || null,
            token: localStorage.getItem(AUTH_KEYS.token) || null,
            at: parseInt(localStorage.getItem(AUTH_KEYS.at) || '0', 10) || 0
        };
    }

    function saveAuth(a) {
        if (a && a.token) {
            localStorage.setItem(AUTH_KEYS.user, a.user || '');
            localStorage.setItem(AUTH_KEYS.token, a.token);
            localStorage.setItem(AUTH_KEYS.at, String(Date.now()));
        } else {
            localStorage.removeItem(AUTH_KEYS.user);
            localStorage.removeItem(AUTH_KEYS.token);
            localStorage.removeItem(AUTH_KEYS.at);
        }
    }

    API.getAuth = () => loadAuth();


        // - If token exists, the "Login" link becomes a "Logout" button (client-side).
        //  - On logout we clear storage, refresh the status, and show a tiny alert.
        API.updateAuthUI = () => {
        const AUTH = loadAuth();
        const status = document.getElementById('authStatus');
        const loginLink = document.getElementById('loginLink');
        if (status) status.textContent = (AUTH && AUTH.token) ? `Logged in as ${AUTH.user}` : 'Not logged in';
        if (loginLink) {
            loginLink.textContent = (AUTH && AUTH.token) ? 'Logout' : 'Login';
            loginLink.onclick = (ev) => {
                if (API.getAuth().token) {
                    ev.preventDefault();
                    saveAuth(null);
                    API.updateAuthUI();
                    alert('Logged out');
                }
            };
        }
    };


    // MAIN fetch logic
    API.fetch = async (path, {method = 'GET', headers = {}, body = null, expectJson = true} = {}) => {
        const AUTH = loadAuth();
        const res = await fetch(API_BASE + path, {
            method,
            headers: {...headers, ...(AUTH.token ? {'Authorization': AUTH.token} : {})},
            body,
            mode: 'cors'
        });
        const newTok = res.headers.get('Authorization');
        if (newTok) saveAuth({user: AUTH.user, token: newTok, at: Date.now()});
        if (!res.ok) {
            const t = await res.text().catch(() => '');
            throw new Error(`HTTP ${res.status}: ${t || res.statusText}`);
        }
        if (!expectJson) return res;
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) return res.json();
        const raw = await res.text();
        try {
            return JSON.parse(raw);
        } catch {
            return raw;
        }
    };

    //login helper
    API.login = async (username, password) => {
        const url = `${API_BASE}/users/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
        const res = await fetch(url, {method: 'GET', mode: 'cors'});
        const headerTok = res.headers.get('Authorization');
        let token = headerTok;
        const text = await res.text();
        if (!res.ok) throw new Error(text || res.statusText);
        if (!token && text) token = text.replace(/^\"|\"$/g, ''); // handle quoted string body
        if (!token) throw new Error('No token received');
        saveAuth({user: username, token, at: Date.now()});
        API.updateAuthUI();
        return token;
    };

    global.API = API;
})(window);
