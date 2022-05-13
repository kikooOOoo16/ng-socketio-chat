import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  alertSubject = new BehaviorSubject<string>('');

  constructor() {
  }

  onAlertReceived = (alertMessage: string) => {
    console.log('OnAlertReceived triggered !');
    this.alertSubject.next(alertMessage);
  }
}
