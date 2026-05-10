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
    this.productsCountText = data.productsCountText ?? "1 أصل";
    this.displayTime = data.displayTime ?? "-";
    this.displayDate = data.displayDate ?? "-"
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

  // ── Auction status helpers ─────────────────────────────────────────────────
  static isEnded(endTime: string | null): boolean {
    const end = Auction.normalizeDateTime(endTime);
    return end ? Date.now() > end.getTime() : false;
  }

  static isUpcoming(startTime: string | null): boolean {
    const start = Auction.normalizeDateTime(startTime);
    return start ? Date.now() < start.getTime() : false;
  }

  static isLive(startTime: string | null, endTime: string | null): boolean {
    return !Auction.isEnded(endTime) && !Auction.isUpcoming(startTime);
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

  // ── Normalize any date string to a parseable format ──────────────────────
  static normalizeDateTime(value: string | null): Date | null {
    if (!value) return null;
    let trimmed = value.trim();

    // Already has timezone
    if (trimmed.includes("+") || trimmed.endsWith("Z")) {
      const d = new Date(trimmed);
      return isNaN(d.getTime()) ? null : d;
    }

    // DD/MM/YYYY — must check FIRST before anything else
    const dmyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
    if (dmyMatch) {
      const [, day, month, year] = dmyMatch
      const timePart = trimmed.match(/(\d{1,2}):(\d{2})/)
      const hour = timePart ? Number(timePart[1]) : 23
      const min = timePart ? Number(timePart[2]) : 59
      return new Date(Number(year), Number(month) - 1, Number(day), hour, min)
    }

    // Space separator: "2026/04/06 02:33:00"
    if (trimmed.includes(" ") && !trimmed.includes("T")) {
      trimmed = trimmed.replace(" ", "T");
    }

    // Has T (ISO with time)
    if (trimmed.includes("T")) {
      const parts = trimmed.split("T");
      const datePart = parts[0].replace(/\//g, "-");
      const d = new Date(`${datePart}T${parts[1]}+03:00`);
      return isNaN(d.getTime()) ? null : d;
    }

    // Date only: "2026-05-08" or "2026/05/08"
    const clean = trimmed.replace(/\//g, "-");
    const d = new Date(clean + "T00:00:00+03:00");
    return isNaN(d.getTime()) ? null : d;
  }


  // ── Live countdown from end_time ──────────────────────────────────────────
  static liveCountdown(endTime: string | null): { days: string; hours: string; minutes: string; seconds: string } {
    const end = Auction.normalizeDateTime(endTime);
    if (!end) return { days: "00", hours: "00", minutes: "00", seconds: "00" };

    const diff = end.getTime() - Date.now();
    if (diff <= 0) return { days: "00", hours: "00", minutes: "00", seconds: "00" };

    const totalSec = Math.floor(diff / 1000);
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    return {
      days: String(d).padStart(2, "0"),
      hours: String(h).padStart(2, "0"),
      minutes: String(m).padStart(2, "0"),
      seconds: String(s).padStart(2, "0"),
    };
  }

  static formatDisplayDate(dateValue: string | null): string {
    if (!dateValue) return "-"
    const trimmed = dateValue.trim()

    // Skip time-only values like "22:00:00"
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) return "-"

    // DD/MM/YYYY — already display format
    const dmyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
    if (dmyMatch) {
      return `${dmyMatch[1].padStart(2, "0")}/${dmyMatch[2].padStart(2, "0")}/${dmyMatch[3]}`
    }

    // ISO with T: "2026-05-10T09:00:00" or "2026-05-10T09:00:00+03:00"
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (isoMatch) {
      return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`
    }

    return "-"
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
    if (!value || value.trim() === "") return "1 أصل"
    const trimmed = value.trim()
    if (/^\d+$/.test(trimmed)) return `${trimmed} أصل`
    return trimmed.replace("منتج", "أصل").replace("منتجات", "أصول")
  }

  static formatDurationText(value: string | null): string {
    if (!value || value.trim() === "") return "غير محدد";
    return value.trim();
  }

  static fromRow(row: AuctionRow): Auction {
    const prop = Array.isArray(row.property) ? row.property[0] : row.property;
    const propertyType = prop?.property_type?.trim() ?? row.property_type?.trim() ?? "أرض";
    const countdown = Auction.liveCountdown(row.end_time);
    // ── Extract display date from start_time ──
    const rawDate = row.start_time ?? ""
    let displayDate = "-"
    if (rawDate) {
      // DD/MM/YYYY format
      const dmyMatch = rawDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
      if (dmyMatch) {
        displayDate = `${dmyMatch[1].padStart(2, "0")}/${dmyMatch[2].padStart(2, "0")}/${dmyMatch[3]}`
      }
      // ISO format: 2026-05-10T... or 2026-05-10+...
      else {
        const isoMatch = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})/)
        if (isoMatch) {
          displayDate = `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`
        }
      }
    }
    return new Auction({
      id: String(row.auction_id),
      title: row.auction_name?.trim() ?? "مزاد بدون اسم",
      location: `${row.city?.trim() ?? ""} - ${row.district?.trim() ?? ""}`,
      propertyType,
      imageUrl:
        prop?.image_url?.trim() ||
        Auction.getFallbackImage(propertyType),

      startTime: row.start_time ?? null,
      endTime: row.end_time ?? null,

      days: countdown.days,
      hours: countdown.hours,
      minutes: countdown.minutes,
      seconds: countdown.seconds,

      startPrice: row.start_price ?? 0,
      durationText: Auction.formatDurationText(row.duration),
      productsCountText: Auction.formatProductsCount(row.products_count),
      displayDate: (() => {
        const raw = row.start_time ?? ""
        if (!raw) return "-"
        const dmy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
        if (dmy) return `${dmy[1].padStart(2, "0")}/${dmy[2].padStart(2, "0")}/${dmy[3]}`
        const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
        if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`
        return "-"
      })(),
      displayTime: Auction.formatDisplayTime(row.time ?? row.start_time),
      propertyId: row.property_id !== null ? String(row.property_id) : null,
      property: prop ? new Property(prop) : null,
    });

  }


}