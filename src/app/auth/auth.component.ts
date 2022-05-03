import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../services/auth.service";
import {Observable, Subscription} from "rxjs";
import {AuthResponse} from "../interfaces/auth-response";
import {Router} from "@angular/router";
import {Socket} from "ngx-socket-io";
import {AlertService} from "../services/alert.service";

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

  private closeSub!: Subscription;

  constructor(private authService: AuthService, private router: Router, private socket: Socket, private alertService: AlertService) {
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
      // establish socketIO connection
      this.socket.connect();
      this.router.navigate(['/chat-rooms-list']);
    }, errorMessage => {
      this.alertService.onAlertReceived(errorMessage);
      // this.showErrorAlert(errorMessage);
      this.isLoading = false;
    })
  }

  // store auth state switch value
  onSwitchMode() {
    this.isSignInMode = !this.isSignInMode;
  }
}
