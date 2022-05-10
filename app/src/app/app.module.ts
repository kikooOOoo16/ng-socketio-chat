import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HeaderComponent} from './header/header.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {SocketIoModule} from "ngx-socket-io";
import {AuthComponent} from './auth/auth.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ChatRoomsComponent} from './chat-rooms-list/chat-rooms.component';
import {NewChatRoomComponent} from './new-chat-room/new-chat-room.component';
import {ChatRoomComponent} from './chat-room/chat-room.component';
import {AlertComponent} from './shared/alert/alert.component';
import {PlaceholderDirective} from './shared/placeholder/placeholder.directive';
import {HttpClientModule} from "@angular/common/http";
import {LoadingSpinnerComponent} from './shared/loading-spinner/loading-spinner.component';
import {MyRoomsComponent} from './my-rooms-list/my-rooms.component';
import {ChatRoomOptionsComponent} from './chat-room-options/chat-room-options.component';
import {EditRoomComponent} from './my-rooms-list/edit-room/edit-room.component';
import {CustomSocket} from "./services/customSocket";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { FooterComponent } from './footer/footer.component';
import { EditChatMessageComponent } from './chat-room/edit-chat-message/edit-chat-message.component';

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
    FooterComponent,
    EditChatMessageComponent,
  ],
  imports: [
    SocketIoModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    FontAwesomeModule
  ],
  providers: [
    CustomSocket,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
