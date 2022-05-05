import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, take} from 'rxjs';
import {AuthService} from "../services/auth.service";
import {map} from "rxjs/operators";


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.userSubject.pipe(
      take(1),
      map(userData => {
        // check if userData exists and if it does that the token expirationDate hasn't passed, return true
        if (userData && userData.expirationDate && new Date(userData.expirationDate!).getTime() > 0) {
          return true;
        }
        // if above check failed reroute user to /auth
        return this.router.createUrlTree(['/auth']);
      })
    )
  }
}
