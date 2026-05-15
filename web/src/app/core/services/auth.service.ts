import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface KeyraUser {
  id: string;
  email: string;
  fullName: string;
  /** Profile photo URL when provided by API */
  avatarUrl?: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  simVerified: boolean;
  deviceTrustScore: number;
  botRiskScore: number;
  trustScore: number;
  isAdmin: boolean;
  canParticipate?: boolean;
}

const TOKEN_KEY = 'keyra_ftp_token';
const USER_KEY = 'keyra_ftp_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  private _user = signal<KeyraUser | null>(this.loadUser());
  user = this._user.asReadonly();
  isAuthenticated = computed(() => !!this._user() && !!this.token());
  canParticipate = computed(
    () =>
      !!this._user()?.canParticipate ||
      (this._user()?.emailVerified &&
        this._user()?.phoneVerified &&
        (this._user()?.deviceTrustScore ?? 0) >= 50 &&
        (this._user()?.botRiskScore ?? 100) <= 30)
  );

  token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(email: string, password: string) {
    return this.http
      .post<{ token: string; user: KeyraUser }>(`${this.base}/auth/login`, {
        email,
        password,
      })
      .pipe(tap((res) => this.setSession(res.token, res.user)));
  }

  register(email: string, password: string, fullName: string) {
    return this.http
      .post<{ token: string; user: KeyraUser }>(`${this.base}/auth/register`, {
        email,
        password,
        fullName,
      })
      .pipe(tap((res) => this.setSession(res.token, res.user)));
  }

  verifyDemo() {
    return this.http
      .post<{ user: KeyraUser }>(`${this.base}/auth/verify-demo`, {}, {
        headers: { Authorization: `Bearer ${this.token()}` },
      })
      .pipe(
        tap((res) => {
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          this._user.set(res.user);
        })
      );
  }

  refreshMe() {
    if (!this.token()) return;
    this.http
      .get<{ user: KeyraUser }>(`${this.base}/auth/me`, {
        headers: { Authorization: `Bearer ${this.token()}` },
      })
      .subscribe({
        next: (res) => this._user.set(res.user),
        error: () => this.logout(),
      });
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
  }

  private setSession(token: string, user: KeyraUser) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  private loadUser(): KeyraUser | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      localStorage.removeItem(USER_KEY);
      return null;
    }
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
