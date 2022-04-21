import {Component, OnDestroy, OnInit} from '@angular/core';
import { Subscription } from 'rxjs';
import {Room} from "../interfaces/room";
import {SocketService} from "../services/socket.service";
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
      _id: '6261051f63ce38f3885eb0ac',
      name: 'Kristijan',
      email: 'kristijan@mail.com',
      createdAt: new Date('2022-04-21T07:17:51.288Z'),
      updatedAt: new Date('2022-04-21T07:17:51.360Z')
    }
    // call joinRoom from socketService
    this.socketService.joinRoom(currentUser, roomName);
  }
}
