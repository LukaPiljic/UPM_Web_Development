import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';


@Injectable({ providedIn: 'root' })
export class AuthService {
  // URL of the game backend (users, login, global records). Not included in this repository.
  private apiUrl = 'http://localhost:10000';
  private localApiUrl = 'http://localhost:3000/api';

  private platformId = inject(PLATFORM_ID);


  currentUser = signal<string | null>(null);
  token = signal<string | null>(null);

  constructor(private http: HttpClient) {
    if (isPlatformBrowser(this.platformId)) {
      this.currentUser.set(localStorage.getItem('auth.user'));
      this.token.set(localStorage.getItem('auth.token'));
    }
  }

  isLoggedIn(): boolean {
    return !!this.token();
  }

  login(username: string, pass: string): Observable<any> {
    const url = `${this.apiUrl}/users/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(pass)}`; // siehe Aufgabenstellung, muss url-encoded sein
    // sendet eine GET Request and den Server, mit { observe : response } bekommen wir auch den HEADER!!
    return this.http.get(url, { observe: 'response', responseType: 'text' }).pipe(
      tap(res => { // tap tries to get the token from the header
        // dann checken wir den Header, ob es dort ein Field namesn Authorization gibt, oder es ist vlt im Body => remove dann die Quotes
        const token = res.headers.get('Authorization') || res.body?.replace(/"/g, '');
        if (token) {
          this.saveAuth(username, token); // store the token
        }
      })
    );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth.user');
      localStorage.removeItem('auth.token');
    }
    this.currentUser.set(null);
    this.token.set(null); // destroy token
  }

  checkUserExists(username: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${encodeURIComponent(username)}`);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, userData);
  }

  getGlobalRecords(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/records`);
  }

  getUserRecords(username: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.localApiUrl}/user-records/${encodeURIComponent(username)}`);
  }

  saveRecord(score: number, ufos: number, time: number): Observable<any> {
    const body = { punctuation: score, ufos: ufos, disposedTime: time };
    const headers = new HttpHeaders({ 'Authorization': this.token() || '' });
    return this.http.post(`${this.apiUrl}/records`, body, { headers });
  }





  // this will geet called by the profile.component.ts
  // THIS looks just like the "saveRecord" methode above

  updatePassword(currentPassword: string, newPassword: string): Observable<any> {
    const user = encodeURIComponent(this.currentUser() ?? '');
    // The interceptor will attach the Authorization header automatically, but
    // we can also do it like saveRecord() method with the body and  { header } !
    return this.http.patch(`${this.localApiUrl}/users/${user}`, { currentPassword, password: newPassword });
  }











  private saveAuth(user: string, token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth.user', user);
      localStorage.setItem('auth.token', token);
    }
    this.currentUser.set(user);
    this.token.set(token);
  }

  updateToken(token: string) {
    if (this.token() !== token) {
       if (isPlatformBrowser(this.platformId)) {
         localStorage.setItem('auth.token', token);
       }
       this.token.set(token);
    }
  }
}
