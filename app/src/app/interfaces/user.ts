export interface User {
  name: string;
  email: string;
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  expirationDate?: Date;
  token?: string;
}
