import { Component, Input } from '@angular/core';

const LABELS: Record<string, string> = {
  not_started: 'Not started',
  community_building: 'Community building',
  bank_notified: 'Bank notified',
  under_review: 'Under review',
  technical_discussion: 'Technical discussion',
  pilot_requested: 'Pilot requested',
  integration_pending: 'Integration pending',
  implemented: 'Implemented',
  declined: 'Declined',
};

@Component({
  selector: 'app-adoption-status-badge',
  standalone: true,
  template: `<span class="adoption-badge">{{ label }}</span>`,
  styles: `
    .adoption-badge {
      display: inline-block;
      padding: 0.28rem 0.65rem;
      border-radius: 999px;
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--keyra-muted);
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid var(--keyra-divider);
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.04) inset;
    }
  `,
})
export class AdoptionStatusBadgeComponent {
  @Input() set status(v: string) {
    this.label = LABELS[v] ?? v;
  }
  label = '';
}
