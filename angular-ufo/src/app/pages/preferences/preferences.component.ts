import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PreferencesService, GamePrefs } from '../../services/preferences.service'; // saves it to localStorage
import { Router, RouterLink } from '@angular/router'; // routerLink for the play now button

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './preferences.component.html',
  styleUrl: './preferences.component.css'
})

export class PreferencesComponent implements OnInit {

  prefsService = inject(PreferencesService);
  router = inject(Router);

  model: GamePrefs = {
    ufos: 5, // default val
    time: 60,
    doubleSpeed: false
  };


  explainerText = '';

  // fires once the component is initialized
  ngOnInit() {
    this.model = this.prefsService.getPreferences();
    this.updateExplainer();
  }

  save() {
    this.prefsService.savePreferences(this.model);

    alert('Preferences saved!');

    this.updateExplainer();
  }

  // the score explainer text
  updateExplainer() {
    const p = this.model;
    const divisor = p.time / 60;
    const ufoPenalty = Math.max(0, p.ufos - 1) * 50;
    const speedBonus = p.doubleSpeed ? 250 : 0;

    this.explainerText = `With your current settings (Time: ${p.time}s, UFOs: ${p.ufos}, ` +
      `Double speed: ${p.doubleSpeed ? 'on' : 'off'}), the formula is: ` +
      `Final = max(0, ⌊Raw / ${divisor}⌋ − ${ufoPenalty} + ${speedBonus}).`;
  }
}
