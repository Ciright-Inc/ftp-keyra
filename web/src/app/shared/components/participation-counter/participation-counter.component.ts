import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-participation-counter',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="counter">
      <span class="stat-value">{{ count | number }}</span>
      <span class="stat-label">{{ label }}</span>
    </div>
  `,
  styles: `
    .counter {
      text-align: center;
    }
  `,
})
export class ParticipationCounterComponent {
  @Input() count = 0;
  @Input() label = 'Verified participants';
}
