import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-admin-participants',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <header class="admin-section-head">
      <div>
        <h2 class="admin-section-title">Participants</h2>
        <p class="admin-section-sub">
          Verified holders of campaign positions — linked users and institutions (recent slice).
        </p>
      </div>
      <span class="admin-chip">{{ participants.length }} rows</span>
    </header>

    @if (participants.length) {
      <div class="admin-table-shell panel-premium">
        <div class="admin-table">
          <div class="admin-th admin-cols-participant" role="row">
            <span class="admin-cell-mono">Position</span>
            <span>Bank</span>
            <span>Verified identity</span>
          </div>
          @for (p of participants; track p.id) {
            <div class="admin-tr admin-cols-participant" role="row">
              <span class="admin-code-tag mono-num">#{{ p.participantNumber | number }}</span>
              @if (p.bank?.bankName) {
                <a class="admin-cell-strong bank-link" [routerLink]="['/', p.countryCode, p.bankSlug]">{{
                  p.bank!.bankName
                }}</a>
              } @else {
                <span class="admin-cell-strong">—</span>
              }
              <div class="user-cell">
                <span class="admin-cell-strong small">{{ p.user?.fullName ?? '—' }}</span>
                <span class="admin-cell-muted admin-cell-mono email">{{ p.user?.email }}</span>
              </div>
            </div>
          }
        </div>
      </div>
    } @else {
      <div class="admin-table-shell panel-premium admin-empty">No participant rows.</div>
    }
  `,
  styles: `
    .mono-num {
      font-variant-numeric: tabular-nums;
    }

    .bank-link {
      text-decoration: none;
      color: inherit;
    }

    .bank-link:hover {
      color: var(--keyra-trust);
      opacity: 1;
    }

    .user-cell {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      min-width: 0;
    }

    .user-cell .small {
      font-size: 0.8125rem;
    }

    .email {
      font-size: 0.75rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .admin-cols-participant {
      grid-template-columns: minmax(72px, auto) minmax(100px, 1fr) minmax(160px, 2fr);
    }
  `,
})
export class AdminParticipantsComponent implements OnInit {
  participants: {
    id: string;
    participantNumber: number;
    countryCode: string;
    bankSlug: string;
    user?: { fullName: string; email: string };
    bank?: { bankName: string };
  }[] = [];
  private api = inject(ApiService);

  ngOnInit() {
    this.api
      .get<{ participants: AdminParticipantsComponent['participants'] }>('/admin/participants')
      .subscribe((r) => (this.participants = r.participants));
  }
}
