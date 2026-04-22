export type PropertyRow = {
  property_id: number;
  property_type: string | null;
  city: string | null;
  district: string | null;
  region: string | null;
  area: number | null;
  usage: string | null;
  deed_number: string | null;
  plan_number: string | null;
  plot_number: string | null;
  north_boundary: string | null;
  south_boundary: string | null;
  east_boundary: string | null;
  west_boundary: string | null;
  image_url: string | null;
};

export type PropertyJoinRow = {
  auction_id: number;
  auction_name: string;
  start_time: string | null;
  end_time: string | null;
  start_price: number | null;
  highest_bid: number | null;
  duration: string | null;
  products_count: string | null;
  time: string | null;
  property: PropertyRow | PropertyRow[] | null;
};

export class Property {
  id: string;
  propertyType: string;
  city: string;
  district: string;
  region: string;
  area: number;
  usage: string;
  deedNumber: string;
  planNumber: string;
  plotNumber: string;
  northBoundary: string;
  southBoundary: string;
  eastBoundary: string;
  westBoundary: string;
  imageUrl: string;

  constructor(data: {
    id: string;
    propertyType: string;
    city: string;
    district: string;
    region: string;
    area: number;
    usage: string;
    deedNumber: string;
    planNumber: string;
    plotNumber: string;
    northBoundary: string;
    southBoundary: string;
    eastBoundary: string;
    westBoundary: string;
    imageUrl: string;
  }) {
    this.id = data.id;
    this.propertyType = data.propertyType;
    this.city = data.city;
    this.district = data.district;
    this.region = data.region;
    this.area = data.area;
    this.usage = data.usage;
    this.deedNumber = data.deedNumber;
    this.planNumber = data.planNumber;
    this.plotNumber = data.plotNumber;
    this.northBoundary = data.northBoundary;
    this.southBoundary = data.southBoundary;
    this.eastBoundary = data.eastBoundary;
    this.westBoundary = data.westBoundary;
    this.imageUrl = data.imageUrl;
  }

  static getFallbackImage(propertyType: string) {
    switch (propertyType) {
      case "فيلا":
        return "https://images.unsplash.com/photo-1575356864509-f1727fd74ee4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
      case "عمارة":
        return "https://images.unsplash.com/photo-1755567818043-a86c648900de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
      case "سوق":
        return "https://images.unsplash.com/photo-1764983265127-8ec30a9c7b64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
      case "شقة":
        return "https://images.unsplash.com/photo-1755567818043-a86c648900de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
      case "أرض":
      default:
        return "https://images.unsplash.com/photo-1764222233275-87dc016c11dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
    }
  }

  static fromRow(row: PropertyRow): Property {
    const propertyType = row.property_type?.trim() ?? "أرض";

    return new Property({
      id: String(row.property_id),
      propertyType,
      city: row.city?.trim() ?? "",
      district: row.district?.trim() ?? "",
      region: row.region?.trim() ?? "",
      area: row.area ?? 0,
      usage: row.usage?.trim() ?? "",
      deedNumber: row.deed_number?.trim() ?? "",
      planNumber: row.plan_number?.trim() ?? "",
      plotNumber: row.plot_number?.trim() ?? "",
      northBoundary: row.north_boundary?.trim() ?? "",
      southBoundary: row.south_boundary?.trim() ?? "",
      eastBoundary: row.east_boundary?.trim() ?? "",
      westBoundary: row.west_boundary?.trim() ?? "",
      imageUrl: row.image_url?.trim() || Property.getFallbackImage(propertyType),
    });
  }
}

export class PropertyDetails {
  auctionId: string;
  auctionTitle: string;
  propertyId: string;
  propertyType: string;
  city: string;
  district: string;
  region: string;
  locationText: string;
  area: string;
  currentPrice: string;
  openingPrice: string;
  deposit: string;
  usage: string;
  deedNumber: string;
  planNumber: string;
  plotNumber: string;
  startDate: string;
  endDate: string;
  displayTime: string;
  imageUrl: string;
  northBoundary: string;
  southBoundary: string;
  eastBoundary: string;
  westBoundary: string;

