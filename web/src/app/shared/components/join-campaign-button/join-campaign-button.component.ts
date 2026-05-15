import { Component, Input, output, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { AuthenticatedAccessGateComponent } from '../authenticated-access-gate/authenticated-access-gate.component';

@Component({
  selector: 'app-join-campaign-button',
  standalone: true,
  imports: [AuthenticatedAccessGateComponent],
  template: `
    <app-authenticated-access-gate>
      @if (!joined) {
        <button
          class="btn btn-primary"
          type="button"
          [disabled]="loading"
          (click)="join()"
        >
          Join The Verified Security Movement
        </button>
      } @else {
        <p class="joined">Your position is secured. #{{ participantNumber }}</p>
      }
    </app-authenticated-access-gate>
  `,
  styles: `
    .joined {
      color: var(--keyra-trust);
      margin: 0;
    }
  `,
})
export class JoinCampaignButtonComponent {
  @Input() countryCode = '';
  @Input() bankSlug = '';
  @Input() joined = false;
  @Input() participantNumber = 0;
  joinedEvent = output<{ participantNumber: number; bankName: string; country: string }>();
  loading = false;
  private api = inject(ApiService);

  join() {
    this.loading = true;
    this.api
      .post<{
        participantNumber: number;
        bankName: string;
        country: string;
      }>(`/campaign/join/${this.countryCode}/${this.bankSlug}`, {})
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.joinedEvent.emit(res);
        },
        error: () => (this.loading = false),
      });
  }
}
