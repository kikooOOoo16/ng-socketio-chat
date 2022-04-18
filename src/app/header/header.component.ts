import {Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild} from '@angular/core';
import {faMessage, faSignInAlt, faSignOutAlt} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  faMessage = faMessage;
  faSignIn = faSignInAlt;
  faSignOut = faSignOutAlt;
  isDropdownActive = '';
  isAuthenticated = false;

  // NavBar functionality
  @ViewChild('navbarDropdownMenuLink', { static: true }) navbarDropdownMenuLink!: ElementRef;
  @ViewChild('navbarMainListDiv', { static: true }) navbarMainListDiv!: ElementRef;
  @ViewChild('navbar', { static: true }) navbar!: ElementRef;

  @HostListener('window:scroll', ['$event'])
  toggleClass(event: any): void {
    if (window.scrollY > 0) {
      this.renderer.addClass(this.navbar.nativeElement, 'affix');
      this.renderer.addClass(this.navbarDropdownMenuLink.nativeElement, 'affix');
    } else {
      this.renderer.removeClass(this.navbar.nativeElement, 'affix');
      this.renderer.removeClass(this.navbarDropdownMenuLink.nativeElement, 'affix');
    }
  }

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
  }

  toggleDropdown(): void {
    if (this.isDropdownActive === 'active') {
      this.renderer.removeClass(this.navbarDropdownMenuLink.nativeElement, 'active');
      this.renderer.removeClass(this.navbarMainListDiv.nativeElement, 'show_list');
      this.isDropdownActive = '';
    } else {
      this.renderer.addClass(this.navbarDropdownMenuLink.nativeElement, 'active');
      this.renderer.addClass(this.navbarMainListDiv.nativeElement, 'show_list');
      this.isDropdownActive = 'active';
    }
  }

  onLogout(): void {
    console.log('Logout functionality.');
  }

}
