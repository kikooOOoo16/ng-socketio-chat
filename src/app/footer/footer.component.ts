import { Component, OnInit } from '@angular/core';
import {faEnvelope, faPhone} from "@fortawesome/free-solid-svg-icons";
import {Subscription} from "rxjs";
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  faEnvelope = faEnvelope;
  faPhone = faPhone;
  userSub!: Subscription;
  isAuthenticated = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.userSubject.subscribe(user => {
      this.isAuthenticated = !!user;
    })
  }

  onLogout() {
    this.authService.logout();
  }
}
