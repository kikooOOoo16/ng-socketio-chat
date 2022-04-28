import {SocketService} from "../services/socket.service";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';

import {faMessage} from '@fortawesome/free-solid-svg-icons';

import {Room} from "../interfaces/room";
import {SocketMessage} from "../interfaces/socketMessage";

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
  messages: SocketMessage[] = [];

  constructor(
    private socketService: SocketService,
    private route: ActivatedRoute,
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
      this.messages = roomData.chatHistory;
      console.log('Get Chat History triggered.')
      console.log(this.messages);
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
    })

    // keep sub references in order to unsubscribe later
    this.subscriptions.push(onFetchRoomSub, onMessageSub, onRoomUsersUpdateSub);
  }

  ngOnDestroy(): void {
    // unsubscribe to prevent memory leeks
    this.subscriptions.forEach(subscription => subscription.unsubscribe());

    // trigger user leave room
    this.socketService.leaveRoom(this.room.name);
  }

  sendMessage = () => {

    // check if input has anything
    if (this.chatInput.nativeElement.value !== '') {
      // call sendMessage on socketService to send socketIO sendMessage req
      this.socketService.sendMessage(this.room.name, this.chatInput.nativeElement.value);
      // reset input
      this.chatInput.nativeElement.value = '';
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
