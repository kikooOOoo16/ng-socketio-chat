import {Component, OnDestroy, OnInit} from '@angular/core';
import { Subscription } from 'rxjs';
import {Room} from "../interfaces/room";
import {SocketService} from "../socket.service";


@Component({
  selector: 'app-chat-rooms',
  templateUrl: './chat-rooms.component.html',
  styleUrls: ['./chat-rooms.component.css']
})
export class ChatRoomsComponent implements OnInit, OnDestroy {

  rooms: Room[] = [];
  onFetchAllRoomsSub: Subscription | undefined;

  constructor(private socketService: SocketService) { }

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
    this.onFetchAllRoomsSub!.unsubscribe();
  }

}
