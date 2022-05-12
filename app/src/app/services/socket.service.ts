import {Injectable} from '@angular/core';
import {Room} from "../interfaces/room";
import {Router} from "@angular/router";
import {AuthService} from "./auth.service";
import {Observable} from "rxjs";
import {AlertService} from "./alert.service";
import {CustomSocket} from "./customSocket";
import {SocketMessage} from "../interfaces/socketMessage";

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(private socket: CustomSocket, private router: Router, private authService: AuthService, private alertService: AlertService) {
  }

  // Send createRoom SocketIO request
  createRoom = (newRoom: Room) => {
    this.socket.emit('createRoom', {newRoom}, (callback: any) => {
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
    this.socket.emit('fetchRoom', {roomName}, (callback: any) => {
      if (callback.split(' ')[0] === 'Error:') {
        this.checkIfUserTokenExpired(callback);
        this.router.navigate(['/chat-rooms-list']);
        this.alertService.onAlertReceived(callback);
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
    this.socket.emit('fetchAllRooms', {}, (callback: any) => {
      if (callback.split(' ')[0] === 'Error:') {
        this.checkIfUserTokenExpired(callback);
        this.alertService.onAlertReceived(callback);
        return;
      }
    });
  }

  // Handle fetchAllRooms socketIO call from the server
  onFetchAllRooms = (): Observable<Room[]> => {
    return this.socket.fromEvent('fetchAllRooms');
  }

  fetchUserRooms = () => {
    this.socket.emit('fetchUserRooms', {}, (callback: any) => {
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

  onRoomsListUpdate = (): Observable<Room[]> => {
    return this.socket.fromEvent('roomsListUpdate');
  }

  // Send socketIO joinRoom request to the server
  joinRoom = (roomName: string) => {
    // emit the request using the socket instance
    this.socket.emit('joinRoom', {roomName}, (callback: any) => {

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
    this.socket.emit('leaveRoom', {roomName}, (callback: any) => {
      if (typeof callback === "string" && callback.split(' ')[0] === 'Error:') {
        this.checkIfUserTokenExpired(callback);
        this.alertService.onAlertReceived(callback);
        return;
      }
      // if no callback error navigate to chat-rooms-list
      this.router.navigate(['chat-rooms-list']);
    });
  }

  // Send kick user from room socketIO request to server
  kickUserFromRoom = (roomName: string, userId: string) => {
    this.socket.emit('kickUserFromRoom', {roomName, userId}, (callback: any) => {
      if (typeof callback === "string" && callback.split(' ')[0] === 'Error:') {
        this.checkIfUserTokenExpired(callback);
        this.alertService.onAlertReceived(callback);
        return;
      }
    })
  }

  // Handle onKickedFromRoom event for user
  onKickedFromRoom = (): Observable<SocketMessage> => {
    return this.socket.fromEvent('kickedFromRoom');
  }

  // Send ban user from room socketIO request to server
  banUserFromRoom = (roomName: string, userId: string) => {
    this.socket.emit('banUserFromRoom', {roomName, userId}, (callback: any) => {
      if (typeof callback === "string" && callback.split(' ')[0] === 'Error:') {
        this.checkIfUserTokenExpired(callback);
        this.alertService.onAlertReceived(callback);
        return;
      }
    });
  }

  // Handle onRoomUsersUpdate SocketIO call from server
  onRoomDataUpdate = (): Observable<Room> => {
    return this.socket.fromEvent('roomDataUpdate');
  }

  // send editRoom socketIO request to server
  editRoom = async (editedRoom: Room) => {
    console.log(`EditedRoom id = ${editedRoom._id}`);
    let err = '';
    await this.socket.emit('editRoom', {room: editedRoom}, (callback: any) => {

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
    // send socketIO request
    this.socket.emit('deleteRoom', {roomId}, (callback: any) => {
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
    this.socket.emit('sendMessage', ({roomName, message}), (callback: any) => {
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
  onReceiveMessage = (): Observable<SocketMessage> => {
    return this.socket.fromEvent('message');
  }

  editMessage = (roomName: string, editedMessage: SocketMessage,) => {
    this.socket.emit('editMessage', ({roomName, editedMessage}), (callback: any) => {
      // check if server returned an error
      if (callback.split(' ')[0] === 'Error:') {
        this.checkIfUserTokenExpired(callback);
        this.checkIfUserNotInRoom(callback);
        this.alertService.onAlertReceived(callback);
        return;
      }
    });
  }

  // Helper methods for handling "error" socketIO response from server
  onErrorReceived = () => {
    return this.socket.fromEvent('connect_error');
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
