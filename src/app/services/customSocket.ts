import {Socket} from 'ngx-socket-io';
import {environment} from 'src/environments/environment';
import {Injectable} from "@angular/core";
import {User} from "../interfaces/user";

@Injectable()
export class CustomSocket extends Socket {
  constructor() {

    super({
      url: environment.serverUrl, options: {
        transports: ['websocket']
      }
    });

    this.setUserToken();
  }

  override connect(): any {

    this.setUserToken();

    return super.connect();
  }

  // SETS socketIO auth header to token
  private setUserToken = () => {
    let userToken;

    const userData: User | null = JSON.parse(localStorage.getItem('userData')!);
    if (userData) {
      userToken = userData.token;
    }
    // if token exists set the ioSocket [auth] header to that token
    if (userToken) {
      this.ioSocket['auth'] = {token: userToken};
    }
  }
}
