import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpParams, HttpRequest} from '@angular/common/http';
import {Observable, take} from 'rxjs';
import {AuthService} from "../services/auth.service";
import {exhaustMap} from "rxjs/operators";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.userSubject.pipe(
      take(1),
      exhaustMap((userData) => {
        if (!userData) {
          return next.handle(request);
        }
        const modifiedRequest = request.clone(
          {params: new HttpParams().set('auth', userData.token!)}
        );
        return next.handle(modifiedRequest);
      })
    )
  }
}
