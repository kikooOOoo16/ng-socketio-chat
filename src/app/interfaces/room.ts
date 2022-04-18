import {User} from "./user";

export interface Room {
  users?: User[];
  name: string;
  description: string;
}
