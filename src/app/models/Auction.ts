import { Property } from "./Property";

export type AuctionRow = {
  auction_id: number;
  auction_name: string;
  city: string;
  district: string;
  region: string;
  start_time: string | null;
  end_time: string | null;
  start_price: number | null;
  highest_bid: number | null;
  area: number | null;
  property_type: string | null;
  total_sales: number | null;
  duration: string | null;
  products_count: string | null;
  time: string | null;
  property_id: number | null;
  property?: any | null;
};

export class Auction {
  id: string;
  title: string;
  location: string;
  propertyType: string;
  imageUrl: string;

  startTime: string | null;
  endTime: string | null;

  days: string;
  hours: string;
  minutes: string;
  seconds: string;

  startPrice: number;
  durationText: string;
  productsCountText: string;
  displayDate: string;
  displayTime: string;

  propertyId: string | null;
  property: Property | null;

  constructor(data: {
    id: string;
    title: string;
    location: string;
    propertyType?: string;
    imageUrl?: string;
    startTime?: string | null;
    endTime?: string | null;
    days?: string;
    hours?: string;
    minutes?: string;
    seconds?: string;
    startPrice?: number;
    durationText?: string;
    productsCountText?: string;
    displayDate?: string;
    displayTime?: string;
    propertyId?: string | null;
    property?: Property | null;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.location = data.location;
    this.propertyType = data.propertyType ?? "أرض";
    this.imageUrl = data.imageUrl ?? "";

    this.startTime = data.startTime ?? null;
    this.endTime = data.endTime ?? null;

    this.days = data.days ?? "00";
    this.hours = data.hours ?? "00";
    this.minutes = data.minutes ?? "00";
    this.seconds = data.seconds ?? "00";

    this.startPrice = data.startPrice ?? 0;
    this.durationText = data.durationText ?? "غير محدد";
    this.productsCountText = data.productsCountText ?? "0 منتجات";
    this.displayDate = data.displayDate ?? "-";
    this.displayTime = data.displayTime ?? "-";

    this.propertyId = data.propertyId ?? null;
    this.property = data.property ?? null;
  }

  static formatTime(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === "") return "00";
    return String(value).padStart(2, "0");
  }

  static getFallbackImage(propertyType: string) {
    switch (propertyType) {
      case "فيلا":
        return "https://images.unsplash.com/photo-1575356864509-f1727fd74ee4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMGV4dGVyaW9yJTIwc2F1ZGl8ZW58MXx8fHwxNzcxOTcyNjEwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
      case "عمارة":
        return "https://images.unsplash.com/photo-1755567818043-a86c648900de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMGFwYXJ0bWVudCUyMGJ1aWxkaW5nfGVufDF8fHx8MTc3MTkxMDA0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
      case "سوق":
        return "https://images.unsplash.com/photo-1764983265127-8ec30a9c7b64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tZXJjaWFsJTIwcHJvcGVydHklMjBidWlsZGluZ3xlbnwxfHx8fDE3NzE5MTAzMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
      case "شقة":
        return "https://images.unsplash.com/photo-1755567818043-a86c648900de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMGFwYXJ0bWVudCUyMGJ1aWxkaW5nfGVufDF8fHx8MTc3MTkxMDA0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
      case "أرض":
      default:
        return "https://images.unsplash.com/photo-1764222233275-87dc016c11dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kJTIwcGxvdCUyMGRldmVsb3BtZW50fGVufDF8fHx8MTc3MTk3MjYxMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
  }

  static extractDays(duration: string | null): string {
    if (!duration) return "00";
    const match = duration.match(/\d+/);
    return match ? String(match[0]).padStart(2, "0") : "00";
  }

  static extractClock(timeValue: string | null) {
    if (!timeValue) {
      return { hours: "00", minutes: "00", seconds: "00" };
    }

    const parts = timeValue.split(":");

    return {
      hours: Auction.formatTime(parts[0] ?? "00"),
      minutes: Auction.formatTime(parts[1] ?? "00"),
      seconds: Auction.formatTime(parts[2] ?? "00"),
    };
  }

  static formatDisplayDate(dateValue: string | null): string {
    if (!dateValue) return "-";

    const parts = dateValue.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}/${month.padStart(2, "0")}/${day.padStart(2, "0")}`;
    }

    return dateValue;
  }

  static formatDisplayTime(timeValue: string | null): string {
    if (!timeValue) return "-";

    const parts = timeValue.split(":");
    let hour = Number(parts[0] ?? 0);
    const minute = parts[1] ?? "00";

    const period = hour >= 12 ? "م" : "ص";
    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${String(hour).padStart(2, "0")}:${minute} ${period}`;
  }

  static formatProductsCount(value: string | null): string {
    if (!value || value.trim() === "") return "0 منتجات";
    return value.trim();
  }

  static formatDurationText(value: string | null): string {
    if (!value || value.trim() === "") return "غير محدد";
    return value.trim();
  }

  static fromRow(row: AuctionRow): Auction {
    const clock = Auction.extractClock(row.time);
    const propertyType = row.property?.property_type?.trim() ?? row.property_type?.trim() ?? "أرض";

    return new Auction({
      id: String(row.auction_id),
      title: row.auction_name?.trim() ?? "مزاد بدون اسم",
      location: `${row.city?.trim() ?? ""} - ${row.district?.trim() ?? ""}`,
      propertyType,
      imageUrl:
        row.property?.image_url?.trim() ||
        Auction.getFallbackImage(propertyType),

      startTime: row.start_time ?? null,
      endTime: row.end_time ?? null,

      days: Auction.extractDays(row.duration),
      hours: clock.hours,
      minutes: clock.minutes,
      seconds: clock.seconds,

      startPrice: row.start_price ?? 0,
      durationText: Auction.formatDurationText(row.duration),
      productsCountText: Auction.formatProductsCount(row.products_count),
      displayDate: Auction.formatDisplayDate(row.start_time),
      displayTime: Auction.formatDisplayTime(row.time),

      propertyId: row.property_id !== null ? String(row.property_id) : null,
      property: row.property ? new Property(row.property) : null,
    });
  }
}