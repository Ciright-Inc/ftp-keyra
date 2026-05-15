import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { TrustScoreBadgeComponent } from '../../shared/components/trust-score-badge/trust-score-badge.component';
import { AdoptionStatusBadgeComponent } from '../../shared/components/adoption-status-badge/adoption-status-badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    TrustScoreBadgeComponent,
    AdoptionStatusBadgeComponent,
  ],
  template: `
    <div class="dash container">
      <header class="dash-head">
        <div class="dash-head-copy">
          <p class="eyebrow">
            <span class="eyebrow-dot" aria-hidden="true"></span>
            Participant dashboard
          </p>
          <h1>Your participation</h1>
          <p class="lead">
            Track verified campaign positions, authenticated bank messages, and your
            secure audit trail — bank-grade transparency for advocates.
          </p>
        </div>
        <div class="dash-metrics panel-premium" aria-label="Summary counts">
          <div class="metric">
            <span class="metric-num">{{ participations.length }}</span>
            <span class="metric-label">Campaigns</span>
          </div>
          <div class="metric-divider" aria-hidden="true"></div>
          <div class="metric">
            <span class="metric-num">{{ messages.length }}</span>
            <span class="metric-label">Messages</span>
          </div>
          <div class="metric-divider" aria-hidden="true"></div>
          <div class="metric">
            <span class="metric-num">{{ activity.length }}</span>
            <span class="metric-label">Log events</span>
          </div>
        </div>
      </header>

      @if (user) {
        <section class="identity panel-premium">
          <div class="identity-visual">
            <div class="avatar" aria-hidden="true">{{ initials(user.fullName) }}</div>
            <div class="identity-main">
              <h2 class="identity-name">{{ user.fullName }}</h2>
              <p class="identity-email">{{ user.email }}</p>
              <div class="identity-footer">
                <app-trust-score-badge [score]="user.trustScore" />
              </div>
            </div>
          </div>
          <div class="verify-grid">
            <div class="verify-item" [class.done]="user.emailVerified">
              <svg class="verify-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                @if (user.emailVerified) {
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                } @else {
                  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" />
                }
              </svg>
              <span>Email verified</span>
            </div>
            <div class="verify-item" [class.done]="user.phoneVerified">
              <svg class="verify-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                @if (user.phoneVerified) {
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                } @else {
                  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" />
                }
              </svg>
              <span>Phone verified</span>
            </div>
            <div class="verify-item" [class.done]="user.simVerified">
              <svg class="verify-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                @if (user.simVerified) {
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                } @else {
                  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" />
                }
              </svg>
              <span>SIM verified</span>
            </div>
          </div>
        </section>
      }

      <div class="dash-grid">
        <div class="dash-main">
          <section class="section-block">
            <div class="section-head">
              <div>
                <h2 class="section-title">My banks joined</h2>
                <p class="section-sub">Verified positions per institution campaign.</p>
              </div>
              <a routerLink="/" class="section-link">Browse banks →</a>
            </div>
            @if (participations.length) {
              <div class="bank-grid">
                @for (p of participations; track p.id) {
                  <a class="bank-tile panel-premium" [routerLink]="['/', p.countryCode, p.bankSlug]">
                    <div class="bank-tile-top">
                      <span class="bank-flag">{{ p.countryCode.toUpperCase() }}</span>
                      <span class="position-pill">#{{ p.participantNumber }}</span>
                    </div>
                    <h3 class="bank-title">{{ p.bank.bankName }}</h3>
                    <app-adoption-status-badge [status]="p.bank.bankAdoptionStatus" />
                    <span class="bank-arrow" aria-hidden="true">→</span>
                  </a>
                }
              </div>
            } @else {
              <div class="empty panel-premium">
                <svg class="empty-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <rect
                    x="8"
                    y="14"
                    width="32"
                    height="22"
                    rx="3"
                    stroke="currentColor"
                    stroke-width="1.25"
                    opacity="0.35"
                  />
                  <path
                    d="M16 22h16M16 27h10"
                    stroke="currentColor"
                    stroke-width="1.25"
                    stroke-linecap="round"
                    opacity="0.25"
                  />
                </svg>
                <p class="empty-title">No campaigns joined yet</p>
                <p class="empty-copy">
                  Open a bank page and secure your verified position in the movement.
                </p>
                <a routerLink="/" class="btn btn-primary btn-sm-empty">Explore institutions</a>
              </div>
            }
          </section>

          <section class="section-block">
            <div class="section-head">
              <div>
                <h2 class="section-title">Messages sent</h2>
                <p class="section-sub">Authenticated requests delivered to verified bank inboxes.</p>
              </div>
            </div>
            @if (messages.length) {
              <div class="table-wrap panel-premium">
                <div class="table-header" role="row">
                  <span>Bank</span>
                  <span>Subject</span>
                  <span>Status</span>
                  <span class="col-date">Sent</span>
                </div>
                @for (m of messages; track m.id) {
                  <div class="table-row" role="row">
                    <span class="cell-strong">{{ m.bank.bankName }}</span>
                    <span class="cell-subject" [title]="m.subject">{{ m.subject }}</span>
                    <span>
                      <span class="status-pill" [class.sent]="m.messageStatus === 'sent'">{{
                        m.messageStatus
                      }}</span>
                    </span>
                    <span class="col-date meta">{{ m.createdAt | date: 'MMM d, y · HH:mm' }}</span>
                  </div>
                }
              </div>
            } @else {
              <div class="empty panel-premium compact">
                <p class="empty-title">No messages sent yet</p>
                <p class="empty-copy">
                  After you join a campaign, send a secure, editable request from the bank page.
                </p>
              </div>
            }
          </section>
        </div>

        <aside class="dash-aside">
          <section class="section-block sticky-aside">
            <div class="section-head">
              <div>
                <h2 class="section-title">Secure activity log</h2>
                <p class="section-sub">Immutable audit trail for your authenticated actions.</p>
              </div>
            </div>
            @if (activity.length) {
              <div class="timeline panel-premium">
                @for (e of activity; track e.id; let last = $last) {
                  <div class="timeline-item" [class.last]="last">
                    <span class="timeline-dot" aria-hidden="true"></span>
                    <div class="timeline-body">
                      <span class="timeline-event">{{ formatEvent(e.eventType) }}</span>
                      <time class="timeline-time">{{ e.createdAt | date: 'MMM d · HH:mm' }}</time>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="empty panel-premium compact flat">
                <p class="empty-copy solo">
                  Activity appears here after sign-in events, joins, and secure sends.
                </p>
              </div>
            }
          </section>
        </aside>
      </div>
    </div>
  `,
  styles: `
    .dash {
      padding-top: clamp(1rem, 3vw, 2rem);
      padding-bottom: 3rem;
    }

    .dash-head {
      display: grid;
      gap: 1.5rem;
      margin-bottom: clamp(1.75rem, 4vw, 2.5rem);
    }

    @media (min-width: 900px) {
      .dash-head {
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
      }
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--keyra-trust);
      margin: 0 0 0.75rem;
    }

    .eyebrow-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--keyra-trust);
      box-shadow: 0 0 12px var(--keyra-trust-glow);
    }

    h1 {
      font-size: clamp(1.85rem, 3.5vw, 2.35rem);
      font-weight: 600;
      letter-spacing: -0.035em;
      margin: 0 0 0.65rem;
      color: var(--keyra-white);
    }

    .lead {
      margin: 0;
      max-width: 54ch;
      font-size: 0.9375rem;
      line-height: 1.65;
      color: var(--keyra-muted);
    }

    .dash-metrics {
      display: flex;
      align-items: stretch;
      gap: 0;
      padding: 1rem 1.25rem;
      background: linear-gradient(
        165deg,
        rgba(18, 18, 22, 0.98) 0%,
        rgba(10, 10, 12, 0.99) 100%
      );
    }

    .metric {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.35rem 0.75rem;
      text-align: center;
    }

    .metric-num {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: var(--keyra-white);
      font-variant-numeric: tabular-nums;
      line-height: 1.2;
    }

    .metric-label {
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--keyra-muted);
      margin-top: 0.25rem;
    }

    .metric-divider {
      width: 1px;
      background: var(--keyra-border-subtle);
      align-self: stretch;
      margin: 0.25rem 0;
    }

    .identity {
      display: grid;
      gap: 1.5rem;
      padding: clamp(1.25rem, 3vw, 1.75rem);
      margin-bottom: clamp(2rem, 5vw, 2.75rem);
      background: linear-gradient(
        155deg,
        rgba(16, 16, 18, 0.98) 0%,
        rgba(8, 8, 10, 0.99) 100%
      );
    }

    @media (min-width: 720px) {
      .identity {
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
      }
    }

    .identity-visual {
      display: flex;
      gap: 1.25rem;
      align-items: center;
    }

    .avatar {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.125rem;
      letter-spacing: -0.02em;
      color: var(--keyra-white);
      background: linear-gradient(145deg, rgba(74, 124, 255, 0.2) 0%, rgba(255, 255, 255, 0.06) 100%);
      border: 1px solid var(--keyra-border-subtle);
      flex-shrink: 0;
    }

    .identity-name {
      margin: 0 0 0.2rem;
      font-size: 1.125rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--keyra-white);
    }

    .identity-email {
      margin: 0 0 0.65rem;
      font-size: 0.8125rem;
      color: var(--keyra-muted);
    }

    .identity-footer {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .verify-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .verify-item {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.5rem 0.75rem;
      border-radius: 999px;
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--keyra-muted);
      border: 1px solid var(--keyra-border-subtle);
      background: rgba(0, 0, 0, 0.25);
    }

    .verify-item.done {
      color: var(--keyra-trust);
      border-color: var(--keyra-border-accent);
      background: var(--keyra-trust-soft);
    }

    .verify-icon {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      color: currentColor;
    }

    .dash-grid {
      display: grid;
      gap: clamp(2rem, 4vw, 2.75rem);
    }

    @media (min-width: 1024px) {
      .dash-grid {
        grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
        align-items: start;
      }

      .sticky-aside {
        position: sticky;
        top: 5.5rem;
      }
    }

    .section-block + .section-block {
      margin-top: clamp(2rem, 4vw, 2.75rem);
    }

    .section-head {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: flex-end;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .section-title {
      margin: 0 0 0.25rem;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--keyra-white);
    }

    .section-sub {
      margin: 0;
      font-size: 0.8125rem;
      color: var(--keyra-muted);
      max-width: 44ch;
    }

    .section-link {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--keyra-trust);
      white-space: nowrap;
    }

    .section-link:hover {
      opacity: 1;
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .bank-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    }

    .bank-tile {
      position: relative;
      display: block;
      padding: 1.25rem 1.25rem 1.35rem;
      text-decoration: none;
      color: inherit;
      transition:
        transform 0.3s var(--ease-out),
        box-shadow 0.3s var(--ease-out);
      background: linear-gradient(
        165deg,
        rgba(18, 18, 20, 0.98) 0%,
        rgba(10, 10, 11, 0.99) 100%
      );
    }

    @media (hover: hover) {
      .bank-tile:hover {
        transform: translateY(-3px);
        box-shadow:
          0 16px 36px rgba(0, 0, 0, 0.35),
          0 0 36px rgba(74, 124, 255, 0.06);
      }

      .bank-tile:hover .bank-arrow {
        opacity: 1;
        transform: translateX(3px);
      }
    }

    .bank-tile-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .bank-flag {
      font-size: 0.625rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: var(--keyra-muted);
    }

    .position-pill {
      font-size: 0.6875rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--keyra-border-subtle);
      color: var(--keyra-white);
    }

    .bank-title {
      margin: 0 0 0.65rem;
      font-size: 1.0625rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--keyra-white);
    }

    .bank-arrow {
      position: absolute;
      right: 1.25rem;
      bottom: 1.25rem;
      font-size: 1rem;
      color: var(--keyra-trust);
      opacity: 0.35;
      transition:
        opacity 0.25s var(--ease-out),
        transform 0.25s var(--ease-out);
    }

    .empty {
      text-align: center;
      padding: 2.25rem 1.5rem;
      background: linear-gradient(
        180deg,
        rgba(14, 14, 16, 0.98) 0%,
        rgba(8, 8, 10, 0.99) 100%
      );
    }

    .empty.compact {
      padding: 1.75rem 1.25rem;
      text-align: left;
    }

    .empty.flat {
      background: rgba(0, 0, 0, 0.2);
    }

    .empty-icon {
      width: 48px;
      height: 48px;
      color: var(--keyra-muted);
      margin-bottom: 1rem;
    }

    .empty-title {
      margin: 0 0 0.35rem;
      font-size: 1rem;
      font-weight: 600;
      color: var(--keyra-white);
    }

    .empty-copy {
      margin: 0 0 1.25rem;
      font-size: 0.875rem;
      color: var(--keyra-muted);
      max-width: 34ch;
      margin-left: auto;
      margin-right: auto;
    }

    .empty.compact .empty-copy {
      margin-left: 0;
      margin-right: 0;
      margin-bottom: 0;
      max-width: 42ch;
    }

    .empty-copy.solo {
      margin: 0;
      font-size: 0.8125rem;
    }

    .btn-sm-empty {
      padding: 0.55rem 1.15rem;
      font-size: 0.8125rem;
      font-weight: 600;
      display: inline-flex;
    }

    .table-wrap {
      overflow-x: auto;
      padding: 0;
      background: linear-gradient(
        165deg,
        rgba(14, 14, 16, 0.98) 0%,
        rgba(8, 8, 10, 0.99) 100%
      );
    }

    .table-header,
    .table-row {
      display: grid;
      grid-template-columns: minmax(100px, 1.1fr) minmax(120px, 2fr) auto minmax(130px, 1fr);
      gap: 0.75rem 1rem;
      align-items: center;
      padding: 0.75rem 1.25rem;
      font-size: 0.8125rem;
    }

    .table-header {
      font-size: 0.625rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--keyra-muted);
      border-bottom: 1px solid var(--keyra-border-subtle);
      background: rgba(0, 0, 0, 0.2);
    }

    .table-row {
      border-bottom: 1px solid var(--keyra-border-subtle);
      transition: background 0.2s var(--ease-out);
    }

    .table-row:last-child {
      border-bottom: none;
    }

    @media (hover: hover) {
      .table-row:hover {
        background: rgba(255, 255, 255, 0.03);
      }
    }

    .cell-strong {
      font-weight: 600;
      color: var(--keyra-white);
    }

    .cell-subject {
      color: var(--keyra-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .col-date {
      text-align: right;
      justify-self: end;
    }

    .meta {
      color: var(--keyra-muted);
      font-variant-numeric: tabular-nums;
    }

    .status-pill {
      display: inline-block;
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      font-size: 0.625rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--keyra-muted);
      border: 1px solid var(--keyra-border-subtle);
      background: rgba(255, 255, 255, 0.03);
    }

    .status-pill.sent {
      color: var(--keyra-trust);
      border-color: var(--keyra-border-accent);
      background: var(--keyra-trust-soft);
    }

    .timeline {
      padding: 1rem 1rem 1rem 1.35rem;
      background: linear-gradient(
        175deg,
        rgba(14, 14, 16, 0.98) 0%,
        rgba(8, 8, 10, 0.99) 100%
      );
    }

    .timeline-item {
      position: relative;
      padding-left: 1.15rem;
      padding-bottom: 1.15rem;
    }

    .timeline-item:not(.last)::before {
      content: '';
      position: absolute;
      left: 3px;
      top: 12px;
      bottom: -4px;
      width: 1px;
      background: linear-gradient(
        180deg,
        var(--keyra-border-accent) 0%,
        var(--keyra-border-subtle) 100%
      );
      opacity: 0.65;
    }

    .timeline-dot {
      position: absolute;
      left: 0;
      top: 5px;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--keyra-trust);
      box-shadow: 0 0 10px var(--keyra-trust-soft);
    }

    .timeline-body {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .timeline-event {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--keyra-white);
      line-height: 1.35;
      word-break: break-word;
    }

    .timeline-time {
      font-size: 0.6875rem;
      font-variant-numeric: tabular-nums;
      color: var(--keyra-muted);
    }

    @media (max-width: 720px) {
      .table-header {
        display: none;
      }

      .table-row {
        grid-template-columns: 1fr;
        gap: 0.35rem;
        padding: 1rem 1.15rem;
      }

      .col-date {
        text-align: left;
        justify-self: start;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .bank-tile:hover {
        transform: none;
      }
    }
  `,
})
export class DashboardComponent implements OnInit {
  user = inject(AuthService).user();
  participations: {
    id: string;
    countryCode: string;
    bankSlug: string;
    participantNumber: number;
    bank: { bankName: string; bankAdoptionStatus: string };
  }[] = [];
  messages: {
    id: string;
    subject: string;
    messageStatus: string;
    createdAt: string;
    bank: { bankName: string };
  }[] = [];
  activity: { id: string; eventType: string; createdAt: string }[] = [];
  private api = inject(ApiService);

  initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  formatEvent(type: string): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  ngOnInit() {
    this.api
      .get<{
        participations: DashboardComponent['participations'];
        messages: DashboardComponent['messages'];
        activityLog: DashboardComponent['activity'];
      }>('/campaign/dashboard')
      .subscribe((res) => {
        this.participations = res.participations;
        this.messages = res.messages;
        this.activity = res.activityLog;
      });
  }
}
