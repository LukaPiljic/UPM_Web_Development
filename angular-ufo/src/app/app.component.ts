// for the exam:
/*
It is the frame of the website that never changes
and contains global logic (see the logout method)
 */

import {Component, inject} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {CommonModule} from '@angular/common';
import {AuthService} from './services/auth.service';


@Component({
  selector: 'app-root', // same as in index.html
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

/**
 * please keep in mind that the file should be named app.component.ts
 * Just to be 100% aligned with the naming conventions
 * Edit: I changed it on the 9th
 */

export class AppComponent {

  authService = inject(AuthService);
  router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
    alert('Logged out');
  }




}
