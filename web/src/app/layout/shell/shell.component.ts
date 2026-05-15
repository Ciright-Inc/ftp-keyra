import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TrustScoreBadgeComponent } from '../../shared/components/trust-score-badge/trust-score-badge.component';
import { UserAvatarComponent } from '../../shared/components/user-avatar/user-avatar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, TrustScoreBadgeComponent, UserAvatarComponent],
  template: `
    <div class="shell-root">
      <header class="header">
        <div class="container header-inner">
          <a routerLink="/" class="brand">
            <span class="logo-mark">K</span>
            <span class="brand-text">
              <strong>KEYRA</strong>
              <small>For The People</small>
            </span>
          </a>
          <nav class="nav">
            <a routerLink="/dashboard" class="nav-link" routerLinkActive="active">Dashboard</a>
            @if (auth.user()?.isAdmin) {
              <a routerLink="/admin" class="nav-link" routerLinkActive="active">Admin</a>
            }
            @if (auth.isAuthenticated()) {
              <app-trust-score-badge [score]="auth.user()?.trustScore ?? 0" />
              <div class="nav-account">
                <div class="nav-user-profile">
                  <app-user-avatar
                    [fullName]="auth.user()!.fullName"
                    [email]="auth.user()!.email"
                    [avatarUrl]="auth.user()!.avatarUrl"
                    [size]="38"
                  />
                  <span class="nav-user-name">{{ auth.user()!.fullName }}</span>
                </div>
                <button
                  class="btn btn-secondary btn-sm nav-sign-out"
                  type="button"
                  (click)="auth.logout()"
                >
                  Sign out
                </button>
              </div>
            } @else {
              <a routerLink="/auth/sign-in" class="btn btn-primary btn-sm">Sign in</a>
            }
          </nav>
        </div>
      </header>
      <main class="main">
        <router-outlet />
      </main>
      <footer class="footer">
        <div class="footer-accent" aria-hidden="true"></div>
        <div class="footer-bg" aria-hidden="true"></div>
        <div class="container footer-body">
          <div class="footer-grid">
            <div class="footer-brand-block">
              <a routerLink="/" class="footer-brand">
                <span class="footer-logo-mark">K</span>
                <span class="footer-brand-text">
                  <strong>KEYRA</strong>
                  <small>For The People</small>
                </span>
              </a>
              <p class="footer-lead">
                Hardware-rooted trust for modern banking.
                <span class="footer-lead-dot">·</span>
                Verified humans only.
              </p>
              <div class="footer-pills">
                <span class="footer-pill">Audited requests</span>
                <span class="footer-pill footer-pill-trust">Trust-first</span>
              </div>
            </div>

            <nav class="footer-col" aria-label="Site navigation">
              <h3 class="footer-col-title">Explore</h3>
              <ul class="footer-links">
                <li><a routerLink="/">Home</a></li>
                <li><a routerLink="/dashboard">Dashboard</a></li>
                @if (auth.user()?.isAdmin) {
                  <li><a routerLink="/admin">Administration</a></li>
                }
              </ul>
            </nav>

            <nav class="footer-col" aria-label="Account">
              <h3 class="footer-col-title">Account</h3>
              <ul class="footer-links">
                @if (auth.isAuthenticated()) {
                  <li>
                    <button type="button" class="footer-link-btn" (click)="auth.logout()">Sign out</button>
                  </li>
                } @else {
                  <li><a routerLink="/auth/sign-in">Sign in</a></li>
                  <li><a routerLink="/auth/register">Register</a></li>
                }
              </ul>
            </nav>

            <div class="footer-col footer-aside">
              <h3 class="footer-col-title">Official site</h3>
              <p class="footer-aside-text">
                Campaign tooling and verified participant flows for KEYRA For The People.
              </p>
              <a
                class="footer-external"
                href="https://ftp.keyra.ie"
                target="_blank"
                rel="noopener noreferrer"
              >
                ftp.keyra.ie
                <span class="footer-external-icon" aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <div class="footer-bottom">
            <p class="footer-copy">
              © {{ year }} KEYRA. All rights reserved.
            </p>
            <div class="footer-meta">
              <span class="footer-meta-item">Movement · Not financial advice</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
    }

    .shell-root {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .header {
      border-bottom: 1px solid var(--keyra-border-subtle);
      padding: 0.875rem 0;
      position: sticky;
      top: 0;
      background: rgba(5, 5, 5, 0.82);
      backdrop-filter: blur(16px) saturate(1.2);
      -webkit-backdrop-filter: blur(16px) saturate(1.2);
      z-index: 100;
    }
    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .brand:hover {
      opacity: 1;
    }
    .logo-mark {
      width: 38px;
      height: 38px;
      border: 1px solid var(--keyra-border-subtle);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      letter-spacing: -0.02em;
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.06) 0%, transparent 55%);
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06) inset;
      transition:
        border-color 0.25s var(--ease-out),
        box-shadow 0.25s var(--ease-out);
    }
    .brand:hover .logo-mark {
      border-color: rgba(74, 124, 255, 0.35);
      box-shadow: 0 0 24px var(--keyra-trust-soft);
    }
    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }
    .brand-text strong {
      font-size: 0.9375rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .brand-text small {
      font-size: 0.625rem;
      color: var(--keyra-muted);
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-weight: 600;
    }
    .nav {
      display: flex;
      align-items: center;
      gap: 0.35rem 1.25rem;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .nav-link {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--keyra-muted);
      padding: 0.35rem 0;
      position: relative;
      transition: color 0.2s var(--ease-out);
    }
    .nav-link:hover {
      color: var(--keyra-white);
      opacity: 1;
    }
    .nav-link.active {
      color: var(--keyra-white);
    }
    .nav-link.active::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 2px;
      border-radius: 1px;
      background: linear-gradient(90deg, var(--keyra-trust), transparent);
      opacity: 0.85;
    }
    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.8125rem;
      font-weight: 600;
    }

    .nav-account {
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      flex-wrap: nowrap;
      margin-left: 0.15rem;
      padding-left: 1rem;
      border-left: 1px solid var(--keyra-border-subtle);
    }

    .nav-user-profile {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      min-width: 0;
    }

    .nav-user-name {
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--keyra-white);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: min(200px, 28vw);
    }

    .nav-sign-out {
      flex-shrink: 0;
    }

    @media (max-width: 520px) {
      .nav-account {
        flex-wrap: wrap;
        justify-content: flex-end;
        row-gap: 0.5rem;
        border-left: none;
        padding-left: 0;
        margin-left: 0;
        width: 100%;
      }

      .nav-user-name {
        max-width: min(160px, 42vw);
      }
    }
    .main {
      flex: 1;
      min-height: 0;
      padding: 0 0 clamp(2.5rem, 5vw, 4rem);
    }

    .footer {
      position: relative;
      margin-top: auto;
      padding: 0;
      overflow: hidden;
      border-top: 1px solid var(--keyra-border-subtle);
      background: linear-gradient(
        180deg,
        rgba(14, 14, 14, 0.98) 0%,
        rgba(5, 5, 5, 1) 55%
      );
    }

    .footer-accent {
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(74, 124, 255, 0.35) 45%,
        rgba(255, 255, 255, 0.08) 70%,
        transparent 100%
      );
      opacity: 0.9;
    }

    .footer-bg {
      pointer-events: none;
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 90% 70% at 15% 0%, rgba(74, 124, 255, 0.06) 0%, transparent 55%),
        radial-gradient(ellipse 60% 50% at 100% 100%, rgba(255, 255, 255, 0.02) 0%, transparent 45%);
    }

    .footer-body {
      position: relative;
      z-index: 1;
      padding: clamp(2rem, 4vw, 2.75rem) 0 clamp(1.5rem, 3vw, 2rem);
    }

    .footer-grid {
      display: grid;
      gap: clamp(1.75rem, 4vw, 2.5rem);
      grid-template-columns: 1fr;
    }

    @media (min-width: 560px) {
      .footer-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .footer-brand-block {
        grid-column: 1 / -1;
      }
    }

    @media (min-width: 900px) {
      .footer-grid {
        grid-template-columns: minmax(0, 1.35fr) repeat(3, minmax(0, 1fr));
        align-items: start;
      }
      .footer-brand-block {
        grid-column: auto;
      }
    }

    .footer-brand-block {
      max-width: 28rem;
    }

    .footer-brand {
      display: inline-flex;
      align-items: center;
      gap: 0.7rem;
      margin-bottom: 1rem;
    }

    .footer-brand:hover {
      opacity: 1;
    }

    .footer-logo-mark {
      width: 40px;
      height: 40px;
      border: 1px solid var(--keyra-border-subtle);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.05rem;
      letter-spacing: -0.02em;
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.07) 0%, transparent 55%);
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.05) inset;
    }

    .footer-brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }

    .footer-brand-text strong {
      font-size: 0.9375rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--keyra-white);
    }

    .footer-brand-text small {
      font-size: 0.625rem;
      color: var(--keyra-muted);
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-weight: 600;
    }

    .footer-lead {
      margin: 0 0 1rem;
      font-size: 0.875rem;
      line-height: 1.55;
      color: var(--keyra-muted);
      letter-spacing: 0.01em;
    }

    .footer-lead-dot {
      opacity: 0.35;
      margin: 0 0.35rem;
    }

    .footer-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .footer-pill {
      display: inline-flex;
      align-items: center;
      padding: 0.28rem 0.65rem;
      border-radius: 999px;
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--keyra-muted);
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid var(--keyra-divider);
    }

    .footer-pill-trust {
      color: var(--keyra-trust);
      border-color: var(--keyra-border-accent);
      background: var(--keyra-trust-soft);
    }

    .footer-col-title {
      margin: 0 0 0.85rem;
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--keyra-faint);
    }

    .footer-links {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .footer-links a {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--keyra-muted);
      transition: color 0.2s var(--ease-out);
    }

    .footer-links a:hover {
      color: var(--keyra-white);
      opacity: 1;
    }

    .footer-link-btn {
      display: inline;
      padding: 0;
      margin: 0;
      border: none;
      background: none;
      cursor: pointer;
      font-family: var(--font);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--keyra-muted);
      text-align: left;
      transition: color 0.2s var(--ease-out);
    }

    .footer-link-btn:hover {
      color: var(--keyra-white);
    }

    .footer-aside-text {
      margin: 0 0 0.85rem;
      font-size: 0.8125rem;
      line-height: 1.55;
      color: var(--keyra-muted);
    }

    .footer-external {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--keyra-trust);
    }

    .footer-external:hover {
      opacity: 1;
      color: var(--keyra-white);
    }

    .footer-external-icon {
      font-size: 0.75rem;
      opacity: 0.85;
    }

    .footer-bottom {
      margin-top: clamp(1.75rem, 4vw, 2.25rem);
      padding-top: 1.25rem;
      border-top: 1px solid var(--keyra-border-subtle);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    @media (min-width: 640px) {
      .footer-bottom {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }

    .footer-copy {
      margin: 0;
      font-size: 0.6875rem;
      color: var(--keyra-faint);
      letter-spacing: 0.05em;
    }

    .footer-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .footer-meta-item {
      font-size: 0.6875rem;
      color: var(--keyra-faint);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
  `,
})
export class ShellComponent implements OnInit {
  auth = inject(AuthService);
  readonly year = new Date().getFullYear();

  ngOnInit(): void {
    this.auth.refreshMe();
  }
}
