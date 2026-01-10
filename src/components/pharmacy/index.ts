export interface Pharmacy {
  _id: string;
  logo: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
  title: string;
  yearofBusiness: string;
  businessPhoneNumber: string;
  licenseNumber: string;
  message: string;
  status: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

export interface PharmacyFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
  title: string;
  yearofBusiness: string;
  licenseNumber: string;
  businessPhoneNumber: string;
  message: string;
  status: string;
  latitude: string;
  longitude: string;
  logo: File | null;
}

export interface PharmacyFormProps {
  formData: PharmacyFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<PharmacyFormData>>;
}