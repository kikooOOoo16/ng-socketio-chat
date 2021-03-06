import {SocketService} from "../services/socket.service";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';

import {faEdit, faMessage, faPencilSquare} from '@fortawesome/free-solid-svg-icons';

import {Room} from "../interfaces/room";
import {SocketMessage} from "../interfaces/socket-message";
import {AuthService} from "../services/auth.service";
import {PlaceholderDirective} from "../shared/placeholder/placeholder.directive";
import {EditChatMessageComponent} from "./edit-chat-message/edit-chat-message.component";
import {ShowAdminOptionsComponent} from "./show-admin-options/show-admin-options.component";
import {User} from "../interfaces/user";
import {AlertService} from "../services/alert.service";

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit, OnDestroy {
  // helper directive to get host view container ref
  @ViewChild(PlaceholderDirective) modalComponentsHost!: PlaceholderDirective;
  private editMessageSub!: Subscription;
  private showAdminOptionsSub!: Subscription;

  private subscriptions: Subscription[] = [];

  @ViewChild('chatInput') chatInput!: ElementRef;
  @ViewChild('chatHistory') chatHistory!: ElementRef;
  faMessage = faMessage;
  faPencilSquare = faPencilSquare;
  faEdit = faEdit;
  // set initial empty room to avoid template errors
  room: Room = {
    author: '',
    name: '',
    description: '',
  };
  // chat room messages
  chatMessages: SocketMessage[] = [];
  userId!: string;
  // last message sent timestamp
  lastMessageSent: string = '';
  //helper var for storing interval number
  private setIntervalId!: number;
  // helper var for keeping track of user kicked from room status
  removedFromRoom = false;

  constructor(
    private authService: AuthService,
    private socketService: SocketService,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService) {
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

    // listen for socketIO fetchRoom event
    const onFetchRoomSub = this.socketService.onFetchRoom()
      .subscribe((roomData: Room) => {
        this.room = roomData;
        if (roomData.chatHistory) {
          this.chatMessages = [...this.chatMessages, ...roomData.chatHistory];
        }
        // scroll to bottom after loading chat history
        setTimeout(() => this.scrollToBottom(), 1);
      });

    // listen for socketIO message event
    const onMessageSub = this.socketService.onReceiveMessage()
      .subscribe((message: any) => {
        this.chatMessages = [...this.chatMessages, message];
        // scroll to bottom after loading chat history
        setTimeout(() => this.scrollToBottom(), 1);
        // update timeFromLastMessage
        this.calculateTimeFromLastMessage();
      });

    // listen for socketIO roomUsersUpdate event
    const onRoomDataUpdateSub = this.socketService.onRoomDataUpdate()
      .subscribe((roomData: any) => {
        this.room = {...roomData};
        this.chatMessages = roomData.chatHistory;
      });

    // listen for socketIO kickedFromRoom event
    const kickedFromRoomSub = this.socketService.onKickedFromRoom()
      .subscribe((kickedFromRoomMsg: SocketMessage) => {
        if (kickedFromRoomMsg) {
          this.alertService.onAlertReceived(`${kickedFromRoomMsg.author.name} : ${kickedFromRoomMsg.text}`);
          this.removedFromRoom = true;
          this.router.navigate(['/chat-rooms-list']);
        }
      });

    // listen for socketIO bannedFromRoom event
    const bannedFromRoomSub = this.socketService.onBannedFromRoom()
      .subscribe((bannedFromRoomMsg: SocketMessage) => {
        if (bannedFromRoomMsg) {
          this.alertService.onAlertReceived(`${bannedFromRoomMsg.author.name} : ${bannedFromRoomMsg.text}`);
          this.removedFromRoom = true;
          this.router.navigate(['/chat-rooms-list']);
        }
      });

    // calculate last message sent time avery 5 minutes
    this.setIntervalId = setInterval(() => {
      this.calculateTimeFromLastMessage();
      return;
    }, 30000);

    // keep sub references in order to unsubscribe later
    this.subscriptions.push(userSub, onFetchRoomSub, onMessageSub, onRoomDataUpdateSub, kickedFromRoomSub, bannedFromRoomSub);
  }

  ngOnDestroy(): void {
    // unsubscribe to prevent memory leeks
    this.subscriptions.forEach(subscription => subscription.unsubscribe());

    // if the user wasn't kicked from the room try to leave gracefully
    if (!this.removedFromRoom) {
      // trigger user leave room
      this.socketService.leaveRoom(this.room.name);
    }

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
    }
  }

  calculateTimeFromLastMessage = () => {
    if (this.chatMessages.length && this.chatMessages.length > 0) {
      // get last chat message timestamp and send it to method
      const messageUnixTime = this.chatMessages[this.chatMessages.length - 1].createdAtUnixTime;

      const currentTime = Date.now();
      const totalSeconds = (currentTime - messageUnixTime) / 1000;

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor((totalSeconds % 3600) % 60);

      this.lastMessageSent = (`${hours !== 0 ? hours + 'h ' : ''}${(hours !== 0 || hours === 0 && minutes !== 0) ? minutes + 'm ' : ''}${seconds !== 0 ? seconds + 's ' : ''}`);
    }
  }

  scrollToBottom(): void {
    this.chatHistory.nativeElement.scroll({
      top: this.chatHistory.nativeElement.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }

  editChatMessage = (message: SocketMessage) => {

    if (this.modalComponentsHost) {
      //get hostViewContainer ref by using alertHost directive
      const hostViewContainer = this.modalComponentsHost.viewContainerRef;
      hostViewContainer.clear();

      // create the AlertComponent on the hostViewContainer
      const componentRef = hostViewContainer.createComponent(EditChatMessageComponent);

      // send @Input message and @Input roomName to the AlertComponent in order send editMessage socketIO event
      componentRef.instance.message = message;
      componentRef.instance.roomName = this.room.name;
      // close EditChatMessage modal component
      this.editMessageSub = componentRef.instance.close.subscribe(() => {
        hostViewContainer.clear();
        this.editMessageSub.unsubscribe();
      });
    }
  }

  showAdminOptions = (user: User) => {
    if (this.modalComponentsHost && this.room.author === this.userId && user._id !== this.userId) {
      //get hostViewContainer ref by using alertHost directive
      const hostViewContainer = this.modalComponentsHost.viewContainerRef;
      hostViewContainer.clear();

      // create the AdminOptionsComponent on the hostViewContainer
      const componentRef = hostViewContainer.createComponent(ShowAdminOptionsComponent);

      // send @Input message and @Input roomName to the AlertComponent in order send editMessage socketIO event
      componentRef.instance.userId = user._id;
      componentRef.instance.userName = user.name;
      componentRef.instance.roomName = this.room.name;

      // close AdminOptions modal component
      this.showAdminOptionsSub = componentRef.instance.close.subscribe(() => {
        hostViewContainer.clear();
        this.showAdminOptionsSub.unsubscribe();
      });
    }
  }
}
