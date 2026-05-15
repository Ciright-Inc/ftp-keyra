import { Component, Input, OnChanges, signal } from '@angular/core';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  template: `
    @if (!fallback()) {
      <img
        class="user-avatar-img"
        [src]="resolvedSrc"
        [alt]="fullName"
        [width]="size"
        [height]="size"
        loading="lazy"
        decoding="async"
        (error)="fallback.set(true)"
      />
    } @else {
      <span
        class="user-avatar-fallback"
        [style.width.px]="size"
        [style.height.px]="size"
        [style.fontSize.px]="fallbackFontPx"
        role="img"
        [attr.aria-label]="fullName"
      >
        {{ initials }}
      </span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
      vertical-align: middle;
    }

    .user-avatar-img {
      display: block;
      border-radius: 50%;
      object-fit: cover;
      border: 1px solid var(--keyra-border-subtle);
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06) inset;
    }

    .user-avatar-fallback {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: var(--keyra-white);
      background: linear-gradient(145deg, var(--keyra-graphite) 0%, #0a0a0a 100%);
      border: 1px solid var(--keyra-divider);
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.05) inset;
    }
  `,
})
export class UserAvatarComponent implements OnChanges {
  @Input({ required: true }) fullName!: string;
  @Input() email = '';
  /** Optional profile image URL from API when available */
  @Input() avatarUrl?: string | null;
  @Input() size = 36;

  fallback = signal(false);

  get fallbackFontPx(): number {
    return Math.max(11, Math.round(this.size * 0.38));
  }

  ngOnChanges(): void {
    this.fallback.set(false);
  }

  get resolvedSrc(): string {
    const custom = this.avatarUrl?.trim();
    if (custom) return custom;
    const label = encodeURIComponent(this.fullName?.trim() || this.email?.trim() || 'User');
    return `https://ui-avatars.com/api/?name=${label}&background=161616&color=e8e8e8&size=128&bold=true`;
  }

  get initials(): string {
    const raw = (this.fullName || this.email || '?').trim();
    const parts = raw.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
