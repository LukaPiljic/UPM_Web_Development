// Injects a shared top navigation bar into every page.
// Renders the same HTML into <div id="topbar"> (present on each page)
(function () {
    function htmlTopbar() {
        return `
<div class="topbar">
  <div class="title">U.P.M. / <strong>UFO Battle</strong></div>

  <nav class="nav">
    <a href="index.html"       data-nav="index">Home <i class="fa-solid fa-house"></i></a>
    <a href="preferences.html" data-nav="preferences">Preferences <i class="fa-solid fa-gear"></i></a>
    <a href="play.html"        data-nav="play">Play <i class="fa-solid fa-play"></i></a>
    <a href="records.html"     data-nav="records">Records <i class="fa-regular fa-circle-dot"></i></a>
  </nav>

  <div class="right">
    <button class="btn-icon" id="btnTheme" title="Toggle theme">
      <i class="fa-solid fa-moon"></i>
    </button>

    <span class="status" id="authStatus">Not logged in</span>
    <nav class="nav">
      <a href="register.html">Register <i class="fa-solid fa-user"></i></a>
      <a href="login.html" id="loginLink">Login <i class="fa-solid fa-right-to-bracket"></i></a>
    </nav>
  </div>
</div>`;
    }

    function setActiveNav() {
        const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
        const key = file.replace('.html', '');
        const el = document.querySelector(`.topbar a[data-nav="${key}"]`);
        if (el) el.classList.add('active');
    }

    // Mount the topbar once the DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        const mount = document.getElementById('topbar');
        if (!mount) return;
        mount.innerHTML = htmlTopbar();
        setActiveNav();
        if (window.API?.updateAuthUI) window.API.updateAuthUI();
    });
})();
