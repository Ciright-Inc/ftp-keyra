import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent) },
      {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'auth/sign-in',
        loadComponent: () => import('./pages/auth/sign-in.component').then((m) => m.SignInComponent),
      },
      {
        path: 'auth/register',
        loadComponent: () => import('./pages/auth/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/admin/admin.component').then((m) => m.AdminComponent),
        children: [
          { path: '', redirectTo: 'countries', pathMatch: 'full' },
          {
            path: 'countries',
            loadComponent: () =>
              import('./pages/admin/admin-countries.component').then((m) => m.AdminCountriesComponent),
          },
          {
            path: 'banks',
            loadComponent: () =>
              import('./pages/admin/admin-banks.component').then((m) => m.AdminBanksComponent),
          },
          {
            path: 'messages',
            loadComponent: () =>
              import('./pages/admin/admin-messages.component').then((m) => m.AdminMessagesComponent),
          },
          {
            path: 'participants',
            loadComponent: () =>
              import('./pages/admin/admin-participants.component').then((m) => m.AdminParticipantsComponent),
          },
          {
            path: 'security',
            loadComponent: () =>
              import('./pages/admin/admin-security.component').then((m) => m.AdminSecurityComponent),
          },
        ],
      },
      {
        path: ':countryCode',
        loadComponent: () => import('./pages/country/country.component').then((m) => m.CountryComponent),
      },
      {
        path: ':countryCode/:bankSlug',
        loadComponent: () => import('./pages/bank/bank.component').then((m) => m.BankComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
