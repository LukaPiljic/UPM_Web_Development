import {HttpInterceptorFn, HttpResponse} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {tap} from 'rxjs';

// req is the outgoing request like POST /records

// intercept auf deutsch: abfangen, abhören
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token();

  let newReq = req;

  if (token) {
    newReq = req.clone({
      headers: req.headers.set('Authorization', token) // we only attach aa token if the user is actually logged in, we need to modify the copy
    });
  }

  // sends the modified req to the server
  // we wait for the answer (tap looks at the response)
  //we check if the server sent a header back with Authorization
  // we update the localStorage
  return next(newReq).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const newToken = event.headers.get('Authorization');
        if (newToken) {
          authService.updateToken(newToken);
        }
      }
    })
  );
};
