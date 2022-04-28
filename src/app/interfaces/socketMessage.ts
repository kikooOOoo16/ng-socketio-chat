export interface SocketMessage {
  author: {
    id: string,
    name: string
  };
  _id: string;
  text: string;
  createdAtUnixTime: number;
  edited?: boolean;
}
