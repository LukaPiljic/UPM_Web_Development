import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { PlayComponent } from './pages/play/play.component';
import { RecordsComponent } from './pages/records/records.component';
import { PreferencesComponent } from './pages/preferences/preferences.component';
import { ProfileComponent } from './pages/profile/profile.component'; // der neue import

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'register', loadComponent: () => import('./pages/registration/registration.component').then(m => m.RegistrationComponent) },
  { path: 'login', component: LoginComponent },
  { path: 'play', component: PlayComponent },
  { path: 'records', component: RecordsComponent },
  { path: 'preferences', component: PreferencesComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];
