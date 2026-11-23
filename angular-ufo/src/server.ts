// for SSR
import 'zone.js/node'; // so Angular can run inside Node.js without crashing

// all the imports of tools foör SSR
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';

import express from 'express';

import {join} from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

// creates the express app
const app = express();

// SSR app engine
const angularApp = new AngularNodeAppEngine();

// for serving static files
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);


// so if it wasnt a static file request, then it must be a page request like /play
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(), // send that HTML back to the browser
    )
    .catch(next);
});


// checks if this file was run directly, if yes: start listen on port 4000 or PORT env var is set to
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
