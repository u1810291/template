export class User {
  id: string;
  email: string;
  name: string;
  createDate: Date;
  updatedDate: Date;
  hashRefreshToken: string;
}

export class UserM extends User {
  password: string;
}
