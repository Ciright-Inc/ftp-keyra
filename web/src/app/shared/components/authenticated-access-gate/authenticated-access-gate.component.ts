import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-authenticated-access-gate',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (auth.isAuthenticated() && auth.canParticipate()) {
      <ng-content />
    } @else if (auth.isAuthenticated()) {
      <div class="gate panel">
        <p class="gate-title">Verification required</p>
        <p>Complete KEYRA verification to participate securely.</p>
        <button class="btn btn-trust" type="button" (click)="verify()">
          Complete verification
        </button>
      </div>
    } @else {
      <div class="gate panel">
        <p class="gate-title">Verified humans only.</p>
        <p>{{ message }}</p>
        <a routerLink="/auth/sign-in" class="btn btn-primary">Sign in with KEYRA</a>
      </div>
    }
  `,
  styles: `
    .gate {
      text-align: center;
      padding: 2rem;
    }
    .gate-title {
      color: var(--keyra-white);
      font-size: 1.125rem;
      margin-bottom: 0.5rem;
    }
  `,
})
export class AuthenticatedAccessGateComponent {
  @Input() message = 'Sign in with KEYRA to participate securely.';
  auth = inject(AuthService);

  verify() {
    this.auth.verifyDemo().subscribe((res) => {
      if (res?.user) this.auth.refreshMe();
    });
  }
}
