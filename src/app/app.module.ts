import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HeaderComponent} from './header/header.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {SocketIoConfig, SocketIoModule} from "ngx-socket-io";
import {environment} from "../environments/environment";
import {AuthComponent} from './auth/auth.component';
import {ReactiveFormsModule} from "@angular/forms";
import {ChatRoomsComponent} from './chat-rooms-list/chat-rooms.component';
import {NewChatRoomComponent} from './new-chat-room/new-chat-room.component';
import {ChatRoomComponent} from './chat-room/chat-room.component';
import {AlertComponent} from './shared/alert/alert.component';
import {PlaceholderDirective} from './shared/placeholder/placeholder.directive';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {AuthInterceptor} from "./auth/auth.interceptor";
import { LoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';
import { MyRoomsComponent } from './my-rooms-list/my-rooms.component';
import { ChatRoomOptionsComponent } from './chat-room-options/chat-room-options.component';
import { EditRoomComponent } from './my-rooms-list/edit-room/edit-room.component';
import {CustomSocket} from "./services/customSocket";

// const config: SocketIoConfig = {
//   url: 'DummyURL',
//   options: {
//     transports: ['websocket']
//   }
// }

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    AuthComponent,
    ChatRoomsComponent,
    NewChatRoomComponent,
    ChatRoomComponent,
    AlertComponent,
    PlaceholderDirective,
    LoadingSpinnerComponent,
    MyRoomsComponent,
    ChatRoomOptionsComponent,
    EditRoomComponent,
  ],
  imports: [
    SocketIoModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  providers: [
    CustomSocket,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
