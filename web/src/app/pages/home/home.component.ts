import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { CountrySelectorComponent } from '../../shared/components/country-selector/country-selector.component';
import { BankSearchComponent } from '../../shared/components/bank-search/bank-search.component';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CountrySelectorComponent, BankSearchComponent, DecimalPipe],
  template: `
    <div class="home">
      <section class="hero container">
        <div class="hero-grid">
          <div class="hero-copy">
            <p class="eyebrow">
              <span class="eyebrow-dot" aria-hidden="true"></span>
              KEYRA For The People
            </p>
            <h1>Your bank deserves stronger authentication.</h1>
            <p class="lead">
              Join a verified consumer trust movement for hardware-rooted banking
              security. No OTPs. No passwords. No phishing.
            </p>
            <ul class="value-list">
              <li>Verified humans only</li>
              <li>Authenticated, auditable requests</li>
              <li>Bank-grade security posture</li>
            </ul>
            <div class="hero-actions">
              <a routerLink="/dashboard" class="btn btn-primary">View dashboard</a>
              @if (!auth.isAuthenticated()) {
                <a routerLink="/auth/sign-in" class="btn btn-ghost">Sign in securely</a>
              }
            </div>
          </div>
          <aside class="hero-aside panel-premium stat-spotlight" aria-label="Movement snapshot">
            <p class="spotlight-label">Global movement</p>
            @if (stats()) {
              <p class="spotlight-value">
                {{ stats()!.totalPositionsReserved | number }}
              </p>
              <p class="spotlight-caption">verified positions secured worldwide</p>
              <div class="spotlight-row">
                <span>{{ stats()!.countriesActive }} countries</span>
                <span class="dot">·</span>
                <span>{{ stats()!.banksActive }} banks</span>
              </div>
            } @else {
              <p class="spotlight-shimmer">Loading metrics…</p>
            }
          </aside>
        </div>
      </section>

      @if (stats()) {
        <section class="container stats-section">
          <div class="stats-head">
            <h2 class="stats-title">Live network</h2>
            <p class="stats-sub">Real-time campaign scale across verified institutions.</p>
          </div>
          <div class="stats-grid">
            @for (card of statCards(); track card.key) {
              <div class="stat-card panel-premium">
                <span class="stat-value">{{ card.value }}</span>
                <span class="stat-label">{{ card.label }}</span>
              </div>
            }
          </div>
        </section>
      }

      <section class="container search-wrap">
        <div class="search-card panel-premium">
          <div class="search-intro">
            <h2>Find your bank</h2>
            <p>
              Select your country, then search by institution name to open that bank’s
              verified campaign page.
            </p>
            <div class="trust-strip">
              <span class="trust-pill">Secure session required</span>
              <span class="trust-pill muted">Logged & auditable</span>
            </div>
          </div>
          <div class="search-fields">
            <app-country-selector (countryChange)="selectedCountry = $event" />
            <app-bank-search [countryCode]="selectedCountry" />
          </div>
        </div>
      </section>
    </div>
  `,
  styles: `
    .home {
      position: relative;
    }

    .hero {
      padding: clamp(3rem, 8vw, 5rem) 0 clamp(2.5rem, 5vw, 4rem);
    }

    .hero-grid {
      display: grid;
      gap: clamp(2rem, 5vw, 3.5rem);
      align-items: start;
    }

    @media (min-width: 960px) {
      .hero-grid {
        grid-template-columns: minmax(0, 1fr) minmax(260px, 320px);
        align-items: stretch;
      }
    }

    .hero-copy {
      max-width: 640px;
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--keyra-trust);
      margin-bottom: 1.25rem;
    }

    .eyebrow-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--keyra-trust);
      box-shadow: 0 0 14px var(--keyra-trust-glow);
    }

    h1 {
      font-size: clamp(2.25rem, 4.8vw, 3.25rem);
      line-height: 1.08;
      font-weight: 600;
      letter-spacing: -0.035em;
      margin-bottom: 1.25rem;
      color: var(--keyra-white);
    }

    .lead {
      font-size: 1.0625rem;
      line-height: 1.65;
      color: var(--keyra-muted);
      max-width: 52ch;
      margin-bottom: 1.5rem;
    }

    .value-list {
      list-style: none;
      padding: 0;
      margin: 0 0 2rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .value-list li {
      position: relative;
      padding-left: 1.25rem;
      font-size: 0.875rem;
      color: var(--keyra-faint);
    }

    .value-list li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.55em;
      width: 5px;
      height: 5px;
      border-radius: 1px;
      background: var(--keyra-white);
      opacity: 0.55;
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
    }

    .hero-actions .btn-ghost {
      background: transparent;
      color: var(--keyra-white);
      border: 1px solid var(--keyra-border-subtle);
      font-weight: 500;
    }

    .hero-actions .btn-ghost:hover {
      border-color: rgba(255, 255, 255, 0.18);
      background: rgba(255, 255, 255, 0.04);
    }

    .stat-spotlight {
      padding: clamp(1.5rem, 4vw, 2rem);
      background: linear-gradient(
        165deg,
        rgba(20, 20, 22, 0.95) 0%,
        rgba(8, 8, 10, 0.98) 100%
      );
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 200px;
    }

    .spotlight-label {
      font-size: 0.6875rem;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: var(--keyra-muted);
      margin: 0 0 0.75rem;
    }

    .spotlight-value {
      font-size: clamp(2.5rem, 5vw, 3.25rem);
      font-weight: 700;
      letter-spacing: -0.04em;
      color: var(--keyra-white);
      margin: 0;
      font-variant-numeric: tabular-nums;
      line-height: 1;
    }

    .spotlight-caption {
      margin: 0.5rem 0 1.25rem;
      font-size: 0.875rem;
      color: var(--keyra-muted);
    }

    .spotlight-row {
      font-size: 0.8125rem;
      color: var(--keyra-faint);
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      align-items: center;
    }

    .spotlight-row .dot {
      opacity: 0.35;
    }

    .spotlight-shimmer {
      color: var(--keyra-muted);
      font-size: 0.9375rem;
      margin: 0;
    }

    .stats-section {
      margin-bottom: clamp(2.5rem, 6vw, 4rem);
    }

    .stats-head {
      margin-bottom: 1.5rem;
    }

    .stats-title {
      font-size: 0.6875rem;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: var(--keyra-muted);
      font-weight: 600;
      margin: 0 0 0.35rem;
    }

    .stats-sub {
      font-size: 1.125rem;
      color: var(--keyra-white);
      margin: 0;
      letter-spacing: -0.02em;
    }

    .stats-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }

    .stat-card {
      padding: 1.75rem 1.5rem;
      text-align: center;
      transition:
        transform 0.35s var(--ease-out),
        box-shadow 0.35s var(--ease-out);
      background: linear-gradient(
        180deg,
        rgba(22, 22, 24, 0.9) 0%,
        rgba(12, 12, 14, 0.95) 100%
      );
    }

    @media (hover: hover) {
      .stat-card:hover {
        transform: translateY(-3px);
        box-shadow:
          0 20px 40px rgba(0, 0, 0, 0.35),
          0 0 40px rgba(74, 124, 255, 0.06);
      }
    }

    .stat-card .stat-value {
      display: block;
      margin-bottom: 0.5rem;
    }

    .stat-card .stat-label {
      display: block;
    }

    .search-wrap {
      padding-bottom: 2rem;
    }

    .search-card {
      display: grid;
      gap: clamp(1.75rem, 4vw, 2.75rem);
      padding: clamp(1.75rem, 4vw, 2.5rem);
      background: linear-gradient(
        155deg,
        rgba(18, 18, 20, 0.98) 0%,
        rgba(10, 10, 11, 0.99) 100%
      );
    }

    @media (min-width: 880px) {
      .search-card {
        grid-template-columns: minmax(0, 340px) minmax(0, 1fr);
        align-items: start;
      }
    }

    .search-intro h2 {
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: -0.03em;
      margin-bottom: 0.65rem;
      color: var(--keyra-white);
    }

    .search-intro > p {
      font-size: 0.9375rem;
      line-height: 1.65;
      color: var(--keyra-muted);
      margin-bottom: 1.25rem;
    }

    .trust-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .trust-pill {
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 0.35rem 0.65rem;
      border-radius: 999px;
      border: 1px solid var(--keyra-border-accent);
      color: var(--keyra-trust);
      background: var(--keyra-trust-soft);
    }

    .trust-pill.muted {
      border-color: var(--keyra-border-subtle);
      color: var(--keyra-muted);
      background: rgba(255, 255, 255, 0.03);
    }

    .search-fields {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    @media (prefers-reduced-motion: reduce) {
      .stat-card:hover {
        transform: none;
      }
    }
  `,
})
export class HomeComponent implements OnInit {
  stats = signal<{
    countriesActive: number;
    banksActive: number;
    totalPositionsReserved: number;
    totalMessagesSent?: number;
    globalPressureIndex?: number;
  } | null>(null);

  statCards = signal<
    { key: string; value: string; label: string }[]
  >([]);

  selectedCountry = '';
  auth = inject(AuthService);
  private api = inject(ApiService);

  ngOnInit() {
    this.api
      .get<{
        countriesActive: number;
        banksActive: number;
        totalPositionsReserved: number;
      }>('/stats/global')
      .subscribe((s) => {
        this.stats.set(s);
        this.statCards.set([
          {
            key: 'c',
            value: String(s.countriesActive),
            label: 'Countries active',
          },
          {
            key: 'b',
            value: String(s.banksActive),
            label: 'Banks active',
          },
          {
            key: 'p',
            value: new Intl.NumberFormat(undefined).format(s.totalPositionsReserved),
            label: 'Positions secured',
          },
        ]);
      });
  }
}
