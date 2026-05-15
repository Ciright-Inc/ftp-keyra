import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AdoptionStatusBadgeComponent } from '../../shared/components/adoption-status-badge/adoption-status-badge.component';

@Component({
  selector: 'app-admin-banks',
  standalone: true,
  imports: [RouterLink, DecimalPipe, AdoptionStatusBadgeComponent],
  template: `
    <header class="admin-section-head">
      <div>
        <h2 class="admin-section-title">Banks</h2>
        <p class="admin-section-sub">
          Institution campaigns, adoption stage, and fill rate against verified caps.
        </p>
      </div>
      <span class="admin-chip">{{ banks.length }} institutions</span>
    </header>

    @if (banks.length) {
      <div class="admin-table-shell panel-premium">
        <div class="admin-table">
          <div class="admin-th admin-cols-bank" role="row">
            <span>Bank</span>
            <span class="admin-cell-mono">Locale</span>
            <span class="admin-cell-mono">Fill</span>
            <span>Stage</span>
          </div>
          @for (b of banks; track b.id) {
            <a
              class="admin-tr admin-cols-bank"
              [routerLink]="['/', b.countryCode, b.bankSlug]"
              role="row"
            >
              <span class="admin-cell-strong">{{ b.bankName }}</span>
              <span class="admin-code-tag">{{ b.countryCode }}</span>
              <span class="admin-cell-muted admin-cell-mono">
                {{ b.participantCount | number }} / {{ b.maxSpots | number }}
              </span>
              <span class="bank-stage"><app-adoption-status-badge [status]="b.bankAdoptionStatus" /></span>
            </a>
          }
        </div>
      </div>
    } @else {
      <div class="admin-table-shell panel-premium admin-empty">No banks loaded.</div>
    }
  `,
  styles: `
    .bank-stage {
      justify-self: start;
    }

    @media (max-width: 768px) {
      .bank-stage {
        justify-self: stretch;
      }
    }
  `,
})
export class AdminBanksComponent implements OnInit {
  banks: {
    id: string;
    bankName: string;
    countryCode: string;
    bankSlug: string;
    participantCount: number;
    maxSpots: number;
    bankAdoptionStatus: string;
  }[] = [];
  private api = inject(ApiService);

  ngOnInit() {
    this.api
      .get<{ banks: AdminBanksComponent['banks'] }>('/admin/banks')
      .subscribe((r) => (this.banks = r.banks));
  }
}
