import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-spots-remaining-meter',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="meter">
      <div class="labels">
        <span class="meter-label">Spots remaining</span>
        <div class="labels-right">
          <span class="meter-nums"
            >{{ remaining | number }} <span class="meter-sep">/</span>
            {{ max | number }}</span
          >
          <span class="meter-pct">{{ pctDisplay }}%</span>
        </div>
      </div>
      <div class="track" role="progressbar" [attr.aria-valuenow]="pctRounded" aria-valuemin="0" aria-valuemax="100">
        <div class="fill" [style.width.%]="pct"></div>
        <div class="fill-glow" [style.width.%]="pct"></div>
      </div>
    </div>
  `,
  styles: `
    .meter {
      width: 100%;
    }

    .labels {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 0.75rem;
      margin-bottom: 0.55rem;
    }

    .meter-label {
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--keyra-muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .labels-right {
      display: flex;
      align-items: baseline;
      gap: 0.6rem;
      text-align: right;
    }

    .meter-nums {
      font-size: 1.125rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;
      color: var(--keyra-white);
    }

    .meter-sep {
      font-weight: 500;
      color: var(--keyra-faint);
    }

    .meter-pct {
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--keyra-trust);
      letter-spacing: 0.04em;
      min-width: 2.75rem;
      text-align: right;
    }

    .track {
      position: relative;
      height: 8px;
      background: rgba(0, 0, 0, 0.45);
      border-radius: 999px;
      overflow: hidden;
      border: 1px solid var(--keyra-border-subtle);
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.04) inset;
    }

    .fill {
      position: relative;
      z-index: 1;
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(
        90deg,
        rgba(240, 240, 240, 0.95) 0%,
        rgba(200, 210, 255, 0.85) 55%,
        var(--keyra-trust) 100%
      );
      transition: width 0.45s var(--ease-out);
      box-shadow: 0 0 14px rgba(74, 124, 255, 0.25);
    }

    .fill-glow {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 0;
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, transparent, rgba(74, 124, 255, 0.35));
      filter: blur(6px);
      opacity: 0.85;
      pointer-events: none;
      transition: width 0.45s var(--ease-out);
    }

    @media (prefers-reduced-motion: reduce) {
      .fill,
      .fill-glow {
        transition: none;
      }
    }
  `,
})
export class SpotsRemainingMeterComponent {
  @Input() remaining = 10000;
  @Input() max = 10000;

  get pct(): number {
    if (!this.max) return 0;
    return Math.min(100, (this.remaining / this.max) * 100);
  }

  get pctRounded(): number {
    return Math.round(this.pct);
  }

  get pctDisplay(): number {
    return this.pctRounded;
  }
}
