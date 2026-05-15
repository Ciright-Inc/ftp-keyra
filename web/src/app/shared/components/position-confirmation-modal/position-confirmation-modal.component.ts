import { Component, Input, output } from '@angular/core';

@Component({
  selector: 'app-position-confirmation-modal',
  standalone: true,
  template: `
    @if (open) {
      <div class="overlay" (click)="close.emit()">
        <div class="modal panel" (click)="$event.stopPropagation()">
          <div class="glow"></div>
          <h2>Your verified position has been secured.</h2>
          <p class="position">Position #{{ participantNumber }}</p>
          <p>Bank: <strong>{{ bankName }}</strong></p>
          <p>Country: <strong>{{ country }}</strong></p>
          <button class="btn btn-primary" type="button" (click)="close.emit()">Continue</button>
        </div>
      </div>
    }
  `,
  styles: `
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal { max-width: 420px; text-align: center; position: relative; }
    .glow { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); width: 120px; height: 120px; background: var(--keyra-trust-glow); border-radius: 50%; filter: blur(40px); pointer-events: none; }
    .position { font-size: 2rem; color: var(--keyra-trust); margin: 1rem 0; }
  `,
})
export class PositionConfirmationModalComponent {
  @Input() open = false;
  @Input() participantNumber = 0;
  @Input() bankName = '';
  @Input() country = '';
  close = output<void>();
}
