import { Injectable } from '@angular/core';
import {Socket} from "ngx-socket-io";
import {Room} from "./interfaces/room";
import {Router} from "@angular/router";
import {User} from "./interfaces/user";

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(private socket: Socket, private router: Router) {}

  // Send createRoom SocketIO request
  createRoom = ({name, email}: User, newRoom: Room) => {
    this.socket.emit('createRoom', {name, email, newRoom}, (callback: any) => {
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

  joinRoom = ({name, email}: User, roomName: string) => {
    this.socket.emit('joinRoom', {name, email, roomName}, (callback: any) => {

      if (callback.split(' ')[0] === 'Error:') {
        return alert(callback);
      }
      // if no error response navigate to the joined room (callback is roomName if no error)
      this.router.navigate([`/room/${callback}`]);
    });
  }

  leaveRoom = ({name, email}: User, roomName: string) => {
    this.socket.emit('leaveRoom', {name, email, roomName}, (callback: any) => {
      if (callback.split(' ')[0] === 'Error:') {
        return alert(callback);
      }
      // if no callback error navigate to chat-rooms-list
      this.router.navigate(['chat-rooms-list']);
    });
  }

  sendMessage = ({name, email}: User, roomName: string, message: string ) => {
    this.socket.emit('sendMessage', ({name, email, roomName, message}), (callback: any) => {
    });
  }

  onReceiveMessage = () => {
    return this.socket.fromEvent('message');
  }
}
