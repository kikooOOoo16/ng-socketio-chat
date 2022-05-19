import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {Room} from "../interfaces/room";
import {SocketService} from "../services/socket.service";
import {Router} from "@angular/router";


@Component({
  selector: 'app-chat-rooms',
  templateUrl: './chat-rooms.component.html',
  styleUrls: ['./chat-rooms.component.css']
})
export class ChatRoomsComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];
  rooms: Room[] = [];

  constructor(private socketService: SocketService, private router: Router) {
  }

  ngOnInit(): void {
    // send fetchAllRooms socketIO request
    this.socketService.fetchAllRooms();

    // listen for onFetchAllRooms socketIO response
    const onFetchAllRoomsSub = this.socketService.onFetchAllRooms()
      .subscribe((allRooms: any) => {
        this.rooms = allRooms;
      });

    // listen for onRoomsListUpdate socketIO emit
    const onRoomsListUpdate = this.socketService.onRoomsListUpdate()
      .subscribe((allRooms: any) => {
        this.rooms = allRooms;
      });

    // keep sub references in order to unsubscribe later
    this.subscriptions.push(onFetchAllRoomsSub, onRoomsListUpdate);
  }

  ngOnDestroy(): void {
    // unsubscribe to prevent memory leeks
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  joinRoom(roomName: string) {

    // call joinRoom from socketService
    this.socketService.joinRoom(roomName);
  }
}
