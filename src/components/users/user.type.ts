export interface User {
  _id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  verified: boolean;
  role: string;
  address?: string;
  phone?: string;
  profile?: string;
  createdAt: string;
  updatedAt: string;
  location: {
    type: string;
    coordinates: number[];
  };
  __v?: number;
}
