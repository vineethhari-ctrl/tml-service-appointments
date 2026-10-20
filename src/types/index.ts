export type TMLPosition =
  | 'RSM West'
  | 'ASM Mumbai'
  | 'National Service Head'
  | 'Dealer Workshop SA / Telecaller';

export type AppScreen =
  | 'serviceDueList'
  | 'productLeads'
  | 'telecallerWorkspace'
  | 'customer360'
  | 'apptReminderList';

export interface SiebelOrgHierarchy {
  organization: string; // e.g., Tata Motors Passenger Vehicles (TMPV)
  division: string; // e.g., West Zone - Mumbai Area
  workshopCode: string; // e.g., 3004450
  workshopName: string; // e.g., ST-Sv&Pa-Kandivali-Wasan
}

export interface Telecaller {
  id: string;
  name: string;
  workshopCode: string;
  workshopName: string;
  skill: string;
  totalLeadsActive: number;
  fresh: number;
  notContacted: number;
  followUps: number;
  todaysFollowUps: number;
  inputBy: 'Leads' | 'Percent';
  weightPercent: number;
  assignedCount: number;
}

export interface ServiceLead {
  id: string;
  customerName: string;
  mobileNo: string;
  customerSeverity: 'Low' | 'Medium' | 'High';
  dueDate: string;
  daysLeft: number;
  ppl: string; // e.g. Altroz, Safari 2.0, Harrier, Nexon EV
  regNo: string; // e.g. MH01BB2826
  customerType: 'Regular' | 'Corporate' | 'VIP';
  pl: string; // e.g. Altroz XE 1.2 P
  serviceType: 'Paid Service' | 'Free Service' | 'Running Repair';
  organization: string;
  division: string;
  workshopCode: string;
  workshopName: string;
  usageType: 'PV' | 'EV';
  opportunityTags: string;
  assignedTelecallerId?: string;
  assignedTelecallerName?: string;
  assignDateTime?: string;
  callStatus: 'Not Attempted' | 'Attempted' | 'Connected' | 'Busy';
  callOutcome: 'Pending' | 'Busy' | 'Call Back' | 'Appt. Booked' | 'Not Interested';
  followUpDate?: string;
  followUpDueSince?: string;
  addressLine1?: string;
  addressLine2?: string;
  pinCode?: string;
  leadBucket: '-30 Days' | '0-6 Days' | '7-14 Days' | '15-30 Days';
  rescheduleReason?: string;
  leadCategory?:
    | 'Service Due Leads'
    | 'Appt. Reminder'
    | 'PSF Leads'
    | 'Product Leads'
    | 'Lost Customers'
    | 'External Leads'
    | 'Inbound Leads'
    | 'Lapsed Leads'
    | 'Closed/Inactive';
  closureReason?: string;
  closedDate?: string;
  psfRating?: number;
  productType?: 'Extended Warranty' | 'AMC' | 'VAS' | 'Insurance (TMI)' | 'Anti-Rust';
  leadSource?: 'Web Portal' | 'iRA Connected App' | 'Inbound Reception' | 'Dealer Aggregator';
  opportunityCount?: number;
  productOpportunities?: {
    ew: boolean;
    amc: boolean;
    rsa: boolean;
    tmi: boolean;
  };
}

export interface BookedAppointment {
  id: string;
  leadId: string;
  customerName: string;
  mobileNo: string;
  regNo: string;
  vehicleModel: string;
  serviceType: string;
  organization: string;
  division: string;
  workshopCode: string;
  workshopName: string;
  serviceAdvisor: string;
  date: string;
  timeSlot: string;
  pickupDropType: 'None' | 'Pickup' | 'Drop' | 'Pickup & Drop';
  pickupAddress?: string;
  pickupPinCode?: string;
  pickupDateTime?: string;
  dropAddress?: string;
  dropPinCode?: string;
  dropDateTime?: string;
  status: 'Booked' | 'Rescheduled' | 'Vehicle Arrived' | 'Completed';
  bookedAt: string;
  rescheduleHistory?: {
    previousSlot: string;
    previousDate: string;
    reason: string;
    timestamp: string;
  }[];
}
