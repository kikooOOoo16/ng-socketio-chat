import {User} from "./user";

export interface Room {
  author: string;
  name: string;
  description: string;
  usersInRoom?: User[];
}
