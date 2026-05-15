import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="container auth">
      <div class="panel form-panel">
        <h1>Sign in with KEYRA</h1>
        <p>Verified humans only. Secure session required to participate.</p>
        @if (sessionExpired) {
          <p class="session-note">
            Your session expired or the server rejected your credentials. Sign in again to continue.
          </p>
        }
        <form (ngSubmit)="submit()">
          <div class="field">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" required />
          </div>
          <div class="field">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" required />
          </div>
          @if (error) {
            <p class="error">{{ error }}</p>
          }
          <button class="btn btn-primary" type="submit" [disabled]="loading">
            Sign in
          </button>
        </form>
        <p class="switch">
          New to KEYRA?
          <a routerLink="/auth/register">Create account</a>
        </p>
        <p class="demo-hint">Demo: demo&#64;keyra.ie / DemoUser2026!</p>
      </div>
    </section>
  `,
  styles: `
    .auth {
      max-width: 420px;
      margin: 4rem auto;
    }
    .form-panel h1 {
      margin-bottom: 0.5rem;
    }
    .field {
      margin-bottom: 1rem;
    }
    .error {
      color: #e57373;
    }
    .session-note {
      padding: 0.85rem 1rem;
      margin-bottom: 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      line-height: 1.5;
      color: var(--keyra-muted);
      border: 1px solid var(--keyra-border-accent);
      background: var(--keyra-trust-soft);
    }
    .switch {
      margin-top: 1.5rem;
      font-size: 0.875rem;
    }
    .demo-hint {
      font-size: 0.75rem;
      color: var(--keyra-muted);
      margin-top: 1rem;
    }
  `,
})
export class SignInComponent implements OnInit {
  email = '';
  password = '';
  loading = false;
  error = '';
  sessionExpired = false;
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((q) => {
      this.sessionExpired = q.get('reason') === 'session';
    });
  }

  submit() {
    this.loading = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () =>
        this.router.navigate(['/dashboard'], {
          replaceUrl: true,
          queryParams: {},
        }),
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        const body = err.error as { error?: string; detail?: string } | undefined;
        if (err.status === 503 || err.status >= 500) {
          this.error =
            body?.error ??
            body?.detail ??
            'Server error — check API terminal logs and PostgreSQL (DATABASE_URL).';
        } else {
          this.error = 'Invalid credentials';
        }
      },
    });
  }
}
