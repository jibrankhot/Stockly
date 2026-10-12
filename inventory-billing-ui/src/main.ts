
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch(
  (error: unknown) => {
    console.error('Stockly application bootstrap failed.', error);
  },
);
