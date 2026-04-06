import { User, UserData } from "./User";

export class Bidder extends User {
  biddingHistory: string[];
  status: string;
  walletAmount: number;

  constructor(data: UserData, biddingHistory: string[] = [], status = "active", walletAmount = 0) {
    super(data);
    this.biddingHistory = biddingHistory;
    this.status = status;
    this.walletAmount = walletAmount;
  }
}