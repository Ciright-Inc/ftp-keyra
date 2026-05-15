import { Component, Input, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { debounceTime, Subject, switchMap } from 'rxjs';

type BankSearchResult = {
  id: string;
  bankName: string;
  bankSlug: string;
  countryCode: string;
  country?: { countryName: string };
};

@Component({
  selector: 'app-bank-search',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <label for="bank-q">Search your bank</label>
    <input
      id="bank-q"
      type="search"
      [(ngModel)]="query"
      (ngModelChange)="search$.next($event)"
      placeholder="Bank name..."
    />
    @if (results.length) {
      <ul class="results">
        @for (b of results; track b.id) {
          <li>
            <a [routerLink]="['/', b.countryCode, b.bankSlug]">{{ b.bankName }}</a>
            <span class="meta">{{ b.country?.countryName }}</span>
          </li>
        }
      </ul>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .results {
      list-style: none;
      padding: 0.35rem;
      margin: 0.75rem 0 0;
      border-radius: var(--radius-sm);
      border: 1px solid var(--keyra-border-subtle);
      background: rgba(0, 0, 0, 0.28);
      max-height: 280px;
      overflow-y: auto;
    }
    li {
      padding: 0.85rem 0.65rem;
      border-radius: var(--radius-sm);
      transition: background 0.2s var(--ease-out);
    }
    li:hover {
      background: rgba(255, 255, 255, 0.04);
    }
    li + li {
      border-top: 1px solid var(--keyra-border-subtle);
    }
    li a {
      font-weight: 500;
      letter-spacing: -0.02em;
    }
    .meta {
      display: block;
      font-size: 0.75rem;
      color: var(--keyra-muted);
      margin-top: 0.2rem;
    }
  `,
})
export class BankSearchComponent {
  @Input() countryCode = '';
  query = '';
  results: BankSearchResult[] = [];
  selected = output<unknown>();
  search$ = new Subject<string>();
  private api = inject(ApiService);

  constructor() {
    this.search$
      .pipe(
        debounceTime(300),
        switchMap((q) =>
          this.api.get<{ banks: BankSearchResult[] }>(
            `/banks/search?q=${encodeURIComponent(q)}${this.countryCode ? `&country=${this.countryCode}` : ''}`
          )
        )
      )
      .subscribe((res) => (this.results = res.banks));
  }
}
