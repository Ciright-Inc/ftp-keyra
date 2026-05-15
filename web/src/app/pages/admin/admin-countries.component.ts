import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-admin-countries',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <header class="admin-section-head">
      <div>
        <h2 class="admin-section-title">Countries</h2>
        <p class="admin-section-sub">
          Registry of active jurisdictions. Click a row to open the public country hub.
        </p>
      </div>
      <span class="admin-chip">{{ countries.length }} jurisdictions</span>
    </header>

    @if (countries.length) {
      <div class="admin-table-shell panel-premium">
        <div class="admin-table">
          <div class="admin-th admin-cols-country" role="row">
            <span>Country</span>
            <span>Code</span>
            <span class="admin-cell-mono">Scale</span>
          </div>
          @for (c of countries; track c.id) {
            <a class="admin-tr admin-cols-country" [routerLink]="['/', c.countryCode]" role="row">
              <div class="admin-country-cell">
                @if (c.flagUrl) {
                  <img class="admin-flag" [src]="c.flagUrl" [alt]="''" />
                } @else {
                  <span class="admin-flag PH" aria-hidden="true"></span>
                }
                <span class="admin-cell-strong">{{ c.countryName }}</span>
              </div>
              <span class="admin-code-tag">{{ c.countryCode }}</span>
              <span class="admin-cell-muted admin-cell-mono row-scale">
                <span>{{ c.bankCount | number }} banks · {{ c.participantCount | number }} advocates</span>
                <span class="admin-action-hint">Open →</span>
              </span>
            </a>
          }
        </div>
      </div>
    } @else {
      <div class="admin-table-shell panel-premium admin-empty">No countries loaded.</div>
    }
  `,
  styles: `
    .PH {
      display: inline-block;
      width: 28px;
      height: 18px;
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--keyra-border-subtle);
      vertical-align: middle;
    }

    .row-scale {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
  `,
})
export class AdminCountriesComponent implements OnInit {
  countries: {
    id: string;
    countryName: string;
    countryCode: string;
    flagUrl?: string | null;
    bankCount: number;
    participantCount: number;
  }[] = [];
  private api = inject(ApiService);

  ngOnInit() {
    this.api
      .get<{ countries: AdminCountriesComponent['countries'] }>('/admin/countries')
      .subscribe((r) => {
        this.countries = r.countries;
      });
  }
}
