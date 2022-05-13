import { Injectable } from '@angular/core';
import {AuthService} from "./auth.service";
import {Router} from "@angular/router";
import {AlertService} from "./alert.service";

@Injectable({
  providedIn: 'root'
})
export class SocketHelperService {

  constructor(private authService: AuthService, private router: Router, private alertService: AlertService) { }

  handleCallbackEmitWhenNotInRoom = (callback: { message: string; field?: string }[]): {err: boolean} => {
    if (callback && callback.length && callback[0].message && callback[0].message.split(' ')[0] === 'Error:') {

      this.checkIfUserTokenExpired(callback[0].message);
      this.alertService.onAlertReceived(callback[0].message);
      return {err: true};
    }
    return {err: false};
  }

  handleCallbackEmitWhenInRoom = (callback: { message: string; field?: string }[]) => {
    // check if server returned an error
    if (callback && callback.length && callback[0].message && callback[0].message.split(' ')[0] === 'Error:') {

      this.checkIfUserTokenExpired(callback[0].message);
      this.checkIfUserNotInRoom(callback[0].message);
      this.alertService.onAlertReceived(callback[0].message);
      return;
    }
  }

  checkIfUserTokenExpired = (callbackMessage: string) => {
    if (callbackMessage === 'Error: User token has expired.') {
      // if token expired logout user.
      this.authService.handleUserStateOnLogout();
      return;
    }
  }

  checkIfUserNotInRoom = (callback: string) => {
    if (callback === 'Error: The requested user is not in the current room.') {
      this.router.navigate([`/chat-rooms-list`]);
    }
  }
}
