import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-admin-security',
  standalone: true,
  imports: [DatePipe],
  template: `
    <header class="admin-section-head">
      <div>
        <h2 class="admin-section-title">Abuse monitor</h2>
        <p class="admin-section-sub">
          Automated blocks and duplicate attempts — SOC-style visibility without noisy alerts.
        </p>
      </div>
      <span class="admin-chip">{{ blocked.length }} events</span>
    </header>

    @if (blocked.length) {
      <div class="admin-table-shell panel-premium">
        <div class="admin-table">
          <div class="admin-th admin-cols-security" role="row">
            <span>Event</span>
            <span class="admin-cell-mono">Timestamp</span>
          </div>
          @for (e of blocked; track e.id) {
            <div class="admin-tr admin-cols-security" role="row">
              <span class="admin-cell-strong">{{ formatEvent(e.eventType) }}</span>
              <span class="admin-cell-muted admin-cell-mono">{{ e.createdAt | date: 'MMM d, y · HH:mm:ss' }}</span>
            </div>
          }
        </div>
      </div>
    } @else {
      <div class="admin-table-shell panel-premium admin-empty">
        No blocked events on record — verification flows are clean.
      </div>
    }
  `,
})
export class AdminSecurityComponent implements OnInit {
  blocked: { id: string; eventType: string; createdAt: string }[] = [];
  private api = inject(ApiService);

  formatEvent(type: string): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  ngOnInit() {
    this.api
      .get<{ blocked: AdminSecurityComponent['blocked'] }>('/admin/security')
      .subscribe((r) => (this.blocked = r.blocked));
  }
}
