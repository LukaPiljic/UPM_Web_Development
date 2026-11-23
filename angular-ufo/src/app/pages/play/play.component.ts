import {Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject, PLATFORM_ID} from '@angular/core'; // for the canvas
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {RouterLink} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {PreferencesService} from '../../services/preferences.service';

@Component({
  selector: 'app-play',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.css']
})

export class PlayComponent implements AfterViewInit, OnDestroy {

  // für die Exam: this grabs the <canvas> tag from the play.component.html, and we can now start drawing on itt
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  auth = inject(AuthService);

  // inject the services
  prefsService = inject(PreferencesService);
  platformId = inject(PLATFORM_ID);

  ctx!: CanvasRenderingContext2D;
  width = 800;
  height = 520;
  running = false;
  score = 0;
  timeLeft = 60;
  ufos: any[] = []; // arr to store the active ufos

  missile: any = {
    active: false,
    x: 0,
    y: 0,
    w: 20,
    h: 40
  };

  keys = new Set<string>(); // the keyboard keys pressed

  initialUfos = 5;
  doubleSpeed = false;
  hasDoubled = false;

  animationFrameId: number = 0;
  lastTs: number = 0;
  gameOver = false;
  finalScore = 0;
  private keyDownHandler = (e: KeyboardEvent) => this.onKeyDown(e);
  private keyUpHandler = (e: KeyboardEvent) => this.onKeyUp(e);

  ufoImg: HTMLImageElement | undefined;
  missileImg: HTMLImageElement | undefined;

  constructor() {
  }

  // fires once the component views are initialized
  ngAfterViewInit() {

    if (isPlatformBrowser(this.platformId)) { // so it runs only in the browser, not during the SSR
      this.ufoImg = new Image();
      this.ufoImg.src = 'assets/img/ufo.png';
      this.missileImg = new Image();
      this.missileImg.src = 'assets/img/missile.png';

      this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
      this.width = this.canvasRef.nativeElement.width;
      this.height = this.canvasRef.nativeElement.height;

      this.initGame(); // we fetch the settings
      this.bindEvents();
      this.animationFrameId = requestAnimationFrame((ts) => this.loop(ts));
    }
  }



