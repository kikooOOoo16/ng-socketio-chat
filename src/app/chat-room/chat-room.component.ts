import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { faMessage } from '@fortawesome/free-solid-svg-icons';
import {User} from "../interfaces/user";

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit {

  @ViewChild('chatInput') chatInput!: ElementRef;
  faMessage = faMessage;
  usersArray: User[] = [];
  roomName: string = 'Room Name';

  constructor() { }

  ngOnInit(): void {
  }

  sendMessage = () => {
    // check if input has anything
    if (this.chatInput.nativeElement.value !== '') {
      console.log(this.chatInput.nativeElement.value);

      console.log('Component state');
      console.log(`this.roomName = ${this.roomName}`);
      console.log(`this.usersArray = ${this.usersArray}`);
      // reset input
      this.chatInput.nativeElement.value = '';
    }
  }

}
