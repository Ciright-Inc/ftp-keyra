import { Component, Input, output, inject, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

export interface Country {
  countryCode: string;
  countryName: string;
  flagUrl?: string;
  bankCount: number;
}

@Component({
  selector: 'app-country-selector',
  standalone: true,
  template: `
    <label for="country">Select country</label>
    <select id="country" [value]="selected" (change)="onChange($event)">
      <option value="">Choose your country</option>
      @for (c of countries; track c.countryCode) {
        <option [value]="c.countryCode">{{ c.countryName }}</option>
      }
    </select>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class CountrySelectorComponent implements OnInit {
  @Input() selected = '';
  countryChange = output<string>();
  countries: Country[] = [];
  private api = inject(ApiService);

  ngOnInit() {
    this.api.get<{ countries: Country[] }>('/countries').subscribe((res) => {
      this.countries = res.countries;
    });
  }

  onChange(e: Event) {
    const v = (e.target as HTMLSelectElement).value;
    this.countryChange.emit(v);
  }
}
