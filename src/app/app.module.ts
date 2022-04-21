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

const config: SocketIoConfig = {
  url: environment.serverUrl,
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
    AlertComponent,
    PlaceholderDirective,
    LoadingSpinnerComponent,
  ],
  imports: [
    SocketIoModule.forRoot(config),
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
