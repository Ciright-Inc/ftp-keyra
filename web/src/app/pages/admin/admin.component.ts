import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
    <section class="container admin-console">
      <header class="admin-console-header">
        <p class="admin-console-eyebrow">
          <span class="admin-console-eyebrow-dot" aria-hidden="true"></span>
          Operations console
        </p>
        <h1 class="admin-console-title">Administration</h1>
        <p class="admin-console-lead">
          Manage countries, banks, outbound messages, participants, and abuse signals.
          Changes are audited and reflected across public campaign surfaces.
        </p>
      </header>

      <nav class="admin-tab-bar" aria-label="Admin sections">
        <a
          routerLink="/admin/countries"
          routerLinkActive="admin-tab-active"
          class="admin-tab"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
          </svg>
          Countries
        </a>
        <a routerLink="/admin/banks" routerLinkActive="admin-tab-active" class="admin-tab">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
            <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
          </svg>
          Banks
        </a>
        <a routerLink="/admin/messages" routerLinkActive="admin-tab-active" class="admin-tab">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
            <path d="M4 4h16v12H8l-4 4V4z" />
          </svg>
          Messages
        </a>
        <a routerLink="/admin/participants" routerLinkActive="admin-tab-active" class="admin-tab">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Participants
        </a>
        <a routerLink="/admin/security" routerLinkActive="admin-tab-active" class="admin-tab">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Security
        </a>
      </nav>

      <div class="admin-outlet-wrap">
        <router-outlet />
      </div>
    </section>
  `,
})
export class AdminComponent {}
