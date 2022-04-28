import {User} from "./user";
import {SocketMessage} from "./socketMessage";

export interface Room {
  author?: string;
  name: string;
  description: string;
  usersInRoom?: User[];
  chatHistory?: SocketMessage[];
}
