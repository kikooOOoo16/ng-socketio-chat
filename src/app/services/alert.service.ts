import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  alertSubject = new BehaviorSubject<string>('');

  constructor() {
  }

  onAlertReceived = (alert: string) => {
    this.alertSubject.next(alert);
  }
}
