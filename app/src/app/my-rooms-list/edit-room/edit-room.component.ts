import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Room} from "../../interfaces/room";
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Subject} from "rxjs";
import {SocketService} from "../../services/socket.service";

@Component({
  selector: 'app-edit-room',
  templateUrl: './edit-room.component.html',
  styleUrls: ['./edit-room.component.css']
})
export class EditRoomComponent implements OnInit {
  @Input('selectedRoomSubj') selectedRoomSubj!: Subject<Room> ;
  @ViewChild('shoppingListForm', {static: true}) editRoomForm!: FormGroup;

  editedRoom!: Room;
  disabledClass = 'disabled';

  constructor(private socketService: SocketService) {
  }

  ngOnInit(): void {
    // initialize new form
    this.editRoomForm = new FormGroup({
      roomName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      roomDescription: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
    this.selectedRoomSubj.subscribe((room: Room) => {
      // save sentRoom data
      this.editedRoom = room;
      // set editForm values
      this.editRoomForm.setValue({
        roomName: room.name,
        roomDescription: room.description
      });
    });
  }

  resetForm = () => {
    this.editRoomForm.reset();
  }

  deleteRoom = () => {
    this.socketService.deleteRoom(this.editedRoom._id!);
    this.resetForm();
  }

  editRoomFormSubmit = async() => {
    // check if form is valid
    if (this.editRoomForm.invalid) {
      return alert('Invalid form data.');
    }

    // get field values
    const roomName: string = this.editRoomForm.get('roomName')!.value;
    const roomDescription: string = this.editRoomForm.get('roomDescription')!.value;

    // check if valid data was passed
    if (roomName === '' || roomDescription === '' || roomName.length < 3 || roomDescription.length < 10) {
      return alert('Invalid form data.');
    }

    // set new values
    this.editedRoom = {
      _id: this.editedRoom._id,
      name: roomName,
      description: roomDescription
    }

    // send edit room socketIO request
    const {err} = await this.socketService.editRoom(this.editedRoom);

    // clear form
    if (err === '') {
      this.editRoomForm.reset();
    }
  }
}
