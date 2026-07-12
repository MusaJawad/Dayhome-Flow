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
  contractFee: number;
};

export type InvoicePreview = {
  month: number;
  year: number;
  daysInMonth: number;
  children: InvoiceChildLine[];
  subTotal: number;
  agencyFees: number;
  liabilityInsurance: number;
  storyparkDeduction: number;
  trainingCourses: number;
  deductions: number;
  additions: number;
  totalPaid: number;
};