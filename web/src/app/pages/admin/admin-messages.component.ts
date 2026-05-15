import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [DatePipe],
  template: `
    <header class="admin-section-head">
      <div>
        <h2 class="admin-section-title">Message delivery log</h2>
        <p class="admin-section-sub">
          Authenticated outbound requests — delivery state and timestamps for compliance review.
        </p>
      </div>
      <span class="admin-chip">{{ messages.length }} records</span>
    </header>

    @if (messages.length) {
      <div class="admin-table-shell panel-premium">
        <div class="admin-table">
          <div class="admin-th admin-cols-message" role="row">
            <span>Bank</span>
            <span>Subject</span>
            <span>Status</span>
            <span class="admin-cell-mono">Queued / sent</span>
          </div>
          @for (m of messages; track m.id) {
            <div class="admin-tr admin-cols-message" role="row">
              <span class="admin-cell-strong">{{ m.bank?.bankName ?? '—' }}</span>
              <span class="admin-cell-muted subject-clip" [title]="m.subject">{{ m.subject }}</span>
              <span>
                <span
                  class="admin-status-pill"
                  [class.admin-status-pill--sent]="m.messageStatus === 'sent'"
                  >{{ m.messageStatus }}</span>
              </span>
              <span class="admin-cell-mono muted-date">{{ m.createdAt | date: 'MMM d, y · HH:mm' }}</span>
            </div>
          }
        </div>
      </div>
    } @else {
      <div class="admin-table-shell panel-premium admin-empty">No messages in log.</div>
    }
  `,
  styles: `
    .subject-clip {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }

    .muted-date {
      color: var(--keyra-muted);
      text-align: right;
      justify-self: end;
    }

    @media (max-width: 768px) {
      .muted-date {
        text-align: left;
        justify-self: start;
      }
    }
  `,
})
export class AdminMessagesComponent implements OnInit {
  messages: {
    id: string;
    subject: string;
    messageStatus: string;
    createdAt: string;
    bank?: { bankName: string };
  }[] = [];
  private api = inject(ApiService);

  ngOnInit() {
    this.api
      .get<{ messages: AdminMessagesComponent['messages'] }>('/admin/messages')
      .subscribe((r) => (this.messages = r.messages));
  }
}
