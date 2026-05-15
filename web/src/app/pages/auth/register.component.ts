import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="container auth">
      <div class="panel form-panel">
        <h1>Create KEYRA account</h1>
        <p>Join the verified security movement.</p>
        <form (ngSubmit)="submit()">
          <div class="field">
            <label>Full name</label>
            <input [(ngModel)]="fullName" name="fullName" required />
          </div>
          <div class="field">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" required />
          </div>
          <div class="field">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" required minlength="8" />
          </div>
          @if (error) {
            <p class="error">{{ error }}</p>
          }
          <button class="btn btn-primary" type="submit" [disabled]="loading">Register</button>
        </form>
        <p class="switch">
          Already verified?
          <a routerLink="/auth/sign-in">Sign in</a>
        </p>
      </div>
    </section>
  `,
  styles: `
    .auth {
      max-width: 420px;
      margin: 4rem auto;
    }
    .field {
      margin-bottom: 1rem;
    }
    .error {
      color: #e57373;
    }
    .switch {
      margin-top: 1.5rem;
      font-size: 0.875rem;
    }
  `,
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  loading = false;
  error = '';
  private auth = inject(AuthService);
  private router = inject(Router);

  submit() {
    this.loading = true;
    this.auth.register(this.email, this.password, this.fullName).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => {
        this.loading = false;
        this.error = e.error?.error ?? 'Registration failed';
      },
    });
  }
}
