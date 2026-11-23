import { Injectable, inject, PLATFORM_ID } from '@angular/core'; // so we are a service that can be injected
import { isPlatformBrowser } from '@angular/common';

export interface GamePrefs {
  ufos: number;
  time: number;
  doubleSpeed: boolean;
}


// the annotation is NOT @Service but @Injectable
@Injectable({ providedIn: 'root' })
export class PreferencesService {

  private key = 'ufo_prefs';
  private platformId = inject(PLATFORM_ID);

  getPreferences(): GamePrefs {

    const fallback: GamePrefs = {  // the default
      ufos: 5,
      time: 60,
      doubleSpeed: false
    };


    if (!isPlatformBrowser(this.platformId)) {
      return fallback; // for the SSR
    }


    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) {
        return fallback;
      }
      const parsed = JSON.parse(raw); // parse the saved settings
      return this.normalize(parsed);
    } catch {
      return fallback;
    }
  }


  savePreferences(prefs: GamePrefs) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const safe = this.normalize(prefs);
    localStorage.setItem(this.key, JSON.stringify(safe));
  }

  // to enforce the requirements, so protection aagainst like null
  private normalize(prefs: Partial<GamePrefs>): GamePrefs {
    const ufos = [1, 5, 9].includes(Number(prefs.ufos)) ? Number(prefs.ufos) : 5;
    const time = [60, 120, 180].includes(Number(prefs.time)) ? Number(prefs.time) : 60;
    const doubleSpeed = !!prefs.doubleSpeed;
    return { ufos, time, doubleSpeed };
  }
}