  draw() {
    if (!this.ctx) {
      return;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Background zeichnen
    this.ctx.fillStyle = '#eef3ff';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Sterne zeichnen
    this.ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (let i = 0; i < 40; i++) {
      this.ctx.fillRect((i * 71) % this.width, (i * 131) % this.height, 2, 2);
    }

    // for the line on the ground
    this.ctx.fillStyle = '#98a5c9';
    this.ctx.fillRect(0, this.height - 20, this.width, 2);

    // drawing the ufos
    this.ufos.forEach(u => {
      if (this.ufoImg && this.ufoImg.complete) {
        this.ctx.drawImage(this.ufoImg, u.x, u.y, 48, 36);
      } else {
        this.ctx.fillStyle = 'cyan';
        this.ctx.fillRect(u.x, u.y, 48, 36);
      }
    });

    // drawing the missile
    if (this.missileImg && this.missileImg.complete) {
      this.ctx.drawImage(this.missileImg, this.missile.x, this.missile.y, 24, 48);
    } else {
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(this.missile.x, this.missile.y, 20, 40);
    }
  }


  // this fires when destroying the component, bc we re-routed or closed it
  ngOnDestroy() {
    this.running = false;
    if (isPlatformBrowser(this.platformId)) {
      cancelAnimationFrame(this.animationFrameId);
      window.removeEventListener('keydown', this.keyDownHandler);
      window.removeEventListener('keyup', this.keyUpHandler);
    }
  }



  initGame() {
    const p = this.prefsService.getPreferences();
    this.initialUfos = p.ufos;
    this.timeLeft = p.time;
    this.doubleSpeed = p.doubleSpeed;

    this.score = 0;
    this.hasDoubled = false;
    this.gameOver = false;
    this.running = true;
    this.lastTs = 0;

    this.spawnWave();
    this.resetMissile();
  }

  spawnWave() {
    this.ufos = [];
    for (let i = 0; i < this.initialUfos; i++) {
      this.ufos.push({
        x: Math.random() * (this.width - 50),
        y: 60 + Math.random() * 150,
        vx: (Math.random() < 0.5 ? -1 : 1) * (80 + Math.random() * 50), // we randomly insert them into the field
        r: 18
      });
    }
    this.hasDoubled = false;
  }

  resetMissile() {
    this.missile.active = false;
    this.missile.x = this.width / 2 - 10;
    this.missile.y = this.height - 70; // so it looks like it is on the ground
  }




  loop(ts: number) {
    if (!this.lastTs) {
      this.lastTs = ts;
    }

    const dt = Math.min((ts - this.lastTs) / 1000, 0.05); // delta time
    this.lastTs = ts;

    if (this.running) {
      this.update(dt);
      this.draw();
      this.animationFrameId = requestAnimationFrame((t) => this.loop(t));
    }
  }





  update(dt: number) {
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.endGame();
      return;
    }

    if (!this.missile.active) {
      if (this.keys.has('ArrowLeft') || this.keys.has('KeyA')) {
        this.missile.x = Math.max(0, this.missile.x - 300 * dt);
      }

      if (this.keys.has('ArrowRight') || this.keys.has('KeyD')) {
        this.missile.x = Math.min(this.width - 20, this.missile.x + 300 * dt);
      }

      if (this.keys.has('Space')) {
        this.missile.active = true;
      }

    } else {

      this.missile.y -= 400 * dt;
      if (this.missile.y < -50) {
        this.score = Math.max(0, this.score - 25);
        this.resetMissile();
      }
    }

    const half = Math.floor(this.initialUfos / 2);
    const triggerDouble = this.doubleSpeed && !this.hasDoubled && this.ufos.length <= half && this.ufos.length > 0;

    if (triggerDouble) {
      this.ufos.forEach(u => u.vx *= 2);
      this.hasDoubled = true;
    }

    this.ufos.forEach(u => {
      u.x += u.vx * dt;
      if (u.x < 0 || u.x > this.width - 40) {
        u.vx *= -1;
      }

      if (this.missile.active && this.checkCollision(this.missile, u)) {
        this.score += 100;
        this.resetMissile();
        u.hit = true;
      }
    });

    this.ufos = this.ufos.filter(u => !u.hit);

    if (this.ufos.length === 0) { // arr an ufos ist leer
      this.spawnWave();
    }
  }

  checkCollision(m: any, u: any): boolean {
    const dx = (m.x + 10) - (u.x + 24);
    const dy = (m.y) - (u.y + 18);
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < 30;
  }

  bindEvents() {
    window.addEventListener('keydown', this.keyDownHandler);
    window.addEventListener('keyup', this.keyUpHandler);
  }

  private onKeyDown(e: KeyboardEvent) {
    if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    this.keys.add(e.code);
    if (e.code === 'KeyR') {
      this.playAgain();
    }
  }

  private onKeyUp(e: KeyboardEvent) {
    this.keys.delete(e.code);
  }







  endGame() {
    this.running = false;
    this.gameOver = true;

    const p = this.prefsService.getPreferences();
    const divisor = p.time / 60;
    let raw = Math.round(this.score / divisor);
    const penalty = 50 * Math.max(0, p.ufos - 1);
    raw -= penalty;
    if (p.doubleSpeed) raw += 250;

    this.finalScore = Math.max(0, raw);
  }

  saveScore() {
    const p = this.prefsService.getPreferences();
    this.auth.saveRecord(this.finalScore, p.ufos, p.time).subscribe({
      next: () => alert('Saved!'),
      error: (e) => alert('Error saving: ' + e.message)
    });
  }

  playAgain() {
    this.keys.clear();
    this.initGame();
    this.animationFrameId = requestAnimationFrame((t) => this.loop(t));
  }
}
