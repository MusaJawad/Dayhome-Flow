export type AuthResponse = {
  token: string;
  email: string;
  businessName?: string;
  providerName?: string;
};

export type Child = {
  id: number;
  firstName: string;
  lastName: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  dailyRate: number;
  isActive: boolean;
};

export type AttendanceRecord = {
  id: number;
  childId: number;
  childName: string;
  date: string;
  wasPresent: boolean;
  dropOffTime?: string | null;
  pickUpTime?: string | null;
  notes?: string | null;
};

export type InvoiceDay = {
  day: number;
  value: string;
};

export type InvoiceChildLine = {
  childId: number;
  childName: string;
  parentName?: string | null;
  days: InvoiceDay[];
  totalHours: number;
};

export type InvoicePreview = {
  month: number;
  year: number;
  daysInMonth: number;
  children: InvoiceChildLine[];
};

export type ProviderProfile = {
  id: number;
  businessName: string;
  providerName: string;
  email?: string | null;
  phone?: string | null;
};