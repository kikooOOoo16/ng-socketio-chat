import { Injectable } from '@angular/core';
import {Socket} from "ngx-socket-io";
import {Room} from "./interfaces/room";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(private socket: Socket, private router: Router) {}

  // Send createRoom SocketIO request
  createRoom = (newRoom: Room) => {
    this.socket.emit('createRoom', newRoom, (callback: any) => {
      if (callback.split(' ')[0] === 'Error:') {
        return alert(callback);
      }
      // if no error navigate to room component callback is the returned created room name
      this.router.navigate([`/room/${callback}`]);
    });
  }

  fetchRoom = (roomName: string) => {
    this.socket.emit('fetchRoom', roomName, (callback: any) => {
      if (callback.split(' ')[0] === 'Error:') {
        this.router.navigate(['/chat-rooms-list']);
        return alert(callback);
      }
    });
  }

  onFetchRoom = () => {
    return this.socket.fromEvent('fetchRoom');
  }

  fetchAllRooms = () => {
    this.socket.emit('fetchAllRooms');
  }

  onFetchAllRooms = () => {
    return this.socket.fromEvent('fetchAllRooms');
  }

  onReceiveMessage = () => {
    return this.socket.fromEvent('message');
  }
}
