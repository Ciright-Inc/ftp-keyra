import { Component, Input, output, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthenticatedAccessGateComponent } from '../authenticated-access-gate/authenticated-access-gate.component';
import { BankEmailVerificationLabelComponent } from '../bank-email-verification-label/bank-email-verification-label.component';

@Component({
  selector: 'app-secure-message-form',
  standalone: true,
  imports: [
    FormsModule,
    AuthenticatedAccessGateComponent,
    BankEmailVerificationLabelComponent,
  ],
  template: `
    <app-authenticated-access-gate
      message="Sign in with KEYRA to send a secure authenticated request."
    >
      @if (mustJoin) {
        <p class="warn">Join the campaign before sending a message to your bank.</p>
      } @else {
        <form class="message-form" (ngSubmit)="send()">
          <p class="micro">This request is authenticated, logged, and auditable.</p>
          <div class="field">
            <label>To (verified bank email)</label>
            <input [value]="to" readonly />
            <app-bank-email-verification-label [verified]="!!to" />
          </div>
          <div class="field">
            <label>From</label>
            <input [value]="from" readonly />
          </div>
          @if (cc) {
            <div class="field">
              <label>CC (optional)</label>
              <input [value]="cc" readonly />
            </div>
          }
          <div class="field">
            <label>Subject</label>
            <input [(ngModel)]="subject" name="subject" required />
          </div>
          <div class="field">
            <label>Message</label>
            <textarea [(ngModel)]="body" name="body" rows="12" required></textarea>
          </div>
          <button class="btn btn-secondary" type="submit" [disabled]="sending">
            Send Secure Request To My Bank
          </button>
          @if (success) {
            <p class="success">Message sent securely.</p>
          }
          @if (error) {
            <p class="error">{{ error }}</p>
          }
        </form>
      }
    </app-authenticated-access-gate>
  `,
  styles: `
    .micro {
      font-size: 0.8125rem;
      color: var(--keyra-trust);
    }
    .field {
      margin-bottom: 1rem;
    }
    .success {
      color: var(--keyra-trust);
    }
    .error,
    .warn {
      color: #e57373;
    }
  `,
})
export class SecureMessageFormComponent implements OnInit {
  @Input() countryCode = '';
  @Input() bankSlug = '';
  @Input() mustJoin = false;
  sent = output<void>();

  to = '';
  from = '';
  cc = '';
  subject = '';
  body = '';
  sending = false;
  success = false;
  error = '';
  private api = inject(ApiService);

  ngOnInit() {
    if (this.mustJoin) return;
    this.api
      .get<{ to: string; from: string; cc: string; subject: string; body: string }>(
        `/campaign/message-template/${this.countryCode}/${this.bankSlug}`
      )
      .subscribe((t) => {
        this.to = t.to ?? '';
        this.from = t.from;
        this.cc = t.cc ?? '';
        this.subject = t.subject;
        this.body = t.body;
      });
  }

  send() {
    this.sending = true;
    this.error = '';
    this.api
      .post(`/campaign/send-message/${this.countryCode}/${this.bankSlug}`, {
        subject: this.subject,
        body: this.body,
      })
      .subscribe({
        next: () => {
          this.sending = false;
          this.success = true;
          this.sent.emit();
        },
        error: (e) => {
          this.sending = false;
          this.error = e.error?.error ?? 'Failed to send message';
        },
      });
  }
}
