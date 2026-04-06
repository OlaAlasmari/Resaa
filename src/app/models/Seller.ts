import { User, UserData } from "./User";

export class Seller extends User {
  companyName: string;

  constructor(data: UserData, companyName = "") {
    super(data);
    this.companyName = companyName;
  }
}