import {Component, OnInit, ViewChild} from '@angular/core';
import {AuthService} from "./services/auth.service";
import {PlaceholderDirective} from "./shared/placeholder/placeholder.directive";
import {AlertComponent} from "./shared/alert/alert.component";
import {Subscription} from "rxjs";
import {AlertService} from "./services/alert.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ng-socketio-app';
  // helper directive to get host view container ref
  @ViewChild(PlaceholderDirective) alertHost!: PlaceholderDirective;
  private closeSub!: Subscription;
  private alertSub!: Subscription;

  constructor(private authService: AuthService, private alertService: AlertService) {
  }

  ngOnInit(): void {
    this.authService.autoSignIn();
    this.alertSub = this.alertService.alertSubject.subscribe((err: string) => {
      this.showErrorAlert(err);
    });
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
