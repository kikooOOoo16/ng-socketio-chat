import {Injectable} from '@angular/core';
import {Socket} from "ngx-socket-io";
import {Room} from "../interfaces/room";
import {Router} from "@angular/router";
import {User} from "../interfaces/user";
import {AuthService} from "./auth.service";
import {Observable} from "rxjs";
import {AlertService} from "./alert.service";

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(private socket: Socket, private router: Router, private authService: AuthService, private alertService: AlertService) {
  }

  // Send createRoom SocketIO request
  createRoom = (newRoom: Room) => {
    // get userId
    const userToken = this.getUserToken();

    // check if userId exists
    if (!userToken) {
      this.alertService.onAlertReceived('Error: There was a problem reading the current user\'s id.');
      return;
      // return alert(`There was a problem reading the current user's id.`);
    }
    this.socket.emit('createRoom', {token: userToken, newRoom}, (callback: any) => {
      if (callback.split(' ')[0] === 'Error:') {
        this.checkIfUserTokenExpired(callback);
        this.alertService.onAlertReceived(callback);
        return;
      }
      // if no error navigate to room component callback is the returned created room name
      this.router.navigate([`/room/${callback}`]);
    });
  }

  // Send fetchRoom SocketIO request
  fetchRoom = (roomName: string) => {
    // get userId
    const userToken = this.getUserToken();

    // check if userId exists
    if (!userToken) {
      this.alertService.onAlertReceived('Error: There was a problem reading the current user\'s id.');
      return;
    }
    this.socket.emit('fetchRoom', {token: userToken, roomName}, (callback: any) => {
      if (callback.split(' ')[0] === 'Error:') {
        this.checkIfUserTokenExpired(callback);
        this.router.navigate(['/chat-rooms-list']);
        this.alertService.onAlertReceived(callback);
        return;
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

    // check if userId exists
    if (!userToken) {
      this.alertService.onAlertReceived('Error: There was a problem reading the current user\'s id.');
      return;
    }

    this.socket.emit('fetchAllRooms', {token: userToken}, (callback: any) => {
      if (callback.split(' ')[0] === 'Error:') {
        this.checkIfUserTokenExpired(callback);
        this.alertService.onAlertReceived(callback);
        return;
      }
    });
  }

  // Handle fetchAllRooms socketIO call from the server
  onFetchAllRooms = () => {
    return this.socket.fromEvent('fetchAllRooms');
  }

  fetchUserRooms = () => {
    // get userId
    const userToken = this.getUserToken();
    // check if userToken retrieved successfully
    if (!userToken) {
      this.alertService.onAlertReceived('There was a problem reading the current user\'s id.');
      return;
    }

    this.socket.emit('fetchUserRooms', {token: userToken}, (callback: any) => {
      if (callback.split(' ')[0] === 'Error:') {
        this.checkIfUserTokenExpired(callback);
        this.alertService.onAlertReceived(callback);
        return;
      }
    });
  }

  // Handle fetchAllUserRooms socketIO call from server
  onFetchAllUserRooms = (): Observable<Room[]> => {
    return this.socket.fromEvent('fetchUserRooms');
  }

  onRoomsListUpdate = () => {
    return this.socket.fromEvent('roomsListUpdate');
  }

  // Send socketIO joinRoom request to the server
  joinRoom = (roomName: string) => {
    // get userId
    const userToken = this.getUserToken();

    // emit the request using the socket instance
    this.socket.emit('joinRoom', {token: userToken, roomName}, (callback: any) => {

      if (callback.split(' ')[0] === 'Error:') {
        this.checkIfUserTokenExpired(callback);
        this.alertService.onAlertReceived(callback);
        return;
      }
      // if no error response navigate to the joined room (callback is roomName if no error)
      this.router.navigate([`/room/${callback}`]);
    });
  }

  // Send leave room socketIO request to server
  leaveRoom = (roomName: string) => {
    // get userId
    const userToken = this.getUserToken();

    this.socket.emit('leaveRoom', {token: userToken, roomName}, (callback: any) => {
      if (typeof callback === "string" && callback.split(' ')[0] === 'Error:') {
        this.checkIfUserTokenExpired(callback);
        this.alertService.onAlertReceived(callback);
        return;
      }
      // if no callback error navigate to chat-rooms-list
      this.router.navigate(['chat-rooms-list']);
    });
  }

  // Handle onRoomUsersUpdate SocketIO call from server
  onRoomUsersUpdate = () => {
    return this.socket.fromEvent('roomUsersUpdate')
  }

  // send editRoom socketIO request to server
  editRoom = async (editedRoom: Room) => {
    let err = '';
    const userToken = this.getUserToken();

    await this.socket.emit('editRoom', {token: userToken, room: editedRoom}, (callback: any) => {

      if (typeof callback === "string" && callback.split(' ')[0] === 'Error:') {
        this.checkIfUserTokenExpired(callback);
        err = callback;
        this.alertService.onAlertReceived(callback);
      }
    });
    if (err === '') {
      this.alertService.onAlertReceived('Info: Successfully edited room.');
    }
    return {err};
  }

  // send deleteRoom socketIO request to server
  deleteRoom = (roomId: string) => {
    // get user token
    const userToken = this.getUserToken();

    // send socketIO request
    this.socket.emit('deleteRoom', {token: userToken, roomId}, (callback: any) => {
      if (typeof callback === "string" && callback.split(' ')[0] === 'Error:') {
        this.checkIfUserTokenExpired(callback);
        this.alertService.onAlertReceived(callback);
        return;
      }
    });

    this.alertService.onAlertReceived('Info: Successfully deleted room.');
  }

  // Send message socketIO request to server
  sendMessage = (roomName: string, message: string) => {
    // get userId
    const userToken = this.getUserToken();

    this.socket.emit('sendMessage', ({token: userToken, roomName, message}), (callback: any) => {
      // check if server returned an error
      if (callback.split(' ')[0] === 'Error:') {
        this.checkIfUserTokenExpired(callback);
        this.checkIfUserNotInRoom(callback);
        this.alertService.onAlertReceived(callback);
        return;
      }
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

  checkIfUserTokenExpired = (callback: any) => {
    if (callback === 'Error: User token has expired.') {
      // if token expired logout user.
      this.authService.handleUserStateOnLogout();
      return;
    }
  }

  checkIfUserNotInRoom = (callback: any) => {
    if (callback === 'Error: The requested user is not in the current room.') {
      this.router.navigate([`/chat-rooms-list`]);
    }
  }
}
