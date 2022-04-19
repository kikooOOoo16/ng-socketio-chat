import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {SocketIoConfig, SocketIoModule} from "ngx-socket-io";
import {environment} from "../environments/environment";
import { AuthComponent } from './auth/auth.component';
import {ReactiveFormsModule} from "@angular/forms";
import { ChatRoomsComponent } from './chat-rooms-list/chat-rooms.component';
import { NewChatRoomComponent } from './new-chat-room/new-chat-room.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';

const config: SocketIoConfig = {
  url: environment.socketUrl,
  options: {
    transports: ['websocket']
  }
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    AuthComponent,
    ChatRoomsComponent,
    NewChatRoomComponent,
    ChatRoomComponent,
  ],
  imports: [
    SocketIoModule.forRoot(config),
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
