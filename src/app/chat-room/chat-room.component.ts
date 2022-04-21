import {SocketService} from "../services/socket.service";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Subscription } from 'rxjs';

import {faMessage} from '@fortawesome/free-solid-svg-icons';

import {Room} from "../interfaces/room";
import {SocketMessage} from "../interfaces/socketMessage";
import {User} from "../interfaces/user";

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
    });

    // listen for socketIO message response
    const onMessageSub = this.socketService.onReceiveMessage().subscribe((message: any) => {
      this.messages.push(message);
      // move chat-history to bottom, delay by 1ms
      setTimeout(() => this.scrollToBottom(), 2);
    });

    // keep sub references in order to unsubscribe later
    this.subscriptions.push(onFetchRoomSub, onMessageSub);
  }

  ngOnDestroy(): void {
    // unsubscribe to prevent memory leeks
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    // temporary current user
    const currentUser: User = {
      _id: '6261051f63ce38f3885eb0ac',
      name: 'Kristijan',
      email: 'kristijan@mail.com',
      createdAt: new Date('2022-04-21T07:17:51.288Z'),
      updatedAt: new Date('2022-04-21T07:17:51.360Z')
    }

    // trigger user leave room
    this.socketService.leaveRoom(currentUser, this.room.name);
  }

  sendMessage = () => {
    // temporary current user
    const currentUser: User = {
      _id: '6261051f63ce38f3885eb0ac',
      name: 'Kristijan',
      email: 'kristijan@mail.com',
      createdAt: new Date('2022-04-21T07:17:51.288Z'),
      updatedAt: new Date('2022-04-21T07:17:51.360Z')
    }
    // check if input has anything
    if (this.chatInput.nativeElement.value !== '') {
      // call sendMessage on socketService to send socketIO sendMessage req
      this.socketService.sendMessage(currentUser, this.room.name, this.chatInput.nativeElement.value);
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
