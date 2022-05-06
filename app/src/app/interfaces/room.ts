import {User} from "./user";
import {SocketMessage} from "./socketMessage";

export interface Room {
  _id?: string;
  author?: string;
  createdAt?: string;
  name: string;
  description: string;
  usersInRoom?: User[];
  chatHistory?: SocketMessage[];
}
