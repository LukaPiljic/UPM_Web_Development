import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-records',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './records.component.html',
})

export class RecordsComponent implements OnInit {
  auth = inject(AuthService);
  globalRecords: any[] = [];
  userRecords: any[] = [];
  loading = true;

  ngOnInit() {
    this.auth.getGlobalRecords().subscribe({
      next: (data) => this.globalRecords = data.slice(0, 10),
      error: (e) => console.error(e),
      complete: () => this.loading = false
    });

    const user = this.auth.currentUser();
    if (user) { // so just when we are logged in
      this.auth.getUserRecords(user).subscribe({
        next: (data) => this.userRecords = data, // wird aufgerufen wenn daten ankommen
        error: (e) => console.error("Node Server Error (start scoreserver.js!):", e)
      });
    }
  }
}
