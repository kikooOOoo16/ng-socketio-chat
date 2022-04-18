import { Component, OnInit } from '@angular/core';
import {Room} from "../interfaces/room";

@Component({
  selector: 'app-chat-rooms',
  templateUrl: './chat-rooms.component.html',
  styleUrls: ['./chat-rooms.component.css']
})
export class ChatRoomsComponent implements OnInit {

  rooms: Room[] = [
    {name: 'MotoGP', description: 'General MotoGP Talk'},
    {name: 'F1', description: 'General F1 Talk'},
    {name: 'La Liga', description: 'General La Liga Talk'}
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
