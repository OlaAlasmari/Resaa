import { supabase } from "../../lib/supabase";
import { User, UserData, UserRole } from "../models/User";

export type RegisterInput = {
  firstName: string;
  lastName: string;
  nationalId: string;
  phone: string;
  email: string;
  password: string;
  address: string;
  role?: UserRole;
};

export type LoginInput = {
  nationalId: string;
  password: string;
};

export type ProfileRecord = {
  id: string;
  first_name: string;
  last_name: string;
  national_id: string;
  phone: string;
  email: string;
  address: string | null;
  role: UserRole;
  company_name?: string | null;
  created_at?: string;
};

export type UpdateProfileInput = {
  firstName: string;
  lastName: string;
  phone: string;
  nationalId: string;
  address: string;
};

class AuthService {
  private buildUserData(profile: ProfileRecord, password = ""): UserData {
    return {
      nationalId: profile.national_id,
      name: `${profile.first_name} ${profile.last_name}`.trim(),
      email: profile.email,
      password,
      phone: profile.phone,
      role: profile.role,
      address: profile.address ?? "",
    };
  }

  private mapProfileToUser(profile: ProfileRecord, password = ""): User {
    return new User(this.buildUserData(profile, password));
  }

  async register(input: RegisterInput): Promise<User> {
    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();
    const nationalId = input.nationalId.trim();
    const phone = input.phone.trim();
    const email = input.email.trim().toLowerCase();
    const password = input.password;
    const address = input.address.trim();

    if (!firstName) {
      throw new Error("الاسم الأول مطلوب");
    }

    if (!lastName) {
      throw new Error("اسم العائلة مطلوب");
    }

    if (!/^[0-9]{10}$/.test(nationalId)) {
      throw new Error("الهوية الوطنية يجب أن تكون 10 أرقام");
    }

    if (!/^05[0-9]{8}$/.test(phone)) {
      throw new Error("رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام");
    }

    if (!email) {
      throw new Error("البريد الإلكتروني مطلوب");
    }

    if (password.length < 6) {
      throw new Error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    }

    const { data: existingNationalId, error: nationalIdError } = await supabase
      .from("profiles")
      .select("id")
      .eq("national_id", nationalId)
      .maybeSingle();

    if (nationalIdError) {
      throw new Error("تعذر التحقق من الهوية الوطنية");
    }

    if (existingNationalId) {
      throw new Error("رقم الهوية مسجل مسبقًا");
    }

    const { data: existingEmail, error: emailError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (emailError) {
      throw new Error("تعذر التحقق من البريد الإلكتروني");
    }

    if (existingEmail) {
      throw new Error("البريد الإلكتروني مسجل مسبقًا");
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      throw new Error(this.translateAuthError(signUpError.message));
    }

    if (!signUpData.user) {
      throw new Error("فشل إنشاء المستخدم");
    }

    const { data: insertedProfile, error: insertProfileError } = await supabase
      .from("profiles")
      .insert({
        id: signUpData.user.id,
        first_name: firstName,
        last_name: lastName,
        national_id: nationalId,
        phone,
        email,
        address: address || null,
        role: input.role ?? "bidder",
      })
      .select("*")
      .single();

    if (insertProfileError || !insertedProfile) {
      throw new Error("تم إنشاء المستخدم ولكن فشل حفظ بياناته في profiles");
    }

    return this.mapProfileToUser(insertedProfile as ProfileRecord, password);
  }

  async login(input: LoginInput): Promise<User> {
    const nationalId = input.nationalId.trim();
    const password = input.password.trim();

    if (!/^[0-9]{10}$/.test(nationalId)) {
      throw new Error("أدخلي هوية وطنية صحيحة");
    }

    if (!password) {
      throw new Error("كلمة المرور مطلوبة");
    }

    const { data: profileByNationalId, error: profileLookupError } = await supabase
      .from("profiles")
      .select("*")
      .eq("national_id", nationalId)
      .maybeSingle();

    console.log("login nationalId:", nationalId);
    console.log("profileLookupError:", profileLookupError);
    console.log("profileByNationalId:", profileByNationalId);

    if (profileLookupError) {
      throw new Error("تعذر التحقق من بيانات المستخدم");
    }

    if (!profileByNationalId) {
      throw new Error("هذا الحساب غير موجود، يجب إنشاء حساب أولًا");
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: profileByNationalId.email,
      password,
    });

    console.log("signInError:", signInError);
    console.log("signInData:", signInData);

    if (signInError) {
      throw new Error(this.translateAuthError(signInError.message));
    }

    if (!signInData.user) {
      throw new Error("فشل تسجيل الدخول");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", signInData.user.id)
      .single();

    console.log("final profileError:", profileError);
    console.log("final profile:", profile);

    if (profileError || !profile) {
      throw new Error("تم تسجيل الدخول لكن تعذر تحميل بيانات المستخدم");
    }

    return this.mapProfileToUser(profile as ProfileRecord, password);
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return null;
    }

    return this.mapProfileToUser(profile as ProfileRecord);
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error("فشل تسجيل الخروج");
    }
  }

  private translateAuthError(message: string): string {
    const lower = message.toLowerCase();

    if (lower.includes("user already registered")) {
      return "هذا الحساب مسجل مسبقًا";
    }

    if (lower.includes("invalid login credentials")) {
      return "كلمة المرور غير صحيحة";
    }

    if (lower.includes("email not confirmed")) {
      return "يجب تأكيد البريد الإلكتروني أولًا";
    }

    if (lower.includes("password")) {
      return "كلمة المرور غير صالحة";
    }

    return message;
  }
}

export const authService = new AuthService();