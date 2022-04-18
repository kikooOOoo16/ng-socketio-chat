import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthComponent} from "./auth/auth.component";
import {ChatRoomsComponent} from "./chat-rooms-list/chat-rooms.component";
import {NewChatRoomComponent} from "./new-chat-room/new-chat-room.component";
import {ChatRoomComponent} from "./chat-room/chat-room.component";

const routes: Routes = [
  {
    path: 'auth',
    component: AuthComponent
  },
  {
    path: 'chat-rooms-list',
    component: ChatRoomsComponent
  },
  {
    path: 'new-room',
    component: NewChatRoomComponent
  },
  {
    path: 'room/:room-name',
    component: ChatRoomComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
