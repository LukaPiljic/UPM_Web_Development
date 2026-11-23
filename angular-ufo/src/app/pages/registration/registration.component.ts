import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './registration.component.html',
})

export class RegistrationComponent {
  username = '';
  email = '';
  password = '';
  passwordRepeat = '';

  userExistsError = false;
  msg = '';

  auth = inject(AuthService);
  router = inject(Router);

  constructor() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  checkUser() {
    if (!this.username) return; // so this happends after the user clicks out of the username box

    this.auth.checkUserExists(this.username).subscribe({
      next: () => {
        this.userExistsError = true;
      },
      error: (err) => {
        if (err.status === 404) {
          this.userExistsError = false;
        }
      }
    });
  }

  doRegister() {
    if (this.password !== this.passwordRepeat) {
      this.msg = "Passwords do not match.";
      return;
    }
    if (this.userExistsError) {
      this.msg = "Username already taken.";
      return;
    }

    const payload = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    // insert the payload, go and call the post method on the server
    this.auth.register(payload).subscribe({
      next: () => {
        alert('Registration successful! Please login.');
        this.router.navigate(['/login']);
      },
      error: (err) => this.msg = "Error: " + err.message
    });
  }
}
