import {Injectable} from '@angular/core';
import {BehaviorSubject, throwError} from "rxjs";
import {User} from "../interfaces/user";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Router} from "@angular/router";
import {AuthResponse} from "../interfaces/auth-response";
import {environment} from "../../environments/environment";
import {catchError, tap} from "rxjs/operators";
import {CustomSocket} from "./customSocket";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // a behaviour subject gives access to the previous emitted instance of data even if no subscription was available then
  userSubject = new BehaviorSubject<User | null>(null);
  tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router, private socket: CustomSocket) {
  }

  // send signUp request to server
  signUp = (name: string, email: string, password: string) => {
    return this.http.post<AuthResponse>(`${environment.serverUrl}/user/signup`, {
      name,
      email,
      password
    }, {withCredentials: true})
      .pipe(catchError(this.handleError),
        tap((resData: AuthResponse) => {
          this.handleAuthentication(resData.message, resData.user, resData.expiresIn);
        })
      );
  }

  // send signIn request to server
  // withCredentials: true => is enabled because out API and Angular domains are different. It helps attach the cookie to API calls for cross-site requests
  signIn = (email: string, password: string) => {
    return this.http.post<AuthResponse>(`${environment.serverUrl}/user/signin`, {
      email,
      password
    }, {withCredentials: true})
      .pipe(catchError(this.handleError),
        tap((resData: AuthResponse) => {
          this.handleAuthentication(resData.message, resData.user, resData.expiresIn);
        })
      );
  }

  // send logout request to server
  logout = () => {
    this.http.post(`${environment.serverUrl}/user/logout`, null, {withCredentials: true})
      .pipe(catchError(this.handleError))
      .subscribe(() => {
        this.handleUserStateOnLogout();
      });
  }

  // update local user state on logout
  handleUserStateOnLogout = () => {
    console.log('AuthService: HandleUserStateOnLogout() Called!');
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
  }

  // autoLogin user on page reload (if user was logged in in the first place)
  autoSignIn = () => {
    const userData: User = JSON.parse(localStorage.getItem('userData')!);
    if (!userData) {
      return;
    }
    if (userData.expirationDate && new Date(userData.expirationDate!).getTime() > 0) {
      this.userSubject.next(userData);
      // calculate new token expiration and set autoSignOut
      const expirationDuration = new Date(userData.expirationDate!).getTime() - new Date().getTime();

      // if token has already passed logout user
      if (expirationDuration < 0) {
        this.handleUserStateOnLogout();
        this.logout();
      }
      // set autoLogout timer
      this.autoLogOut(expirationDuration);
      // restart socketIO connection
      this.socket.connect();
    }
  }

  // setup autoLogOut to token expiration time
  autoLogOut = (expirationDuration: number) => {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
      console.log('AutoLogOut() called');
    }, expirationDuration);
  }

  // return err message
  private handleError = (errorResponse: HttpErrorResponse) => {
    //setup generic err message
    let errMessage = 'An unknown error occurred!';
    // check if error response contains specific message and throw it, if not throw generic
    if (!errorResponse.error.message) {
      return throwError(errMessage);
    }
    if (errorResponse.error.message === 'Unauthorized action.') {
      this.handleUserStateOnLogout();
      errMessage = errorResponse.error.message;
      return throwError(errMessage);
    }
    if (errorResponse.error.message.split(' ')[0] === 'Error:') {
      errMessage = errorResponse.error.message;
    }
    return throwError(errMessage);
  }

  // Handle authentication logic
  private handleAuthentication = (message: string, user: User, expiresIn: number) => {
    // set expiration date for recalculating token expiration timer on user reload page (this is saved to the local state)
    user.expirationDate = new Date(new Date().getTime() + (expiresIn * 1000));
    // set behaviourSubject to returned user
    this.userSubject.next(user);
    // set autoLogout timer equal to token expiration duration
    this.autoLogOut(expiresIn * 1000);
    // save user state to localstorage
    localStorage.setItem('userData', JSON.stringify(user));
    // start socketIO connection
    this.socket.connect();
  }
}
