import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdoptionStatusBadgeComponent } from '../adoption-status-badge/adoption-status-badge.component';
import { SpotsRemainingMeterComponent } from '../spots-remaining-meter/spots-remaining-meter.component';

@Component({
  selector: 'app-bank-card',
  standalone: true,
  imports: [RouterLink, DecimalPipe, AdoptionStatusBadgeComponent, SpotsRemainingMeterComponent],
  template: `
    <a class="bank-card panel-premium" [routerLink]="['/', bank.countryCode, bank.bankSlug]">
      <div class="bank-card-inner">
        <div class="bank-card-top">
          @if (bank.logoUrl) {
            <img [src]="bank.logoUrl" [alt]="bank.bankName" class="bank-logo" />
          } @else {
            <span class="bank-initials" aria-hidden="true">{{ initials }}</span>
          }
          <div class="bank-card-meta">
            <h3>{{ bank.bankName }}</h3>
            <app-adoption-status-badge [status]="bank.bankAdoptionStatus" />
          </div>
        </div>

        <app-spots-remaining-meter
          [remaining]="bank.remainingSpots"
          [max]="bank.maxSpots"
        />

        <div class="bank-card-footer">
          <p class="bank-participants">
            <span class="bank-participants-num">{{ bank.participantCount | number }}</span>
            verified participants
          </p>
          <span class="bank-cta">
            Campaign
            <span class="bank-cta-arrow" aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </a>
  `,
  styles: `
    .bank-card {
      position: relative;
      display: block;
      height: 100%;
      text-decoration: none;
      color: inherit;
      border-radius: var(--radius-lg);
      background: linear-gradient(
        160deg,
        rgba(22, 22, 22, 0.95) 0%,
        rgba(12, 12, 12, 0.98) 50%,
        rgba(8, 8, 8, 1) 100%
      );
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.04) inset,
        0 16px 40px rgba(0, 0, 0, 0.35);
      transition:
        transform 0.28s var(--ease-out),
        box-shadow 0.28s var(--ease-out);
    }

    .bank-card:hover {
      transform: translateY(-3px);
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.06) inset,
        0 0 36px var(--keyra-trust-soft),
        0 22px 48px rgba(0, 0, 0, 0.45);
    }

    .bank-card:focus-visible {
      outline: 2px solid var(--keyra-trust);
      outline-offset: 3px;
    }

    .bank-card-inner {
      position: relative;
      z-index: 1;
      padding: 1.25rem 1.35rem 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
      min-height: 100%;
    }

    .bank-card-top {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .bank-logo {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-sm);
      object-fit: contain;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid var(--keyra-border-subtle);
      flex-shrink: 0;
    }

    .bank-initials {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      border-radius: var(--radius-sm);
      font-size: 0.9375rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: var(--keyra-white);
      background: linear-gradient(145deg, var(--keyra-graphite) 0%, #0a0a0a 100%);
      border: 1px solid var(--keyra-divider);
      flex-shrink: 0;
    }

    .bank-card-meta {
      min-width: 0;
      flex: 1;
    }

    .bank-card-meta h3 {
      margin: 0 0 0.45rem;
      font-size: 1.0625rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      line-height: 1.25;
      color: var(--keyra-white);
    }

    .bank-card-footer {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 0.75rem;
      margin-top: auto;
      padding-top: 0.15rem;
    }

    .bank-participants {
      margin: 0;
      font-size: 0.8125rem;
      color: var(--keyra-muted);
      line-height: 1.4;
    }

    .bank-participants-num {
      font-weight: 600;
      color: var(--keyra-white);
      font-variant-numeric: tabular-nums;
    }

    .bank-cta {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--keyra-trust);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .bank-cta-arrow {
      transition: transform 0.22s var(--ease-out);
    }

    .bank-card:hover .bank-cta-arrow {
      transform: translateX(4px);
    }

    @media (prefers-reduced-motion: reduce) {
      .bank-card:hover {
        transform: none;
      }
      .bank-card:hover .bank-cta-arrow {
        transform: none;
      }
    }
  `,
})
export class BankCardComponent {
  @Input() bank!: {
    countryCode: string;
    bankSlug: string;
    bankName: string;
    logoUrl?: string;
    bankAdoptionStatus: string;
    participantCount: number;
    remainingSpots: number;
    maxSpots: number;
  };

  get initials(): string {
    const parts = this.bank.bankName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '—';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