  constructor(data: {
    auctionId: string;
    auctionTitle: string;
    propertyId: string;
    propertyType: string;
    city: string;
    district: string;
    region: string;
    locationText: string;
    area: string;
    currentPrice: string;
    openingPrice: string;
    deposit: string;
    usage: string;
    deedNumber: string;
    planNumber: string;
    plotNumber: string;
    startDate: string;
    endDate: string;
    displayTime: string;
    imageUrl: string;
    northBoundary: string;
    southBoundary: string;
    eastBoundary: string;
    westBoundary: string;
  }) {
    this.auctionId = data.auctionId;
    this.auctionTitle = data.auctionTitle;
    this.propertyId = data.propertyId;
    this.propertyType = data.propertyType;
    this.city = data.city;
    this.district = data.district;
    this.region = data.region;
    this.locationText = data.locationText;
    this.area = data.area;
    this.currentPrice = data.currentPrice;
    this.openingPrice = data.openingPrice;
    this.deposit = data.deposit;
    this.usage = data.usage;
    this.deedNumber = data.deedNumber;
    this.planNumber = data.planNumber;
    this.plotNumber = data.plotNumber;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.displayTime = data.displayTime;
    this.imageUrl = data.imageUrl;
    this.northBoundary = data.northBoundary;
    this.southBoundary = data.southBoundary;
    this.eastBoundary = data.eastBoundary;
    this.westBoundary = data.westBoundary;
  }

  static formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) return "0 ر.س";
    return `${value.toLocaleString("en-US")} ر.س`;
  }

  static formatArea(value: number | null | undefined): string {
    if (value === null || value === undefined) return "غير محدد";
    return value.toLocaleString("en-US");
  }

  static formatDate(dateValue: string | null): string {
    if (!dateValue) return "-";
    const parts = dateValue.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}/${month.padStart(2, "0")}/${day.padStart(2, "0")}`;
    }
    return dateValue;
  }

  static formatTime(timeValue: string | null): string {
    if (!timeValue) return "-";
    const parts = timeValue.split(":");
    let hour = Number(parts[0] ?? 0);
    const minute = parts[1] ?? "00";
    const period = hour >= 12 ? "م" : "ص";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${String(hour).padStart(2, "0")}:${minute} ${period}`;
  }

  static getFallbackImage(propertyType: string) {
    return Property.getFallbackImage(propertyType);
  }

  static fromJoinRow(row: PropertyJoinRow): PropertyDetails {
    const property = Array.isArray(row.property)
  ? row.property[0] ?? null
  : row.property;

    const propertyType = property?.property_type?.trim() ?? "أرض";
    const city = property?.city?.trim() ?? "-";
    const district = property?.district?.trim() ?? "-";

    return new PropertyDetails({
      auctionId: String(row.auction_id),
      auctionTitle: row.auction_name?.trim() ?? "تفاصيل المزاد",
      propertyId: property?.property_id ? String(property.property_id) : "-",
      propertyType,
      city,
      district,
      region: property?.region?.trim() ?? "-",
      locationText: `${city}، ${district}`,
      area: this.formatArea(property?.area),
      currentPrice: this.formatCurrency(row.highest_bid ?? row.start_price ?? 0),
      openingPrice: this.formatCurrency(row.start_price ?? 0),
      deposit: this.formatCurrency(
        row.start_price ? Math.round(row.start_price * 0.1) : 0
      ),
      usage: property?.usage?.trim() ?? "سكني",
      deedNumber: property?.deed_number?.trim() ?? "-",
      planNumber: property?.plan_number?.trim() ?? "-",
      plotNumber: property?.plot_number?.trim() ?? "-",
      startDate: this.formatDate(row.start_time),
      endDate: this.formatDate(row.end_time),
      displayTime: this.formatTime(row.time),
      imageUrl: property?.image_url?.trim() || this.getFallbackImage(propertyType),
      northBoundary: property?.north_boundary?.trim() ?? "-",
      southBoundary: property?.south_boundary?.trim() ?? "-",
      eastBoundary: property?.east_boundary?.trim() ?? "-",
      westBoundary: property?.west_boundary?.trim() ?? "-",
    });
  }
}