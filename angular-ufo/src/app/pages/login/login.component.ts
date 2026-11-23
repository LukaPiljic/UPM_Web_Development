
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})



export class LoginComponent {

  username = '';
  password = '';
  msg = '';

  auth = inject(AuthService);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);



  constructor() {
    if (isPlatformBrowser(this.platformId) && this.auth.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }




  doLogin() {
    if (!this.username || !this.password) {
      this.msg = 'Enter username and password.';
      return;
    }

    this.auth.login(this.username, this.password).subscribe({
      next: () => { // here we wait async fo the response
        this.msg = 'Login success!';
        this.router.navigate(['/home']); // Weiterleitung nach Login
      },
      error: (err) => {
        this.msg = 'Login error: ' + (err.statusText || 'Invalid credentials');
      }
    });
  }
}
