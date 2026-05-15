import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { BankCardComponent } from '../../shared/components/bank-card/bank-card.component';

@Component({
  selector: 'app-country',
  standalone: true,
  imports: [RouterLink, BankCardComponent, DecimalPipe],
  template: `
    <div class="country-page">
      @if (!country) {
        <section class="container country-loading">
          <div class="country-loading-inner panel-premium">
            <span class="country-loading-shimmer">Loading institutions…</span>
          </div>
        </section>
      } @else {
        <section class="country-hero container">
          <a routerLink="/" class="country-back">
            <span class="country-back-arr" aria-hidden="true">←</span>
            <span>Global directory</span>
          </a>

          <header class="country-hero-card panel-premium">
            <div class="country-hero-copy">
              <p class="country-eyebrow">
                <span class="country-eyebrow-dot" aria-hidden="true"></span>
                Institution campaigns
              </p>
              <div class="country-title-block">
                @if (country.flagUrl) {
                  <img [src]="country.flagUrl" alt="" class="country-flag" />
                }
                <div class="country-title-text">
                  <h1>{{ country.countryName }}</h1>
                  <p class="country-lead">
                    Verified adoption programmes open to participating consumers. Join through your
                    institution’s campaign page.
                  </p>
                </div>
              </div>
            </div>
            <div class="country-hero-metrics" aria-label="Country statistics">
              <div class="country-metric">
                <span class="country-metric-value">{{ country.bankCount }}</span>
                <span class="country-metric-label">Banks live</span>
              </div>
              <div class="country-metric-divider" aria-hidden="true"></div>
              <div class="country-metric">
                <span class="country-metric-value">{{ country.participantCount | number }}</span>
                <span class="country-metric-label">Participants</span>
              </div>
            </div>
          </header>
        </section>

        <section class="container country-banks">
          <div class="country-banks-head">
            <h2>Institutions</h2>
            <p>Open a bank to review spots remaining and join the verified queue.</p>
          </div>

          @if (country.banks.length === 0) {
            <div class="country-empty panel-premium">
              <p>No banks listed for this country yet.</p>
            </div>
          } @else {
            <div class="country-banks-grid">
              @for (b of country.banks; track b.id) {
                <app-bank-card [bank]="b" />
              }
            </div>
          }
        </section>
      }
    </div>
  `,
  styles: `
    .country-page {
      padding-bottom: clamp(2.5rem, 6vw, 4rem);
    }

    .country-loading {
      padding-top: clamp(2rem, 5vw, 3rem);
    }

    .country-loading-inner {
      padding: clamp(2rem, 5vw, 2.75rem);
      text-align: center;
    }

    .country-loading-shimmer {
      font-size: 0.9375rem;
      color: var(--keyra-muted);
      animation: countryPulse 1.4s ease-in-out infinite;
    }

    @keyframes countryPulse {
      50% {
        opacity: 0.55;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .country-loading-shimmer {
        animation: none;
      }
    }

    .country-hero {
      padding-top: clamp(1.25rem, 3vw, 2rem);
      padding-bottom: clamp(1.5rem, 4vw, 2.25rem);
    }

    .country-back {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--keyra-muted);
      margin-bottom: 1rem;
      transition:
        color 0.2s var(--ease-out),
        transform 0.2s var(--ease-out);
    }

    .country-back:hover {
      color: var(--keyra-white);
    }

    .country-back-arr {
      opacity: 0.85;
    }

    .country-hero-card {
      display: grid;
      gap: clamp(1.5rem, 4vw, 2rem);
      padding: clamp(1.35rem, 4vw, 1.85rem) clamp(1.35rem, 4vw, 2rem);
      background: linear-gradient(
        155deg,
        rgba(20, 20, 20, 0.92) 0%,
        rgba(12, 12, 12, 0.98) 55%,
        rgba(10, 10, 10, 1) 100%
      );
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.05) inset,
        0 24px 48px rgba(0, 0, 0, 0.35);
    }

    @media (min-width: 840px) {
      .country-hero-card {
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
      }
    }

    .country-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--keyra-trust);
      margin: 0 0 0.85rem;
    }

    .country-eyebrow-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--keyra-trust);
      box-shadow: 0 0 10px var(--keyra-trust-glow);
    }

    .country-title-block {
      display: flex;
      align-items: flex-start;
      gap: clamp(0.85rem, 2.5vw, 1.25rem);
    }

    .country-flag {
      width: clamp(52px, 10vw, 64px);
      height: auto;
      border-radius: var(--radius-sm);
      border: 1px solid var(--keyra-border-subtle);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      flex-shrink: 0;
    }

    .country-title-text h1 {
      margin: 0 0 0.45rem;
      font-size: clamp(1.75rem, 4vw, 2.35rem);
      font-weight: 600;
      letter-spacing: -0.035em;
      line-height: 1.15;
      color: var(--keyra-white);
    }

    .country-lead {
      margin: 0;
      max-width: 52ch;
      font-size: 0.9375rem;
      line-height: 1.58;
      color: var(--keyra-muted);
    }

    .country-hero-metrics {
      display: flex;
      align-items: stretch;
      gap: 0;
      padding: 0.65rem 0.85rem;
      border-radius: var(--radius);
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid var(--keyra-border-subtle);
      min-width: min(100%, 280px);
    }

    .country-metric {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.2rem;
      padding: 0.35rem 0.65rem;
      text-align: center;
    }

    .country-metric-value {
      font-size: clamp(1.5rem, 3vw, 1.85rem);
      font-weight: 600;
      letter-spacing: -0.03em;
      font-variant-numeric: tabular-nums;
      color: var(--keyra-white);
    }

    .country-metric-label {
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--keyra-faint);
    }

    .country-metric-divider {
      width: 1px;
      align-self: stretch;
      background: linear-gradient(
        180deg,
        transparent,
        var(--keyra-divider) 15%,
        var(--keyra-divider) 85%,
        transparent
      );
      flex-shrink: 0;
    }

    .country-banks {
      padding-top: 0.25rem;
    }

    .country-banks-head {
      margin-bottom: 1.35rem;
      max-width: 42rem;
    }

    .country-banks-head h2 {
      margin: 0 0 0.35rem;
      font-size: clamp(1.15rem, 2.5vw, 1.35rem);
      font-weight: 600;
      letter-spacing: -0.025em;
      color: var(--keyra-white);
    }

    .country-banks-head p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--keyra-muted);
      line-height: 1.55;
    }

    .country-banks-grid {
      display: grid;
      gap: 1.25rem;
      grid-template-columns: 1fr;
    }

    @media (min-width: 640px) {
      .country-banks-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (min-width: 1080px) {
      .country-banks-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    .country-empty {
      padding: 2.5rem 1.5rem;
      text-align: center;
    }

    .country-empty p {
      margin: 0;
      color: var(--keyra-muted);
      font-size: 0.9375rem;
    }
  `,
})
export class CountryComponent implements OnInit {
  country: {
    countryName: string;
    flagUrl?: string;
    bankCount: number;
    participantCount: number;
    banks: {
      id: string;
      countryCode: string;
      bankSlug: string;
      bankName: string;
      logoUrl?: string;
      bankAdoptionStatus: string;
      participantCount: number;
      remainingSpots: number;
      maxSpots: number;
    }[];
  } | null = null;
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  ngOnInit() {
    const code = this.route.snapshot.paramMap.get('countryCode')!;
    this.api
      .get<{ country: NonNullable<CountryComponent['country']> }>(`/countries/${code}`)
      .subscribe((res) => {
      this.country = res.country;
    });
  }
}
