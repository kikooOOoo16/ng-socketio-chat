import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../services/auth.service";
import {Observable, Subscription} from "rxjs";
import {AuthResponse} from "../interfaces/auth-response";
import {Router} from "@angular/router";
import {AlertComponent} from "../shared/alert/alert.component";
import {PlaceholderDirective} from "../shared/placeholder/placeholder.directive";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {

  signUpForm!: FormGroup;
  signInForm!: FormGroup;
  isSignInMode = true;
  isLoading = false;
  private error: string = '';
  // helper directive to get host view container ref
  @ViewChild(PlaceholderDirective) alertHost!: PlaceholderDirective;
  private closeSub!: Subscription;

  constructor(private authService: AuthService, private router: Router) {
  }

  ngOnInit(): void {
    this.signUpForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });

    this.signInForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  ngOnDestroy(): void {
    if (this.closeSub) {
      this.closeSub.unsubscribe();
    }
  }

  authFormSubmit() {
    let authObs: Observable<AuthResponse>;
    this.isLoading = true;

    if (this.isSignInMode) {
      if (this.signInForm.invalid) {
        return;
      }
      // get values
      const email = this.signInForm.get('email')!.value;
      const password = this.signInForm.get('password')!.value;

      // call auth service signIp which sends http request to server
      authObs = this.authService.signIn(email, password);

      // reset form at th end
      this.signInForm.reset();
    } else {
      // check if form is not valid
      if (this.signUpForm.invalid) {
        return;
      }
      //get values
      const email = this.signUpForm.get('email')!.value;
      const password = this.signUpForm.get('password')!.value;
      const name = this.signUpForm.get('name')!.value;

      // call auth service signUp which sends http request to server
      authObs = this.authService.signUp(name, email, password);

      // reset form at the end
      this.signUpForm.reset();
    }

    // subscribe to http request to send it through
    authObs.subscribe(resData => {
      this.isLoading = false;
      this.router.navigate(['/chat-rooms-list']);
    }, errorMessage => {
      this.error = errorMessage;
      this.showErrorAlert(errorMessage);
      this.isLoading = false;
    })
  }

  // store auth state switch value
  onSwitchMode() {
    this.isSignInMode = !this.isSignInMode;
  }

  // show errorAlert component on err
  private showErrorAlert(errorMessage: string) {

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
