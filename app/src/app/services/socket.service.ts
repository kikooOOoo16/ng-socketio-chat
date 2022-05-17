import {Injectable} from '@angular/core';
import {Room} from "../interfaces/room";
import {Router} from "@angular/router";
import {AuthService} from "./auth.service";
import {Observable} from "rxjs";
import {AlertService} from "./alert.service";
import {CustomSocket} from "./customSocket";
import {SocketMessage} from "../interfaces/socket-message";
import {SocketHelperService} from "./socket-helper.service";
import {SocketEventsTypes} from "./socket-event-types";

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
    console.log('Send createRoom request.');
    this.socket.emit(SocketEventsTypes.CREATE_ROOM, {newRoom}, (callback: { message: string; field?: string }[]) => {
      if (callback && callback.length && callback[0].message && callback[0].message.split(' ')[0] === 'Error:') {
        this.socketHelperService.checkIfUserTokenExpired(callback[0].message);
        this.alertService.onAlertReceived(callback[0].message);
        return;
      }
      // if no error navigate to room component callback is the returned created room name
      this.router.navigate([`/room/${callback}`]);
    });
  }

  // send editRoom socketIO request to server
  editRoom = async (editedRoom: Room) => {
    console.log('Send editRoom request.');
    let err = '';
    await this.socket.emit(SocketEventsTypes.EDIT_ROOM, {room: editedRoom}, (callback: { message: string; field?: string }[]) => {
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
    console.log('Send deleteRoom request.');
    let err = false;
    // send socketIO request
    this.socket.emit(SocketEventsTypes.DELETE_ROOM, {roomId}, (callback: { message: string; field?: string }[]) => {

      const {err: handleErrState} = this.socketHelperService.handleCallbackEmitWhenNotInRoom(callback);
      err = handleErrState;
    });

    if (!err) {
      this.alertService.onAlertReceived('Info: Successfully deleted room.');
    }
  }

  // Send fetchRoom SocketIO request
  fetchRoom = (roomName: string) => {
    console.log('Send fetchRoom request.');
    this.socket.emit(SocketEventsTypes.FETCH_ROOM, {roomName}, (callback: { message: string; field?: string }[]) => {
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
    return this.socket.fromEvent(SocketEventsTypes.FETCH_ROOM,);
  }

  // Send fetchAllRooms SocketIO request
  fetchAllRooms = () => {
    console.log('Send fetchAllRooms request.');
    this.socket.emit(SocketEventsTypes.FETCH_ALL_ROOMS, {}, (callback: { message: string; field?: string }[]) => {
      this.socketHelperService.handleCallbackEmitWhenNotInRoom(callback);
    });
  }

  // Handle fetchAllRooms socketIO call from the server
  onFetchAllRooms = (): Observable<Room[]> => {
    return this.socket.fromEvent(SocketEventsTypes.FETCH_ALL_ROOMS);
  }

  fetchUserRooms = () => {
    this.socket.emit(SocketEventsTypes.FETCH_ALL_USER_ROOMS, {}, (callback: { message: string; field?: string }[]) => {
      this.socketHelperService.handleCallbackEmitWhenNotInRoom(callback);
    });
  }

  // Handle fetchAllUserRooms socketIO call from server
  onFetchAllUserRooms = (): Observable<Room[]> => {
    return this.socket.fromEvent(SocketEventsTypes.FETCH_ALL_USER_ROOMS,);
  }

  onRoomsListUpdate = (): Observable<Room[]> => {
    return this.socket.fromEvent(SocketEventsTypes.ROOMS_LIST_UPDATE);
  }

  // Send socketIO joinRoom request to the server
  joinRoom = (roomName: string) => {
    console.log('Send joinRoom request.');
    // emit the request using the socket instance
    this.socket.emit(SocketEventsTypes.JOIN_ROOM, {roomName}, (callback: { message: string; field?: string }[]) => {
      const {err} = this.socketHelperService.handleCallbackEmitWhenNotInRoom(callback);
      // if no error response navigate to the joined room (callback is roomName if no error)
      if (!err) {
        this.router.navigate([`/room/${callback}`]);
      }
    });
  }

  // Send leave room socketIO request to server
  leaveRoom = (roomName: string) => {
    console.log('Send leaveRoom request.');
    this.socket.emit(SocketEventsTypes.LEAVE_ROOM, {roomName}, (callback: { message: string; field?: string }[]) => {
      this.socketHelperService.handleCallbackEmitWhenInRoom(callback);
      // if no callback error navigate to chat-rooms-list
      this.router.navigate(['chat-rooms-list']);
    });
  }

  // Send kick user from room socketIO request to server
  kickUserFromRoom = (roomName: string, userId: string) => {
    this.socket.emit(SocketEventsTypes.KICK_USER_FROM_ROOM, {roomName, userId}, (callback: { message: string; field?: string }[]) => {
      this.socketHelperService.handleCallbackEmitWhenInRoom(callback);
    })
  }

  // Handle onKickedFromRoom event for user
  onKickedFromRoom = (): Observable<SocketMessage> => {
    return this.socket.fromEvent(SocketEventsTypes.KICKED_FROM_ROOM);
  }

  // Send ban user from room socketIO request to server
  banUserFromRoom = (roomName: string, userId: string) => {
    this.socket.emit(SocketEventsTypes.BAN_USER_FROM_ROOM, {roomName, userId}, (callback: { message: string; field?: string }[]) => {
      this.socketHelperService.handleCallbackEmitWhenInRoom(callback);
    });
  }

  onBannedFromRoom = (): Observable<SocketMessage> => {
    return this.socket.fromEvent(SocketEventsTypes.BANNED_FROM_ROOM);
  }

  // Handle onRoomUsersUpdate SocketIO call from server
  onRoomDataUpdate = (): Observable<Room> => {
    return this.socket.fromEvent(SocketEventsTypes.ROOM_DATA_UPDATE);
  }

  // Send message socketIO request to server
  sendMessage = (roomName: string, message: string) => {
    this.socket.emit(SocketEventsTypes.SEND_MESSAGE, ({roomName, message}), (callback: { message: string; field?: string }[]) => {
      // check if server returned an error
      this.socketHelperService.handleCallbackEmitWhenInRoom(callback);
    });
  }

  // Handle "message" socketIO call form server
  onReceiveMessage = (): Observable<SocketMessage> => {
    return this.socket.fromEvent(SocketEventsTypes.MESSAGE);
  }

  editMessage = (roomName: string, editedMessage: SocketMessage,) => {
    this.socket.emit(SocketEventsTypes.EDIT_MESSAGE, ({roomName, editedMessage}), (callback: { message: string; field?: string }[]) => {
      this.socketHelperService.handleCallbackEmitWhenInRoom(callback);
    });
  }

  // Helper methods for handling "error" socketIO response from server
  onErrorReceived = () => {
    return this.socket.fromEvent(SocketEventsTypes.CONNECT_ERROR);
  }
}
