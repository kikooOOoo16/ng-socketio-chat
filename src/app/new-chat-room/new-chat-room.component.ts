import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Room} from "../interfaces/room";

@Component({
  selector: 'app-new-chat-room',
  templateUrl: './new-chat-room.component.html',
  styleUrls: ['./new-chat-room.component.css']
})
export class NewChatRoomComponent implements OnInit {
  newRoomForm!: FormGroup;

  constructor() { }

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

    //  create new room instance from field values
    const newRoom: Room = {name: roomName, description: roomDescription};

    // call chatService while passing in the current username and newRoom Object
    // this.chatService.joinRoom('Kristijan', newRoom, 'kristijan@mail.com');

    // Reset form
    this.newRoomForm.reset();
  }

}
