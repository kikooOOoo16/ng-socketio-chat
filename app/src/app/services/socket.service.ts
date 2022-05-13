import {Injectable} from '@angular/core';
import {Room} from "../interfaces/room";
import {Router} from "@angular/router";
import {AuthService} from "./auth.service";
import {Observable} from "rxjs";
import {AlertService} from "./alert.service";
import {CustomSocket} from "./customSocket";
import {SocketMessage} from "../interfaces/socket-message";
import {SocketHelperService} from "./socket-helper.service";

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(
    private socket: CustomSocket,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService,
    private socketHelperService: SocketHelperService) {
  }

  // Send createRoom SocketIO request
  createRoom = (newRoom: Room) => {
    this.socket.emit('createRoom', {newRoom}, (callback: { message: string; field?: string }[]) => {
      if (callback && callback.length && callback[0].message && callback[0].message.split(' ')[0] === 'Error:') {
        this.socketHelperService.checkIfUserTokenExpired(callback[0].message);
        this.alertService.onAlertReceived(callback[0].message);
        return;
      }
      // if no error navigate to room component callback is the returned created room name
      this.router.navigate([`/room/${callback}`]);
    });
  }

  // Send fetchRoom SocketIO request
  fetchRoom = (roomName: string) => {
    console.log('Send fetchRoom request.');
    this.socket.emit('fetchRoom', {roomName}, (callback: { message: string; field?: string }[]) => {
      if (callback && callback.length && callback[0].message && callback[0].message.split(' ')[0] === 'Error:') {
        this.socketHelperService.checkIfUserTokenExpired(callback[0].message);
        this.router.navigate(['/chat-rooms-list']);
        this.alertService.onAlertReceived(callback[0].message);
        return;
      }
    });
  }

  // Handle onFetchRoom socketIO call from server
  onFetchRoom = (): Observable<Room> => {
    return this.socket.fromEvent('fetchRoom');
  }

  // Send fetchAllRooms SocketIO request
  fetchAllRooms = () => {
    console.log('Send fetchAllRooms request.')
    this.socket.emit('fetchAllRooms', {}, (callback: { message: string; field?: string }[]) => {
      this.socketHelperService.handleCallbackEmitWhenNotInRoom(callback);
    });
  }

  // Handle fetchAllRooms socketIO call from the server
  onFetchAllRooms = (): Observable<Room[]> => {
    return this.socket.fromEvent('fetchAllRooms');
  }

  fetchUserRooms = () => {
    this.socket.emit('fetchUserRooms', {}, (callback: { message: string; field?: string }[]) => {
      this.socketHelperService.handleCallbackEmitWhenNotInRoom(callback);
    });
  }

  // Handle fetchAllUserRooms socketIO call from server
  onFetchAllUserRooms = (): Observable<Room[]> => {
    return this.socket.fromEvent('fetchUserRooms');
  }

  onRoomsListUpdate = (): Observable<Room[]> => {
    return this.socket.fromEvent('roomsListUpdate');
  }

  // Send socketIO joinRoom request to the server
  joinRoom = (roomName: string) => {
    console.log('Send JoinRoom request.');
    // emit the request using the socket instance
    this.socket.emit('joinRoom', {roomName}, (callback: { message: string; field?: string }[]) => {
      const {err} = this.socketHelperService.handleCallbackEmitWhenNotInRoom(callback);
      // if no error response navigate to the joined room (callback is roomName if no error)
      if (!err) {
        this.router.navigate([`/room/${callback}`]);
      }
    });
  }

  // Send leave room socketIO request to server
  leaveRoom = (roomName: string) => {
    console.log('Send leaveRoom request.')
    this.socket.emit('leaveRoom', {roomName}, (callback: { message: string; field?: string }[]) => {
      this.socketHelperService.handleCallbackEmitWhenInRoom(callback);
      // if no callback error navigate to chat-rooms-list
      this.router.navigate(['chat-rooms-list']);
    });
  }

  // Send kick user from room socketIO request to server
  kickUserFromRoom = (roomName: string, userId: string) => {
    this.socket.emit('kickUserFromRoom', {roomName, userId}, (callback: { message: string; field?: string }[]) => {
      this.socketHelperService.handleCallbackEmitWhenInRoom(callback);
    })
  }

  // Handle onKickedFromRoom event for user
  onKickedFromRoom = (): Observable<SocketMessage> => {
    return this.socket.fromEvent('kickedFromRoom');
  }

  // Send ban user from room socketIO request to server
  banUserFromRoom = (roomName: string, userId: string) => {
    this.socket.emit('banUserFromRoom', {roomName, userId}, (callback: { message: string; field?: string }[]) => {
      this.socketHelperService.handleCallbackEmitWhenInRoom(callback);
    });
  }

  onBannedFromRoom = (): Observable<SocketMessage> => {
    return this.socket.fromEvent('bannedFromRoom');
  }

  // Handle onRoomUsersUpdate SocketIO call from server
  onRoomDataUpdate = (): Observable<Room> => {
    return this.socket.fromEvent('roomDataUpdate');
  }

  // send editRoom socketIO request to server
  editRoom = async (editedRoom: Room) => {
    console.log(`EditedRoom id = ${editedRoom._id}`);
    let err = '';
    await this.socket.emit('editRoom', {room: editedRoom}, (callback: { message: string; field?: string }[]) => {
      if (callback && callback.length && callback[0].message && callback[0].message.split(' ')[0] === 'Error:') {

        this.socketHelperService.checkIfUserTokenExpired(callback[0].message);
        err = callback[0].message
        this.alertService.onAlertReceived(callback[0].message);
      }
    });
    if (err === '') {
      this.alertService.onAlertReceived('Info: Successfully edited room.');
    }
    return {err};
  }

  // send deleteRoom socketIO request to server
  deleteRoom = (roomId: string) => {
    // send socketIO request
    this.socket.emit('deleteRoom', {roomId}, (callback: { message: string; field?: string }[]) => {
      const {err} = this.socketHelperService.handleCallbackEmitWhenNotInRoom(callback);

      if (!err) {
        this.alertService.onAlertReceived('Info: Successfully deleted room.');
      }
    });
  }

  // Send message socketIO request to server
  sendMessage = (roomName: string, message: string) => {
    this.socket.emit('sendMessage', ({roomName, message}), (callback: { message: string; field?: string }[]) => {
      // check if server returned an error
      this.socketHelperService.handleCallbackEmitWhenInRoom(callback);
    });
  }

  // Handle "message" socketIO call form server
  onReceiveMessage = (): Observable<SocketMessage> => {
    return this.socket.fromEvent('message');
  }

  editMessage = (roomName: string, editedMessage: SocketMessage,) => {
    this.socket.emit('editMessage', ({roomName, editedMessage}), (callback: { message: string; field?: string }[]) => {
      this.socketHelperService.handleCallbackEmitWhenInRoom(callback);
    });
  }

  // Helper methods for handling "error" socketIO response from server
  onErrorReceived = () => {
    return this.socket.fromEvent('connect_error');
  }
}
