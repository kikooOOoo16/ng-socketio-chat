import {SocketService} from "../services/socket.service";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';

import {faMessage} from '@fortawesome/free-solid-svg-icons';

import {Room} from "../interfaces/room";
import {SocketMessage} from "../interfaces/socketMessage";
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];

  @ViewChild('chatInput') chatInput!: ElementRef;
  @ViewChild('chatHistory') chatHistory!: ElementRef;
  faMessage = faMessage;
  // set initial empty room to avoid template errors
  room: Room = {
    author: '',
    name: '',
    description: '',
  };
  // chat room messages
  // messages = new BehaviorSubject<SocketMessage[]>([]);
  messages: SocketMessage[] = [];
  userId!: string;
  // last message sent timestamp
  lastMessageSent: string = '';
  private setIntervalId!: number;

  constructor(
    private authService: AuthService,
    private socketService: SocketService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    // Don't need to unsubscribe from ActivatedRoute instances because Angular does it for us
    this.route.paramMap.subscribe((params: ParamMap) => {
      const roomName = params.get('room-name')!;
      // send socketIO fetchRoom event
      this.socketService.fetchRoom(roomName);
    });

    const userSub = this.authService.userSubject.subscribe(userData => {
      this.userId = userData!._id;
    });

    // listen for socketIO fetchRoom response
    const onFetchRoomSub = this.socketService.onFetchRoom().subscribe((roomData: Room) => {
      this.room = roomData;
      if (roomData.chatHistory) {
        this.messages = [...this.messages, ...roomData.chatHistory];
      }
      // scroll to bottom after loading chat history
      setTimeout(() => this.scrollToBottom(), 1);
    });

    // listen for socketIO message response
    const onMessageSub = this.socketService.onReceiveMessage().subscribe((message: any) => {
      this.messages.push(message);
      // move chat-history to bottom, delay by 1ms
      setTimeout(() => this.scrollToBottom(), 1);
    });

    // listen for socketIO roomUsersUpdate request
    const onRoomUsersUpdateSub = this.socketService.onRoomUsersUpdate().subscribe((roomData: any) => {
      this.room = roomData;
    });

    // calculate last message sent time avery 5 minutes
    this.setIntervalId = setInterval(() => {
      this.calculateTimeFromLastMessage();
      return;
    }, 30000);


    // keep sub references in order to unsubscribe later
    this.subscriptions.push(userSub, onFetchRoomSub, onMessageSub, onRoomUsersUpdateSub);
  }

  ngOnDestroy(): void {
    // unsubscribe to prevent memory leeks
    this.subscriptions.forEach(subscription => subscription.unsubscribe());

    // trigger user leave room
    this.socketService.leaveRoom(this.room.name);

    // clear set interval
    if (this.setIntervalId) {
      clearInterval(this.setIntervalId);
    }
  }

  sendMessage = () => {
    // check if input has anything
    if (this.chatInput.nativeElement.value !== '') {
      // call sendMessage on socketService to send socketIO sendMessage req
      this.socketService.sendMessage(this.room.name, this.chatInput.nativeElement.value);
      // reset input
      this.chatInput.nativeElement.value = '';
      // update timeFromLastMessage
      this.calculateTimeFromLastMessage();
    }
  }

  calculateTimeFromLastMessage = () => {
    if (this.room.chatHistory?.length && this.room.chatHistory.length > 0) {
      // get last chat message timestamp and send it to method
      const messageUnixTime = this.room.chatHistory[this.room.chatHistory.length - 1].createdAtUnixTime;

      const currentTime = Date.now();
      const totalSeconds = (currentTime - messageUnixTime) / 1000;

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor((totalSeconds % 3600) % 60);

      this.lastMessageSent = (`${hours !== 0 ? hours + 'h ' : ''}${(hours !== 0 || hours === 0 && minutes !== 0)? minutes + 'm ' : ''}${seconds !== 0 ? seconds + 's ' : ''}`);
    }
  }

  scrollToBottom(): void {
    this.chatHistory.nativeElement.scroll({
      top: this.chatHistory.nativeElement.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }
}
