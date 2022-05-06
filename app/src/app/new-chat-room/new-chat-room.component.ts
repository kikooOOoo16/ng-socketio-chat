import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Room} from "../interfaces/room";
import {SocketService} from "../services/socket.service";

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
      roomDescription: new FormControl('', [Validators.required, Validators.minLength(10)])
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
    const newRoom: Room = {
      name: roomName,
      description: roomDescription
    };

    // call createRoom method which sends createRoom socketIO req while passing in the newRoom obj.
    this.socketService.createRoom(newRoom);

    // Reset form
    this.newRoomForm.reset();
  }
}
