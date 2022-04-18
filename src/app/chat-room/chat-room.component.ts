import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {faMessage} from '@fortawesome/free-solid-svg-icons';
import {SocketService} from "../socket.service";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {Room} from "../interfaces/room";
import { Subscription } from 'rxjs';
import {Message} from "../interfaces/message";

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];

  @ViewChild('chatInput') chatInput!: ElementRef;
  faMessage = faMessage;
  // set initial empty room to avoid template errors
  room: Room = {
    author: '',
    name: '',
    description: '',
  };
  // chat room messages
  messages: Message[] = [];

  constructor(
    private socketService: SocketService,
    private route: ActivatedRoute,
    // private router: Router
  ) { }

  ngOnInit(): void {
    // Don't need to unsubscribe from ActivatedRoute instances because Angular does it for us
    this.route.paramMap.subscribe((params: ParamMap) => {
      const roomName = params.get('room-name')!;
      // send socketIO fetchRoom event
      this.socketService.fetchRoom(roomName);
    });

    // listen for socketIO fetchRoom response
    const onFetchRoomSub = this.socketService.onFetchRoom().subscribe((roomData: any) => {
      this.room = roomData;
    });

    // listen for socketIO message response
    const onMessageSub = this.socketService.onReceiveMessage().subscribe((message: any) => {
      console.log(message);
      this.messages.push(message);
    });

    this.subscriptions.push(onFetchRoomSub, onMessageSub);
  }

  ngOnDestroy(): void {
    // unsubscribe to prevent memory leeks
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  sendMessage = () => {
    // check if input has anything
    if (this.chatInput.nativeElement.value !== '') {
      console.log(this.chatInput.nativeElement.value);
      console.log('Messages state');
      console.log(this.messages);
      // reset input
      this.chatInput.nativeElement.value = '';
    }
  }

}
