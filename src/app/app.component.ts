import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthService} from "./services/auth.service";
import {PlaceholderDirective} from "./shared/placeholder/placeholder.directive";
import {AlertComponent} from "./shared/alert/alert.component";
import {Subscription} from "rxjs";
import {AlertService} from "./services/alert.service";
import {SocketService} from "./services/socket.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'ng-socketio-app';
  // helper directive to get host view container ref
  @ViewChild(PlaceholderDirective) alertHost!: PlaceholderDirective;
  private closeSub!: Subscription;
  private subArr: Subscription[] = [];

  constructor(private authService: AuthService, private alertService: AlertService, private socketService: SocketService) {
  }

  ngOnInit(): void {
    this.authService.autoSignIn();
    // subscribe to alertService in order to receive alert messages
    const alertSub = this.alertService.alertSubject.subscribe((err: string) => {
      this.showErrorAlert(err);
    });
    // subscribe to socketIO error event in case of failed SocketIO connection
    const socketIOErrorSub = this.socketService.onErrorReceived().subscribe((err: any) => {
      // show alert with err message
      this.alertService.onAlertReceived(err.message);
      // auto logout user if no SocketIO connection established
      this.authService.logout();
    });
    // add to subArr in order to unsubscribe on destroy and avoid memory leeks
    this.subArr = [alertSub, socketIOErrorSub];
  }

  ngOnDestroy(): void {
    this.subArr.forEach(sub => sub.unsubscribe());
  }

  // show errorAlert component on err
  private showErrorAlert(errorMessage: string) {

    if (this.alertHost) {
      //get hostViewContainer ref by using alertHost directive
      const hostViewContainer = this.alertHost.viewContainerRef;
      hostViewContainer.clear();

      // create the AlertComponent on the hostViewContainer
      const componentRef = hostViewContainer.createComponent(AlertComponent);

      // send @Input message to the AlertComponent in order to show error message
      componentRef.instance.message = errorMessage;
      // close AlertComponent
      this.closeSub = componentRef.instance.close.subscribe(() => {
        hostViewContainer.clear();
        this.closeSub.unsubscribe();
      });
    }
  }
}
