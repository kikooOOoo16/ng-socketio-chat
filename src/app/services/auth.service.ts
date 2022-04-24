import {Injectable} from '@angular/core';
import {BehaviorSubject, throwError} from "rxjs";
import {User} from "../interfaces/user";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Router} from "@angular/router";
import {AuthResponse} from "../interfaces/auth-response";
import {environment} from "../../environments/environment";
import {catchError, tap} from "rxjs/operators";
import {Socket} from "ngx-socket-io";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // a behaviour subject gives access to the previous emitted instance of data even if no subscription was available then
  userSubject = new BehaviorSubject<User | null>(null);
  tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router, private socket: Socket) {
  }

  // send signUp request to server
  signUp = (name: string, email: string, password: string) => {
    return this.http.post<AuthResponse>(`${environment.serverUrl}/user/signup`, {name, email, password})
      .pipe(catchError(this.handleError),
        tap((resData: AuthResponse) => {
          this.handleAuthentication(resData.message, resData.user, resData.token, resData.expiresIn);
        })
      );
  }

  // send signIn request to server
  signIn = (email: string, password: string) => {
    return this.http.post<AuthResponse>(`${environment.serverUrl}/user/signin`, {email, password})
      .pipe(catchError(this.handleError),
        tap((resData: AuthResponse) => {
          this.handleAuthentication(resData.message, resData.user, resData.token, resData.expiresIn);
        })
      );
  }

  logout = () => {
    this.http.post(`${environment.serverUrl}/user/logout`, null)
      .pipe(catchError(this.handleError))
      .subscribe(() => {
        // set userSubject next to null
        this.userSubject.next(null);
        // remove local user state
        localStorage.removeItem('userData');
        // reset tokenExpirationTimer
        if (this.tokenExpirationTimer) {
          clearTimeout(this.tokenExpirationTimer);
        }
        this.tokenExpirationTimer = null;
        //disconnect socketIO connection
        this.socket.disconnect();
        // navigate to auth component
        this.router.navigate(['/auth']);
      });
  }

  // return err message
  private handleError = (errorResponse: HttpErrorResponse) => {
    //setup generic err message
    let errMessage = 'An unknown error occurred!';
    // check if error response contains specific message and throw it, if not throw generic
    if (!errorResponse.error.message) {
      return throwError(errMessage);
    }
    if (errorResponse.error.message.split(' ')[0] === 'Error:') {
      errMessage = errorResponse.error.message;
    }
    return throwError(errMessage);
  }

  // Handle authentication logic
  private handleAuthentication = (message: string, user: User, token: string, expiresIn: number) => {
    // set expiration date for recalculating token expiration timer on user reload page (this is saved to the local state)
    user.expirationDate = new Date(new Date().getTime() + (expiresIn * 1000));
    // set token value on userObj
    user.token = token;
    // set behaviourSubject to returned user
    this.userSubject.next(user);
    // set autoLogout timer equal to token expiration duration
    this.autoSignOut(expiresIn * 1000);
    // save user state to localstorage
    localStorage.setItem('userData', JSON.stringify(user));
  }

  // autoLogin user on page reload (if user was logged in in the first place)
  autoSignIn = () => {
    const userData: User = JSON.parse(localStorage.getItem('userData')!);
    if (!userData) {
      return;
    }
    if (userData.token) {
      this.userSubject.next(userData);
      // calculate new token expiration and set autoSignOut
      const expirationDuration = new Date(userData.expirationDate!).getTime() - new Date().getTime();
      this.autoSignOut(expirationDuration);
    }
  }

  // setup autoLogOut to token expiration time
  autoSignOut = (expirationDuration: number) => {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }
}
