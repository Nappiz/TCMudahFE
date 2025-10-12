export type Role = "superadmin" | "admin" | "mentor" | "peserta";

export type Me = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
};

export type Mentor = { id: string; name: string; angkatan: number; visible?: boolean };
export type Curriculum = { id: string; code: string; name: string; sem: 1 | 2 };
export type ClassItem = {
  id: string;
  title: string;
  description: string;
  mentor_ids: string[];
  curriculum_ids: string[];
  price: number; // IDR
  visible?: boolean;
};
export type Catalog = {
  mentors: Mentor[];
  curriculum: Curriculum[];
  classes: ClassItem[];
};

export type CartLine = { id: string; qty: number };
export type Cart = Record<string, number>;

export type CheckoutInfo = {
  bank_name: string;
  bank_account: string;
  bank_holder: string;
  group_link: string;
};

export type Enrollment = {
  id: string;
  user_id: string;
  class_id: string;
  active: boolean;
  created_at?: string;
};

export type MaterialType = "video" | "ppt";

export type ClassMaterial = {
  id: string;
  class_id: string;
  title: string;
  type: MaterialType;
  url: string;
  visible: boolean;
  created_at?: string;
};
