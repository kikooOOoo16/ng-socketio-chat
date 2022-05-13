import {User} from "./user";
import {SocketMessage} from "./socket-message";

export interface Room {
  _id?: string;
  author?: string;
  createdAt?: string;
  name: string;
  description: string;
  usersInRoom?: User[];
  chatHistory?: SocketMessage[];
}
