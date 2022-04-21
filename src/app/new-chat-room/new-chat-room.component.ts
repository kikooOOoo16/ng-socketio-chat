import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Room} from "../interfaces/room";
import {SocketService} from "../services/socket.service";
import {User} from "../interfaces/user";

@Component({
  selector: 'app-new-chat-room',
  templateUrl: './new-chat-room.component.html',
  styleUrls: ['./new-chat-room.component.css']
})
export class NewChatRoomComponent implements OnInit {
  newRoomForm!: FormGroup;

  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    // initialize new form
    this.newRoomForm = new FormGroup({
      roomName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      roomDescription: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  newRoomFormSubmit = () => {
    // check if form is valid
    if (this.newRoomForm.invalid) {
      return;
    }

    // get field values
    const roomName = this.newRoomForm.get('roomName')!.value;
    const roomDescription = this.newRoomForm.get('roomDescription')!.value;

    // temporary current user obj
    const currentUser: User = {
      _id: '6261051f63ce38f3885eb0ac',
      name: 'Kristijan',
      email: 'kristijan@mail.com',
      createdAt: new Date('2022-04-21T07:17:51.288Z'),
      updatedAt: new Date('2022-04-21T07:17:51.360Z')
    }

    //  create new room instance from field values
    const newRoom: Room = {
      name: roomName,
      description: roomDescription
    };

    // call createRoom method which sends createRoom socketIO req while passing in the newRoom obj.
    this.socketService.createRoom(currentUser, newRoom);

    // Reset form
    this.newRoomForm.reset();
  }
}
