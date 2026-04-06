export type UserRole = "bidder" | "seller" | "admin";

export type UserData = {
  nationalId: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  address: string;
};

export class User {
  nationalId: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  address: string;

  constructor(data: UserData) {
    this.nationalId = data.nationalId;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.phone = data.phone;
    this.role = data.role;
    this.address = data.address;
  }

  createAccount(): User {
    return new User({
      nationalId: this.nationalId,
      name: this.name,
      email: this.email,
      password: this.password,
      phone: this.phone,
      role: this.role,
      address: this.address,
    });
  }

  getFirstName(): string {
    return this.name.split(" ")[0] || "";
  }

  getLastName(): string {
    return this.name.split(" ").slice(1).join(" ") || "";
  }

  toJSON() {
    return {
      nationalId: this.nationalId,
      name: this.name,
      email: this.email,
      password: this.password,
      phone: this.phone,
      role: this.role,
      address: this.address,
    };
  }

  static fromJSON(data: UserData): User {
    return new User(data);
  }
}