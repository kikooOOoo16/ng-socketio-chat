import {Injectable} from '@angular/core';
import {Socket} from "ngx-socket-io";
import {Room} from "../interfaces/room";
import {Router} from "@angular/router";
import {Subscription} from "rxjs";
import {User} from "../interfaces/user";

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private userSub!: Subscription;

  constructor(private socket: Socket, private router: Router) {
  }

  // Send createRoom SocketIO request
  createRoom = (newRoom: Room) => {
    // get userId
    const userToken = this.getUserToken();
    // unsubscribe from the userSubject
    this.unsubUserSub();
    // check if userId exists
    if (!userToken) {
      return alert(`There was a problem reading the current user's id.`);
    }
    this.socket.emit('createRoom', {token: userToken, newRoom}, (callback: any) => {
      if (callback.split(' ')[0] === 'Error:') {
        return alert(callback);
      }
      // if no error navigate to room component callback is the returned created room name
      this.router.navigate([`/room/${callback}`]);
    });
  }

  // Send fetchRoom SocketIO request
  fetchRoom = (roomName: string) => {
    // get userId
    const userToken = this.getUserToken();
    // unsubscribe from the userSubject
    this.unsubUserSub();
    // check if userId exists
    if (!userToken) {
      return alert(`There was a problem reading the current user's id.`);
    }
    this.socket.emit('fetchRoom', {token: userToken, roomName}, (callback: any) => {
      if (callback.split(' ')[0] === 'Error:') {
        this.router.navigate(['/chat-rooms-list']);
        return alert(callback);
      }
    });
  }

  // Handle onFetchRoom socketIO call from server
  onFetchRoom = () => {
    return this.socket.fromEvent('fetchRoom');
  }

  // Send fetchAllRooms SocketIO request
  fetchAllRooms = () => {
    // get userId
    const userToken = this.getUserToken();
    // unsubscribe from the userSubject
    this.unsubUserSub();
    // check if userId exists
    if (!userToken) {
      return alert(`There was a problem reading the current user's id.`);
    }

    this.socket.emit('fetchAllRooms', {token: userToken}, (callback: any) => {
      if (callback.split(' ')[0] === 'Error:') {
        return alert(callback);
      }
    });
  }

  // Handle fetchAllRooms socketIO call from the server
  onFetchAllRooms = () => {
    return this.socket.fromEvent('fetchAllRooms');
  }

  // Send socketIO joinRoom request to the server
  joinRoom = (roomName: string) => {
    // get userId
    const userToken = this.getUserToken();
    // unsubscribe from the userSubject
    this.unsubUserSub();

    // emit the request using the socket instance
    this.socket.emit('joinRoom', {token: userToken, roomName}, (callback: any) => {

      if (callback.split(' ')[0] === 'Error:') {
        return alert(callback);
      }
      // if no error response navigate to the joined room (callback is roomName if no error)
      this.router.navigate([`/room/${callback}`]);
    });
  }

  // Send leave room socketIO request to server
  leaveRoom = (roomName: string) => {
    // get userId
    const userToken = this.getUserToken();
    // unsubscribe from the userSubject
    this.unsubUserSub();

    this.socket.emit('leaveRoom', {token: userToken, roomName}, (callback: any) => {
      if (callback.split(' ')[0] === 'Error:') {
        return alert(callback);
      }
      // if no callback error navigate to chat-rooms-list
      this.router.navigate(['chat-rooms-list']);
    });
  }

  // Send message socketIO request to server
  sendMessage = (roomName: string, message: string) => {
    // get userId
    const userToken = this.getUserToken();
    // unsubscribe from the userSubject
    this.unsubUserSub();

    this.socket.emit('sendMessage', ({token: userToken, roomName, message}), (callback: any) => {
    });
  }

  // Handle "message" socketIO call form server
  onReceiveMessage = () => {
    return this.socket.fromEvent('message');
  }

  // get user token helper method
  getUserToken = (): string | undefined => {
    const userData: User | null = JSON.parse(localStorage.getItem('userData')!);
    if (userData) {
      return userData.token;
    } else {
      return undefined;
    }
  }

// unsub from Subscription used when getting the user token
  unsubUserSub = () => {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
