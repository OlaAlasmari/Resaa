export type ViewState =
  | "login"
  | "register"
  | "home"
  | "auction-browse"
  | "auction-detail"
  | "live-bidding"
  | "my-auctions"
  | "add-auction"
  | "favorites"
  | "profile"
  | "bid-history"
  | "support"
  | "wallet"
  | "notifications"
  | "reset-password"
  | "faq";

export type ParticipationRole = "principal" | "agent" | null;
export type SellerRole = "principal" | "agent" | "marketer";