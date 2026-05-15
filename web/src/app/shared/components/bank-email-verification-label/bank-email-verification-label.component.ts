import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-bank-email-verification-label',
  standalone: true,
  template: `
    <span class="badge" [class.badge-verified]="verified">
      {{ verified ? 'Verified destination' : 'Email pending verification' }}
    </span>
  `,
})
export class BankEmailVerificationLabelComponent {
  @Input() verified = false;
}
