(function () {
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    // Missile-Scaling
    const MISSILE_BASE_W = 12;   // Original-Spritebreite
    const MISSILE_BASE_H = 24;   // Original-Spritehöhe
    const MISSILE_SCALE = 1.8;  // 1.0 = original, >1 = größer

    class Sprite {
        constructor(src) {
            this.img = new Image();
            this.img.src = src;
            this.ready = false;
            this.img.onload = () => {
                this.ready = true;
            };
        }
    }

    /**
     * UFO entity
     * - Moves horizontally and bounces on canvas edges
     * - Draws either a sprite or a vector fallback
     */
    class Ufo {
        constructor(x, y, vx, sprite) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.sprite = sprite;
            this.r = 18;
        }

        update(dt, W) {
            this.x += this.vx * dt;
            if (this.x - this.r < 0) {
                this.x = this.r;
                this.vx = Math.abs(this.vx);
            }
            if (this.x + this.r > W) {
                this.x = W - this.r;
                this.vx = -Math.abs(this.vx);
            }
        }

        draw(ctx) {
            if (this.sprite?.ready) {
                ctx.drawImage(this.sprite.img, this.x - 24, this.y - 18, 48, 36);
            } else { // Fallback-Vektor
                const r = this.r;
                ctx.save();
                ctx.translate(this.x, this.y);
                const g = ctx.createRadialGradient(0, 0, r * .2, 0, 0, r * 1.4);
                g.addColorStop(0, 'rgba(108,160,255,.35)');
                g.addColorStop(1, 'rgba(108,160,255,0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#7ba5ff';
                ctx.beginPath();
                ctx.ellipse(0, r * .25, r * 1.2, r * .5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#cfe0ff';
                ctx.beginPath();
                ctx.arc(0, 0, r * .65, Math.PI, 0);
                ctx.fill();
                ctx.restore();
            }
        }
    }

    /**
     * Missile entity (single shot)
     * - Scales sprite + hitbox together
     * - Moves upward when active, otherwise slides horizontally on the ground
     */
    class Missile {
        constructor(W, H, sprite) {
            this.W = W;
            this.H = H;
            this.baseW = MISSILE_BASE_W;
            this.baseH = MISSILE_BASE_H;
            this.scale = MISSILE_SCALE;

            this.w = Math.round(this.baseW * this.scale);
            this.h = Math.round(this.baseH * this.scale);

            this.speed = 360;
            this.sprite = sprite;
            this.reset();
        }

        reset() {
            this.active = false;
            this.x = this.W / 2 - this.w / 2;
            this.y = this.H - 22 - this.h;
        }

        update(dt) {
            if (this.active) this.y -= this.speed * dt;
        }

        draw(ctx) {
            if (this.sprite?.ready) {
                ctx.drawImage(this.sprite.img, this.x, this.y, this.w, this.h);
            } else {
                ctx.save();
                ctx.fillStyle = '#ffd089';
                ctx.fillRect(this.x, this.y, this.w, this.h);
                ctx.restore();
            }
        }

        moveHoriz(dx, W) {
            if (!this.active) this.x = clamp(this.x + dx, 0, W - this.w);
        }

        get rect() {
            return {x: this.x, y: this.y, w: this.w, h: this.h};
        }
    }

    function rectCircleHit(rect, cx, cy, r) {
        const rx = clamp(cx, rect.x, rect.x + rect.w);
        const ry = clamp(cy, rect.y, rect.y + rect.h);
        const dx = cx - rx, dy = cy - ry;
        return (dx * dx + dy * dy) <= r * r;
    }

    // Game bootstrap (runs after DOM is ready)
    window.addEventListener('DOMContentLoaded', () => {
        const canvas = document.getElementById('game');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const baseSpeed = 80;

        const ufoSprite = new Sprite('assets/img/ufo.png');
        const missileSprite = new Sprite('assets/img/missile.png');

        let prefs = window.Prefs.load();
        let score = 0;
        let timeLeft = prefs.time;
        let initialUfos = prefs.ufos;
        let doubleSpeedEnabled = !!prefs.doubleSpeed;
        let hasDoubledThisWave = false;

        const hudScore = document.getElementById('hudScore');
        const hudTime = document.getElementById('hudTime');
        const hudUfos = document.getElementById('hudUfos');
        const hudSpeed = document.getElementById('hudSpeed');

        const overlayEnd = document.getElementById('overlayEnd');
        const finalScoreEl = document.getElementById('finalScore');
        const saveBtn = document.getElementById('btnSaveRecord');

        const keys = new Set();
        let lastTs;
        let running = true;

        const missile = new Missile(W, H, missileSprite);
        const ufos = [];
        spawnWave();

        // sobald alle UFOs getroffen wurden
        function spawnWave() {
            ufos.length = 0;
            const pad = 24;
            for (let i = 0; i < initialUfos; i++) {
                const x = pad + Math.random() * (W - 2 * pad);
                const y = 60 + Math.random() * 140;
                const dir = Math.random() < 0.5 ? -1 : 1;
                const vx = dir * (baseSpeed + Math.random() * 50);
                ufos.push(new Ufo(x, y, vx, ufoSprite));
            }
            hasDoubledThisWave = false;
        }

        function loop(ts) {
            if (!lastTs) lastTs = ts;
            const dt = Math.min((ts - lastTs) / 1000, 1 / 30);
            lastTs = ts;

            if (running) {
                step(dt);
                render();
                requestAnimationFrame(loop);
            } else {
                render();
            }
        }

        function step(dt) {
            timeLeft = Math.max(0, timeLeft - dt);
            if (timeLeft === 0) {
                endGame();
                return;
            }

            const move =
                !missile.active
                    ? ((keys.has('ArrowRight') || keys.has('KeyD')) ? 1 :
                        (keys.has('ArrowLeft') || keys.has('KeyA')) ? -1 : 0)
                    : 0;
            if (move) missile.moveHoriz(move * 220 * dt, W);

            if (keys.has('Space') && !missile.active) missile.active = true;

            missile.update(dt);
            if (missile.active && (missile.y + missile.h) < 0) {
                score = Math.max(0, score - 25);  // nie unter 0 fallen
                missile.reset();
            }

            for (const u of ufos) u.update(dt, W);

            if (doubleSpeedEnabled && !hasDoubledThisWave) {
                const half = Math.floor(initialUfos / 2);
                if (ufos.length > 0 && ufos.length <= half) {
                    for (const u of ufos) u.vx *= 2;
                    hasDoubledThisWave = true;
                }
            }

            if (missile.active) {
                const R = missile.rect;
                for (let i = ufos.length - 1; i >= 0; --i) {
                    const u = ufos[i];
                    if (rectCircleHit(R, u.x, u.y, u.r)) {
                        score += 100;
                        ufos.splice(i, 1);
                        missile.reset();
                        break;
                    }
                }
            }

            if (ufos.length === 0 && timeLeft > 0) spawnWave();

            hudScore.textContent = String(score);
            hudTime.textContent = String(Math.ceil(timeLeft));
            hudUfos.textContent = String(ufos.length);
            hudSpeed.textContent = (doubleSpeedEnabled && hasDoubledThisWave) ? '2x' : '1x';
        }

        /**
         End-of-game:
         - Apply final scoring rules
         - Show overlay and wire up "Save" if logged in
         */
        function endGame() {
            running = false;

            const divisor = prefs.time / 60;
            let finalScore = Math.round(score / divisor);
            finalScore -= 50 * Math.max(0, initialUfos - 1);
            if (doubleSpeedEnabled) finalScore += 250;
            const displayScore = Math.max(0, finalScore);

            finalScoreEl.textContent = `Final Score: ${displayScore}`;
            overlayEnd.classList.add('show');

            const AUTH = (window.API && window.API.getAuth) ? window.API.getAuth() : null;
            saveBtn.style.display = (AUTH && AUTH.token) ? 'inline-block' : 'none';
            saveBtn.onclick = async () => {
                saveBtn.disabled = true;
                saveBtn.textContent = 'Saving…';
                try {
                    await window.API.fetch('/records', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        body:
                            `punctuation=${encodeURIComponent(displayScore)}&` +
                            `ufos=${encodeURIComponent(initialUfos)}&` +
                            `disposedTime=${encodeURIComponent(prefs.time)}`,
                        expectJson: false
                    });
                    saveBtn.textContent = 'Saved!';
                } catch (err) {
                    alert('Save failed: ' + err.message);
                    saveBtn.textContent = 'Retry save';
                    saveBtn.disabled = false;
                }
            };
        }

        // Theme dependent
        const THEMES = {
            dark: {sky: '#0b0f1f', star: 'rgba(255,255,255,.08)', ground: '#12204f'},
            light: {sky: '#eef3ff', star: 'rgba(0,0,0,.06)', ground: '#98a5c9'}
        };
        let PALETTE = THEMES[(document.documentElement.getAttribute('data-theme') === 'light') ? 'light' : 'dark'];

        function applyThemeFromDOM() {
            const t = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
            PALETTE = THEMES[t];
        }

        const _themeObserver = new MutationObserver(applyThemeFromDOM);
        _themeObserver.observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
        applyThemeFromDOM();

        function render() {
            ctx.clearRect(0, 0, W, H);

            // Hintergrund
            ctx.fillStyle = PALETTE.sky;
            ctx.fillRect(0, 0, W, H);

            // Sterne / Punkte
            ctx.fillStyle = PALETTE.star;
            for (let i = 0; i < 40; i++) {
                ctx.fillRect((i * 71) % W, (i * 131) % H, 2, 2);
            }

            // Bodenlinie
            ctx.fillStyle = PALETTE.ground;
            ctx.fillRect(0, H - 20, W, 2);

            // Sprites
            for (const u of ufos) u.draw(ctx);
            missile.draw(ctx);
        }

        // Input & Restart
        function bind() {
            window.addEventListener('keydown', (e) => {
                if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
                keys.add(e.code);
                if (e.code === 'KeyR') restart();
            });
            window.addEventListener('keyup', (e) => keys.delete(e.code));

            document.getElementById('btnRestart').addEventListener('click', () => restart());
            document.getElementById('btnPlayAgain').addEventListener('click', () => restart());
        }

        function restart() {
            keys.clear();
            prefs = window.Prefs.load();
            initialUfos = prefs.ufos;
            doubleSpeedEnabled = !!prefs.doubleSpeed;
            timeLeft = prefs.time;
            score = 0;

            missile.reset();
            spawnWave();

            overlayEnd.classList.remove('show');

            // Kick the loop again
            running = true;
            lastTs = undefined;
            requestAnimationFrame(loop);
        }

        bind();
        requestAnimationFrame(loop);
    });
})();
