import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Paths where we never attach Bearer (avoid invalid JWT breaking login/register). */
function isPublicAuthUrl(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register')
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  let outgoing = req;
  const token = localStorage.getItem('keyra_ftp_token');

  if (token && !isPublicAuthUrl(req.url)) {
    outgoing = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(outgoing).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) {
        return throwError(() => err);
      }

      // Wrong password etc. — keep user on sign-in/register.
      if (isPublicAuthUrl(req.url)) {
        return throwError(() => err);
      }

      auth.logout();

      const onAuthPage = router.url.startsWith('/auth/');
      if (!onAuthPage) {
        router.navigate(['/auth/sign-in'], {
          queryParams: { reason: 'session' },
        });
      }

      return throwError(() => err);
    })
  );
};
