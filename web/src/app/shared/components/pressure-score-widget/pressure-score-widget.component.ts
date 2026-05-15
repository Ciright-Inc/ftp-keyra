import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-pressure-score-widget',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="pressure panel">
      <span class="stat-label">Pressure score</span>
      <span class="stat-value">{{ score | number: '1.0-1' }}</span>
      <p class="hint">Verified community advocacy intensity</p>
    </div>
  `,
  styles: `
    .pressure {
      text-align: center;
    }
    .hint {
      font-size: 0.75rem;
      margin: 0.5rem 0 0;
    }
  `,
})
export class PressureScoreWidgetComponent {
  @Input() score = 0;
}
