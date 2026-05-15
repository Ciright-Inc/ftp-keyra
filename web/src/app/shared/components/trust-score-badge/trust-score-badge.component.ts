import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-trust-score-badge',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <span class="trust-badge" [class.high]="score >= 70">
      Trust {{ score | number: '1.0-0' }}
    </span>
  `,
  styles: `
    .trust-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.35rem 0.65rem;
      border-radius: 999px;
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--keyra-muted);
      border: 1px solid var(--keyra-border-subtle);
      background: rgba(255, 255, 255, 0.03);
    }
    .trust-badge.high {
      color: var(--keyra-trust);
      border-color: var(--keyra-border-accent);
      background: var(--keyra-trust-soft);
      box-shadow: 0 0 20px var(--keyra-trust-soft);
    }
  `,
})
export class TrustScoreBadgeComponent {
  @Input() score = 0;
}
