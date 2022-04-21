import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpParams, HttpRequest} from '@angular/common/http';
import {Observable, take} from 'rxjs';
import {AuthService} from "../services/auth.service";
import {exhaustMap, map} from "rxjs/operators";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.userSubject.pipe(
      take(1),
      map(userData => {
        if (userData) {
          return userData.token
        } else {
          return next.handle(request);
        }
      }),
      exhaustMap((token) => {
        if (token !== '' && token !== undefined) {
          const authRequest = request.clone({
            headers: request.headers.set('Authorization', `Bearer ${token}`)
          });
          return next.handle(authRequest);
        }
        return next.handle(request);
      })
    );
  }
}
