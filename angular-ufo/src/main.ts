import 'zone.js';


import { bootstrapApplication } from '@angular/platform-browser'; // to start a standalone application
import { appConfig } from './app/app.config'; // for the config settings
import { AppComponent } from './app/app.component'; // imports the root component, so its the <app-root> tag in index.html



// startet die AppComponent
bootstrapApplication(AppComponent, appConfig) // start!
  .catch((err) => console.error(err));


/**
 * für die EXAM:
 * Der Einstiegspunkt von der ganzen AppComponent
 */
