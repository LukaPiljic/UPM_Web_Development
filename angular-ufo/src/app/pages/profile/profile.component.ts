import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  currentPassword = '';
  password = '';
  passwordRepeat = '';
  msg = '';
  msgType: 'success' | 'error' = 'success';

  auth = inject(AuthService);
  router = inject(Router);

  constructor() {
    // if we are not logged in, we just go and redirect the user to the home page
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }


// siehe html
  updatePassword() {
    if (!this.currentPassword || !this.password || !this.passwordRepeat) {
      this.showMsg('Please fill in all fields.', 'error');
      return;
    }

    if (this.password !== this.passwordRepeat) {
      this.showMsg("Passwords do not match.", 'error');
      return;
    }


    // this here is the async call to the server
    this.auth.updatePassword(this.currentPassword, this.password).subscribe({
      next: () => {
        this.showMsg('Password updated successfully!', 'success');
        this.currentPassword = '';
        this.password = '';
        this.passwordRepeat = '';
      },

      error: (err) => {
        this.showMsg('Error updating password: ' + (err.error?.error || err.error?.message || err.statusText), 'error');
      }

    });

  }

  private showMsg(text: string, type: 'success' | 'error') {
    this.msg = text;
    this.msgType = type;
  }
}

