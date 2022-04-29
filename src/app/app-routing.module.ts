import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthComponent} from "./auth/auth.component";
import {ChatRoomsComponent} from "./chat-rooms-list/chat-rooms.component";
import {NewChatRoomComponent} from "./new-chat-room/new-chat-room.component";
import {ChatRoomComponent} from "./chat-room/chat-room.component";
import {AuthGuard} from "./auth/auth.guard";
import {MyRoomsComponent} from "./my-rooms-list/my-rooms.component";

const routes: Routes = [
  {
    path: '',
    redirectTo: '/chat-rooms-list',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    component: AuthComponent
  },
  {
    path: 'chat-rooms-list',
    component: ChatRoomsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'my-rooms-list',
    component: MyRoomsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'new-room',
    component: NewChatRoomComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'room/:room-name',
    component: ChatRoomComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
