// Server-Side entry point
// So it is there for the SSR

// SO main.server.ts starts the application inside the Node.js server to generate initial HTML

import 'zone.js/node';
import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component'; // imports the app/app.component.ts, means this file we want to render
import { config } from './app/app.config.server'; // imports the config settings

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(AppComponent, config, context);

export default bootstrap;
