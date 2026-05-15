import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DecimalPipe, CurrencyPipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AdoptionStatusBadgeComponent } from '../../shared/components/adoption-status-badge/adoption-status-badge.component';
import { ParticipationCounterComponent } from '../../shared/components/participation-counter/participation-counter.component';
import { SpotsRemainingMeterComponent } from '../../shared/components/spots-remaining-meter/spots-remaining-meter.component';
import { PressureScoreWidgetComponent } from '../../shared/components/pressure-score-widget/pressure-score-widget.component';
import { JoinCampaignButtonComponent } from '../../shared/components/join-campaign-button/join-campaign-button.component';
import { SecureMessageFormComponent } from '../../shared/components/secure-message-form/secure-message-form.component';
import { PositionConfirmationModalComponent } from '../../shared/components/position-confirmation-modal/position-confirmation-modal.component';
import { AuthenticatedAccessGateComponent } from '../../shared/components/authenticated-access-gate/authenticated-access-gate.component';

interface BankPageData {
  bank: {
    bankName: string;
    bankSlug: string;
    countryCode: string;
    logoUrl?: string;
    bankAdoptionStatus: string;
    primaryBankEmail: string | null;
    participantCount: number;
    remainingSpots: number;
    maxSpots: number;
    messageCount: number;
    pressureScore: number;
    annualAuthProjection?: string;
    estimatedAnnualCommunityPool?: number;
    country: { countryName: string; flagUrl?: string };
  };
  myParticipation?: { participantNumber: number } | null;
  canParticipate: boolean;
}

@Component({
  selector: 'app-bank',
  standalone: true,
  imports: [
    DecimalPipe,
    CurrencyPipe,
    AdoptionStatusBadgeComponent,
    ParticipationCounterComponent,
    SpotsRemainingMeterComponent,
    PressureScoreWidgetComponent,
    JoinCampaignButtonComponent,
    SecureMessageFormComponent,
    PositionConfirmationModalComponent,
    AuthenticatedAccessGateComponent,
  ],
  template: `
    @if (data()) {
      <section class="container bank-page">
        <div class="bank-header panel">
          <div class="identity">
            @if (data()!.bank.logoUrl) {
              <img [src]="data()!.bank.logoUrl" [alt]="data()!.bank.bankName" class="logo" />
            }
            @if (data()!.bank.country.flagUrl) {
              <img [src]="data()!.bank.country.flagUrl" alt="" class="flag" />
            }
            <div>
              <h1>{{ data()!.bank.bankName }}</h1>
              <p>{{ data()!.bank.country.countryName }}</p>
              <app-adoption-status-badge [status]="data()!.bank.bankAdoptionStatus" />
            </div>
          </div>
          @if (data()!.bank.primaryBankEmail) {
            <p class="email">
              Verified destination:
              <strong>{{ data()!.bank.primaryBankEmail }}</strong>
            </p>
          }
        </div>

        <div class="grid-3 metrics">
          <app-participation-counter
            [count]="data()!.bank.participantCount"
            label="Verified participants"
          />
          <app-spots-remaining-meter
            [remaining]="data()!.bank.remainingSpots"
            [max]="data()!.bank.maxSpots"
          />
          <app-pressure-score-widget [score]="data()!.bank.pressureScore" />
        </div>

        <div class="grid-2 stats panel">
          <div>
            <span class="stat-label">Messages sent</span>
            <span class="stat-value">{{ data()!.bank.messageCount | number }}</span>
          </div>
          <div>
            <span class="stat-label">Est. annual community pool</span>
            <span class="stat-value">{{
              data()!.bank.estimatedAnnualCommunityPool | currency: 'USD' : 'symbol' : '1.0-0'
            }}</span>
          </div>
          <div>
            <span class="stat-label">Est. annual auth volume</span>
            <span class="stat-value">{{ data()!.bank.annualAuthProjection | number }}</span>
          </div>
        </div>

        <section class="panel explain">
          <h2>Security modernization</h2>
          <p>
            Hardware-rooted trust for modern banking. Advocate for authentication that
            reduces phishing, OTP interception, SIM-swap fraud, and account takeover risk.
          </p>
          <p class="tagline">Verified humans only. Bank-grade security advocacy.</p>
        </section>

        <section class="actions panel">
          <h2>Participate securely</h2>
          @if (!auth.isAuthenticated()) {
            <app-authenticated-access-gate />
          } @else {
            <app-join-campaign-button
              [countryCode]="countryCode"
              [bankSlug]="bankSlug"
              [joined]="!!data()!.myParticipation"
              [participantNumber]="data()!.myParticipation?.participantNumber ?? 0"
              (joinedEvent)="onJoined($event)"
            />
            <div class="divider"></div>
            <h3>Send a secure authenticated request</h3>
            <app-secure-message-form
              [countryCode]="countryCode"
              [bankSlug]="bankSlug"
              [mustJoin]="!data()!.myParticipation"
            />
          }
        </section>
      </section>

      <app-position-confirmation-modal
        [open]="showModal()"
        [participantNumber]="modalData().number"
        [bankName]="modalData().bank"
        [country]="modalData().country"
        (close)="showModal.set(false)"
      />
    }
  `,
  styles: `
    .bank-header .identity {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1rem;
    }
    .logo {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      background: var(--keyra-graphite);
    }
    .flag {
      width: 32px;
      border-radius: 4px;
    }
    .email {
      font-size: 0.875rem;
    }
    .metrics {
      margin: var(--space) 0;
    }
    .explain .tagline {
      color: var(--keyra-trust);
      margin-bottom: 0;
    }
    .actions h3 {
      margin-top: 1.5rem;
    }
  `,
})
export class BankComponent implements OnInit {
  data = signal<BankPageData | null>(null);
  showModal = signal(false);
  modalData = signal({ number: 0, bank: '', country: '' });
  countryCode = '';
  bankSlug = '';
  auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  ngOnInit() {
    this.countryCode = this.route.snapshot.paramMap.get('countryCode')!.toLowerCase();
    this.bankSlug = this.route.snapshot.paramMap.get('bankSlug')!.toLowerCase();
    this.load();
  }

  load() {
    this.api
      .get<BankPageData>(`/banks/${this.countryCode}/${this.bankSlug}`)
      .subscribe((res) => this.data.set(res));
  }

  onJoined(ev: { participantNumber: number; bankName: string; country: string }) {
    this.modalData.set({
      number: ev.participantNumber,
      bank: ev.bankName,
      country: ev.country,
    });
    this.showModal.set(true);
    this.load();
  }
}
