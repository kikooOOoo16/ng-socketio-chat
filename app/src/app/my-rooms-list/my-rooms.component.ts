import {Component, OnDestroy, OnInit} from '@angular/core';
import {Room} from "../interfaces/room";
import {SocketService} from "../services/socket.service";
import {Subscription} from "rxjs";
import {Subject} from "rxjs";

@Component({
  selector: 'app-my-rooms',
  templateUrl: './my-rooms.component.html',
  styleUrls: ['./my-rooms.component.css']
})
export class MyRoomsComponent implements OnInit, OnDestroy {
  // temp objects
  roomsList!: Room[];
  selectedRoomSubj: Subject<Room> = new Subject<Room>();
  selectedRoom!: Room;

  private fetchUserRoomsSub!: Subscription;


  constructor(private socketService: SocketService) {
  }

  ngOnInit(): void {
    // send fetchUserRooms socketIO request
    this.socketService.fetchUserRooms();

    this.fetchUserRoomsSub = this.socketService.onFetchAllUserRooms()
      .subscribe((userRooms: Room[]) => {
        this.roomsList = userRooms;
      });
  }

  ngOnDestroy(): void {
    if (this.fetchUserRoomsSub) {
      this.fetchUserRoomsSub.unsubscribe();
    }
  }

  onEditRoom(roomId: string) {
    // fetch roomObj by id
    this.selectedRoom = this.roomsList.filter(room => room._id === roomId)[0];
    // send selectedRoom in subj next
    this.selectedRoomSubj.next(this.selectedRoom);
  }
}
