import {Component, OnDestroy, OnInit} from '@angular/core';
import { Subscription } from 'rxjs';
import {Room} from "../interfaces/room";
import {SocketService} from "../socket.service";
import {Router} from "@angular/router";
import {User} from "../interfaces/user";


@Component({
  selector: 'app-chat-rooms',
  templateUrl: './chat-rooms.component.html',
  styleUrls: ['./chat-rooms.component.css']
})
export class ChatRoomsComponent implements OnInit, OnDestroy {

  rooms: Room[] = [];
  onFetchAllRoomsSub: Subscription | undefined;

  constructor(private socketService: SocketService, private router: Router) { }

  ngOnInit(): void {
    // send fetchAllRooms socketIO request
    this.socketService.fetchAllRooms();

    // listen for onFetchAllRooms socketIO response
    this.onFetchAllRoomsSub = this.socketService.onFetchAllRooms()
      .subscribe((allRooms : any) => {
        this.rooms = allRooms;
      });
  }

  ngOnDestroy(): void {
    if (this.onFetchAllRoomsSub) {
      this.onFetchAllRoomsSub.unsubscribe();
    }
  }

  joinRoom(roomName: string) {
    // temporary user obj
    const currentUser: User = {
      name: 'CurrentUser',
      email: 'CurrentUser@mail.com'
    }
    // call joinRoom from socketService
    this.socketService.joinRoom(currentUser, roomName);
  }
}
