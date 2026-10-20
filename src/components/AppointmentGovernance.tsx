import React, { useState } from 'react';
import {
  ChevronLeft,
  Check,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Car,
  User,
  Building2,
  Copy,
  AlertCircle,
  X,
  Search,
  Lock,
  ShieldCheck,
  Users,
  UserCheck,
  UserPlus,
  SlidersHorizontal,
  ListFilter,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import {
  ServiceLead,
  Telecaller,
  BookedAppointment,
  TMLPosition,
  AppScreen
} from '../types';

interface AppointmentGovernanceProps {
  leads: ServiceLead[];
  telecallers: Telecaller[];
  bookedAppointments: BookedAppointment[];
  onAssignLeads: (telecallerAllocations: { telecallerId: string; count: number }[]) => void;
  onBookAppointment: (appt: BookedAppointment) => void;
  onRescheduleAppointment: (apptId: string, newSlot: string, newDate: string, reason: string) => void;
  currentPosition: TMLPosition;
  selectedDivision: string;
  selectedWorkshop: string;
  isReadOnly: boolean;
  onToggleReadOnly: () => void;
  currentScreen: AppScreen;
  onScreenChange: (s: AppScreen) => void;
}

export const AppointmentGovernance: React.FC<AppointmentGovernanceProps> = ({
  leads,
  telecallers,
  bookedAppointments,
  onAssignLeads,
  onBookAppointment,
  onRescheduleAppointment,
  currentPosition,
  selectedDivision,
  selectedWorkshop,
  isReadOnly,
  onToggleReadOnly,
  currentScreen,
  onScreenChange
}) => {
  // Counters for the yellow split badge (Page 1 & 7)
  const [unassignedCount, setUnassignedCount] = useState(219);
  const [assignedCount, setAssignedCount] = useState(2);

  // Filters (Page 1)
  const [serviceTypeFilter, setServiceTypeFilter] = useState('Select Service Type');
  const [opportunityTagFilter, setOpportunityTagFilter] = useState('Opportunity Tag');
  const [assigneeFilter, setAssigneeFilter] = useState('Assignee');
  const [searchQuery, setSearchQuery] = useState('');
  const [powertrainFilter, setPowertrainFilter] = useState<'All' | 'PV' | 'EV'>('All');
  const [agingFilter, setAgingFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState(currentScreen === 'productLeads' ? 'Product Leads' : 'Service Due Leads');
  const [productAssignmentTab, setProductAssignmentTab] = useState<'unassigned' | 'assigned'>('unassigned');
  const [productPplFilter, setProductPplFilter] = useState('PPL');

  // Sync activeTab when currentScreen changes
  React.useEffect(() => {
    if (currentScreen === 'productLeads') {
      setActiveTab('Product Leads');
    } else if (currentScreen === 'serviceDueList' && activeTab === 'Product Leads') {
      setActiveTab('Service Due Leads');
    }
  }, [currentScreen]);

  // Lead selection & Modals (Pages 1, 2, 3, 4, 5, 6, 7)
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>(['LEAD-001', 'LEAD-002', 'LEAD-003']);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [bulkOption, setBulkOption] = useState<'all' | 'custom'>('custom');
  const [customCount, setCustomCount] = useState(3);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignedSuccessDialog, setAssignedSuccessDialog] = useState<{
    count: number;
    lines: string[];
  } | null>(null);

  // Customer 360 State (Pages 9-13)
  const [activeCustomer, setActiveCustomer] = useState<ServiceLead>(leads[0]);
  const [activeScriptTab, setActiveScriptTab] = useState<'svc' | 'ew' | 'amc' | 'rsa' | 'tmi'>('svc');
  const [isCalling, setIsCalling] = useState(false);
  const [callDispositionStatus, setCallDispositionStatus] = useState('Call Back');
  const [callSubStatus, setCallSubStatus] = useState('Call Back');
  const [isFollowUpChecked, setIsFollowUpChecked] = useState(true);
  const [followUpDateInput, setFollowUpDateInput] = useState('2026-10-19T15:57');
  const [followUpError, setFollowUpError] = useState<string | null>(null);
  const [vocText, setVocText] = useState('Low Mileage');
  const [remarkText, setRemarkText] = useState('Customer Busy');
  const [productLeadDispo, setProductLeadDispo] = useState({ ew: true, amc: false, campaign: false, tmi: false });

  // Slot Availability & Booking State (Pages 14-17)
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [slotDate, setSlotDate] = useState('Tue 20 October');
  const [slotTime, setSlotTime] = useState('11:00-11:30 AM');
  const [serviceAdvisor, setServiceAdvisor] = useState('LALIT VISPUTE');
  const [pickupDropSelection, setPickupDropSelection] = useState<'pickup' | 'drop' | 'both'>('both');
  const [addressLine1, setAddressLine1] = useState('Dumping Rd, Jagjivan Ram Nagar, Mulund West, Mumbai, Maharashtra 400604, India');
  const [addressLine2, setAddressLine2] = useState('Near Check Naka');
  const [pinCode, setPinCode] = useState('400604');
  const [preferredPickupTime, setPreferredPickupTime] = useState('2026-10-20T09:46');
  const [preferredDropTime, setPreferredDropTime] = useState('2026-10-20T20:48');
  const [appointmentBookedConfirmation, setAppointmentBookedConfirmation] = useState<BookedAppointment | null>(null);

  // Reschedule State (Pages 20-22)
  const [isRescheduleMode, setIsRescheduleMode] = useState(false);
  const [rescheduleLead, setRescheduleLead] = useState<BookedAppointment | null>(null);
  const [rescheduleNewSlot, setRescheduleNewSlot] = useState('11:00-11:30 AM');
  const [rescheduleVoc, setRescheduleVoc] = useState('Low Mileage');
  const [rescheduleReason, setRescheduleReason] = useState('Vehicle Unavailable');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // Dynamic Tab Record Counts matching Siebel/Dealer Application
  const tabCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      'Service Due Leads': 0,
      'Appt. Reminder': bookedAppointments.length,
      'PSF Leads': 0,
      'Product Leads': 0,
      'Lost Customers': 0,
      'External Leads': 0,
      'Inbound Leads': 0,
      'Lapsed Leads': 0,
      'Closed/Inactive': 0
    };

    leads.forEach((l) => {
      // Check position and workshop matching for counts
      let matches = true;
      if (currentPosition === 'ASM Mumbai' || currentPosition === 'Dealer Workshop SA / Telecaller') {
        if (l.division !== 'West Zone - Mumbai Area') matches = false;
      } else if (currentPosition === 'RSM West') {
        if (!l.division.startsWith('West Zone')) matches = false;
      }
      if (selectedDivision !== 'All Organizations & Divisions' && selectedDivision !== 'All West Divisions') {
        if (l.division !== selectedDivision) matches = false;
      }
      if (selectedWorkshop !== 'ALL' && selectedWorkshop !== 'All Workshops in Division') {
        if (!selectedWorkshop.includes(l.workshopName) && !l.workshopName.includes(selectedWorkshop) && !selectedWorkshop.includes(l.workshopCode)) {
          matches = false;
        }
      }

      if (matches) {
        const cat = l.leadCategory || 'Service Due Leads';
        if (counts[cat] !== undefined) {
          counts[cat]++;
        }
      }
    });

    return counts;
  }, [leads, bookedAppointments, currentPosition, selectedDivision, selectedWorkshop]);

  // Siebel Hierarchical Filtering: Filter records based on TML Position & Division & Active Tab
  const visibleLeads = leads.filter((lead) => {
    // 0. Active Tab Category filter
    const leadCat = lead.leadCategory || 'Service Due Leads';
    if (activeTab === 'Service Due Leads') {
      if (leadCat !== 'Service Due Leads') return false;
    } else {
      if (leadCat !== activeTab) return false;
    }

    // Product Leads Specific Sub-Tab & PPL Filters (Matching Screenshot)
    if (activeTab === 'Product Leads') {
      if (productAssignmentTab === 'unassigned' && lead.assignedTelecallerId) return false;
      if (productAssignmentTab === 'assigned' && !lead.assignedTelecallerId) return false;
      if (productPplFilter !== 'PPL' && productPplFilter !== 'All PPL' && lead.ppl !== productPplFilter) return false;
    }

    // 1. Position-based Division filter
    if (currentPosition === 'ASM Mumbai' || currentPosition === 'Dealer Workshop SA / Telecaller') {
      if (lead.division !== 'West Zone - Mumbai Area') return false;
    } else if (currentPosition === 'RSM West') {
      if (!lead.division.startsWith('West Zone')) return false;
    }
    // 2. Division dropdown filter (if specific division selected)
    if (selectedDivision !== 'All Organizations & Divisions' && selectedDivision !== 'All West Divisions') {
      if (lead.division !== selectedDivision) return false;
    }
    // 3. Workshop filter
    if (selectedWorkshop !== 'ALL' && selectedWorkshop !== 'All Workshops in Division') {
      if (!selectedWorkshop.includes(lead.workshopName) && !lead.workshopName.includes(selectedWorkshop)) {
        // match code or name
        if (!selectedWorkshop.includes(lead.workshopCode)) return false;
      }
    }
    // 4. Powertrain filter
    if (powertrainFilter !== 'All' && lead.usageType !== powertrainFilter) return false;
    // 5. Aging filter
    if (agingFilter !== 'All' && lead.leadBucket !== agingFilter) return false;
    // 6. Service Type filter
    if (serviceTypeFilter !== 'Select Service Type' && serviceTypeFilter !== 'All Service Types') {
      if (lead.serviceType !== serviceTypeFilter) return false;
    }
    // 7. Opportunity Tag filter
    if (opportunityTagFilter !== 'Opportunity Tag' && opportunityTagFilter !== 'All Opportunity Tags') {
      if (!lead.opportunityTags || !lead.opportunityTags.toLowerCase().includes(opportunityTagFilter.toLowerCase())) return false;
    }
    // 8. Assignee filter
    if (assigneeFilter !== 'Assignee' && assigneeFilter !== 'All Assignees') {
      if (assigneeFilter === 'Unassigned') {
        if (lead.assignedTelecallerName || lead.assignedTelecallerId) return false;
      } else {
        if (lead.assignedTelecallerName !== assigneeFilter) return false;
      }
    }
    // 9. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        lead.customerName.toLowerCase().includes(q) ||
        lead.regNo.toLowerCase().includes(q) ||
        lead.mobileNo.includes(q) ||
        lead.ppl.toLowerCase().includes(q) ||
        (lead.closureReason && lead.closureReason.toLowerCase().includes(q)) ||
        (lead.opportunityTags && lead.opportunityTags.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Follow-up validation (Page 12: "Follow-up date cannot be in past")
  const handleFollowUpChange = (val: string) => {
    setFollowUpDateInput(val);
    const dateObj = new Date(val);
    const simulatedNow = new Date('2026-10-19T15:45:00');
    if (dateObj < simulatedNow) {
      setFollowUpError('Follow-up Date & Time cannot be in the past');
    } else {
      setFollowUpError(null);
    }
  };

  // Confirm Telecaller Assignment (Pages 2 & 7)
  const handleConfirmAssignment = () => {
    const total = bulkOption === 'all' ? selectedLeadIds.length : customCount;
    onAssignLeads([
      { telecallerId: 'TC-03', count: 1 },
      { telecallerId: 'TC-05', count: 2 }
    ]);
    setShowAssignModal(false);
    setShowBulkAssignModal(false);
    setUnassignedCount(216);
    setAssignedCount(5);
    setAssignedSuccessDialog({
      count: total,
      lines: ['PRASAD BHAGWATI — 1', 'SUBHASH VIRMANI — 2']
    });
  };

  // Confirm Slot Booking (Page 18)
  const handleConfirmSlotBooking = () => {
    const newAppt: BookedAppointment = {
      id: 'APPT261019727205B6',
      leadId: activeCustomer.id,
      customerName: activeCustomer.customerName,
      mobileNo: activeCustomer.mobileNo,
      regNo: activeCustomer.regNo,
      vehicleModel: activeCustomer.pl,
      serviceType: activeCustomer.serviceType,
      organization: activeCustomer.organization,
      division: activeCustomer.division,
      workshopCode: activeCustomer.workshopCode,
      workshopName: activeCustomer.workshopName,
      serviceAdvisor: serviceAdvisor,
      date: 'Tue, 20 Oct',
      timeSlot: slotTime,
      pickupDropType: 'Pickup & Drop',
      pickupAddress: `${addressLine1}, ${addressLine2}`,
      pickupPinCode: pinCode,
      pickupDateTime: preferredPickupTime,
      dropAddress: `${addressLine1}, ${addressLine2}`,
      dropPinCode: pinCode,
      dropDateTime: preferredDropTime,
      status: 'Booked',
      bookedAt: '19-10-2026 15:52 PM'
    };
    onBookAppointment(newAppt);
    setShowSlotModal(false);
    setAppointmentBookedConfirmation(newAppt);
  };

  // Reschedule validation (Page 21: "Doesn't Allow Same Slot")
  const handleConfirmReschedule = () => {
    if (!rescheduleLead) return;
    if (rescheduleNewSlot === rescheduleLead.timeSlot) {
      setRescheduleError('Please select a different time slot to reschedule — the appointment is already booked for this slot');
      return;
    }
    setRescheduleError(null);
    onRescheduleAppointment(rescheduleLead.id, rescheduleNewSlot, 'Wed, 21 Oct', rescheduleReason);
    setIsRescheduleMode(false);
    setRescheduleLead(null);
    onScreenChange('apptReminderList');
  };

  return (
    <div className="space-y-3 font-sans text-gray-800 text-xs">
      {/* =========================================================================
          SCREEN 1: LEAD ASSIGNMENT - SERVICE DUE & PRODUCT LEADS (DEALER VIEW)
         ========================================================================= */}
      {(currentScreen === 'serviceDueList' || currentScreen === 'productLeads') && (
        <div className="bg-white border border-gray-200 rounded shadow-xs overflow-hidden">
          {/* Breadcrumb line matching dealer application screenshot */}
          <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between text-gray-700 bg-white">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span
                onClick={() => {
                  setActiveTab('Service Due Leads');
                  onScreenChange('serviceDueList');
                }}
                title="Back to Service Due Leads"
                className="cursor-pointer text-gray-500 hover:text-gray-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </span>
              <span>Lead Assignment : {activeTab}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono">
              <span className="font-semibold text-gray-700">Position Scope:</span>
              <span>{currentPosition}</span>
              <span>·</span>
              <span>19/10/2026</span>
            </div>
          </div>

          {/* Module Tabs (Pill Buttons matching Dealer View Screenshot) */}
          <div className="border-b border-gray-200 px-4 py-2.5 flex items-center gap-2 overflow-x-auto text-xs bg-white">
            {[
              { id: 'Service Due Leads', label: 'Service Due Leads' },
              { id: 'Appt. Reminder', label: 'Appointment List' },
              { id: 'PSF Leads', label: 'PSF Leads' },
              { id: 'Product Leads', label: 'Product Leads' },
              { id: 'Lost Customers', label: 'Lost Customer' },
              { id: 'External Leads', label: 'External Leads' },
              { id: 'Inbound Leads', label: 'Inbound Leads' },
              { id: 'Lapsed Leads', label: 'Lapsed Leads' },
              { id: 'Closed/Inactive', label: 'Closed/Inactive' }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'Appt. Reminder') {
                      onScreenChange('apptReminderList');
                    } else if (tab.id === 'Product Leads') {
                      onScreenChange('productLeads');
                    } else {
                      onScreenChange('serviceDueList');
                    }
                    setActiveTab(tab.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'border-2 border-[#1877F2] text-[#1877F2] font-bold bg-white shadow-2xs'
                      : 'border border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-counter Tabs for Product Leads (Page 1 Screenshot: 295 Unassigned | 2 Assigned) */}
          {activeTab === 'Product Leads' && (
            <div className="border-b border-gray-200 px-4 flex items-center gap-8 bg-white text-xs">
              <button
                onClick={() => setProductAssignmentTab('unassigned')}
                className={`py-2.5 flex items-center gap-2 border-b-2 font-semibold transition-colors cursor-pointer ${
                  productAssignmentTab === 'unassigned'
                    ? 'border-blue-600 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-red-600 font-bold font-mono text-xs">295</span>
                <span className="font-semibold text-gray-800">Unassigned</span>
              </button>
              <button
                onClick={() => setProductAssignmentTab('assigned')}
                className={`py-2.5 flex items-center gap-2 border-b-2 font-semibold transition-colors cursor-pointer ${
                  productAssignmentTab === 'assigned'
                    ? 'border-blue-600 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <UserCheck className="w-4 h-4 text-gray-400" />
                <span className="text-emerald-600 font-bold font-mono text-xs">2</span>
                <span className="font-semibold text-gray-800">Assigned</span>
              </button>
            </div>
          )}

          {/* Sub-counter for Service Due Leads (Yellow Split Badge) */}
          {activeTab === 'Service Due Leads' && (
            <div className="border-b border-gray-200 px-4 py-2 flex items-center gap-4 bg-white text-xs">
              <div className="flex items-center border border-amber-300 bg-amber-50 rounded px-2 py-0.5 text-[11px] leading-tight">
                <div className="pr-2 text-center">
                  <div className="font-bold text-gray-900 font-mono text-xs">{unassignedCount}</div>
                  <div className="text-[9px] text-gray-500">Unassigned</div>
                </div>
                <div className="w-[1px] h-5 bg-amber-200 mx-1" />
                <div className="pl-2 text-center">
                  <div className="font-bold text-gray-900 font-mono text-xs">{assignedCount}</div>
                  <div className="text-[9px] text-gray-500">Assigned</div>
                </div>
              </div>
              <span className="text-gray-500 text-[11px]">Scheduled Maintenance &amp; Periodic Service Due Pipeline</span>
            </div>
          )}

          {/* Filters Bar for Product Leads (Matching Screenshot) */}
          {activeTab === 'Product Leads' ? (
            <div className="p-3 bg-gray-50/60 border-b border-gray-200 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                {/* Workshop Dropdown */}
                <div className="relative">
                  <select
                    value={selectedWorkshop}
                    disabled={isReadOnly}
                    className="py-1.5 pl-3 pr-8 border border-gray-300 rounded-md bg-white text-xs font-medium text-gray-800 cursor-pointer shadow-2xs hover:border-gray-400 focus:outline-hidden focus:border-blue-500 appearance-none min-w-[210px] disabled:bg-gray-100 disabled:cursor-default"
                  >
                    <option value="3004450">ST-Sv&Pa-Kandivali-Wasan</option>
                    <option value="3004455">Wasan Motors - Chembur</option>
                    <option value="3004456">Heritage Motors - Borivali</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* PPL Dropdown */}
                <div className="relative">
                  <select
                    value={productPplFilter}
                    onChange={(e) => setProductPplFilter(e.target.value)}
                    className="py-1.5 pl-3 pr-8 border border-gray-300 rounded-md bg-white text-xs font-medium text-gray-800 cursor-pointer shadow-2xs hover:border-gray-400 focus:outline-hidden focus:border-blue-500 appearance-none min-w-[130px]"
                  >
                    <option value="PPL">PPL</option>
                    <option value="All PPL">All PPL</option>
                    <option value="Harrier">Harrier</option>
                    <option value="Punch">Punch</option>
                    <option value="Safari 2.0">Safari 2.0</option>
                    <option value="Tiago">Tiago</option>
                    <option value="Altroz">Altroz</option>
                    <option value="Nexon EV">Nexon EV</option>
                    <option value="Curvv">Curvv</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => {}}
                    className="px-4 py-1.5 bg-[#1877F2] hover:bg-blue-600 text-white rounded-md text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Search</span>
                    <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>

                  <button
                    onClick={() => {
                      setProductPplFilter('PPL');
                      setPowertrainFilter('All');
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium cursor-pointer shadow-2xs"
                  >
                    Clear
                  </button>

                  <button
                    disabled={isReadOnly}
                    onClick={() => {
                      if (selectedLeadIds.length === 0) {
                        setSelectedLeadIds(visibleLeads.slice(0, 3).map((l) => l.id));
                      }
                      setShowAssignModal(true);
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title={isReadOnly ? 'Read-only in TML Position View (toggle unlock above to test)' : 'Assign selected product leads to telecallers'}
                  >
                    <UserPlus className="w-3.5 h-3.5 text-gray-500" />
                    <span>Assign Leads</span>
                  </button>

                  <button className="p-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-500 cursor-pointer shadow-2xs" title="Filter Presets">
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>

                  <button className="p-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-500 cursor-pointer shadow-2xs" title="Sort Column Settings">
                    <ListFilter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-bar below filters matching screenshot */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                <div className="text-[11px] text-gray-500 font-normal">
                  Showing 1 to {visibleLeads.length} of {productAssignmentTab === 'unassigned' ? 295 : 2} entries
                </div>

                <div className="flex items-center gap-3">
                  <button
                    disabled={isReadOnly}
                    onClick={() => setShowBulkAssignModal(true)}
                    className="px-4 py-1 bg-[#1877F2] hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-full text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                    title={isReadOnly ? 'Read-only in TML Position View (toggle unlock above to test)' : 'Bulk Assign Product Leads'}
                  >
                    Bulk Assign
                  </button>

                  <div className="flex items-center border border-gray-300 rounded-full overflow-hidden bg-white text-[11px] p-0.5 shadow-2xs">
                    {['All', 'PV', 'EV'].map((fuel) => (
                      <button
                        key={fuel}
                        onClick={() => setPowertrainFilter(fuel as any)}
                        className={`px-3 py-0.5 rounded-full transition-colors cursor-pointer ${
                          powertrainFilter === fuel ? 'bg-[#1877F2] text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {fuel}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Filters Bar for Service Due Leads and others */
            <div className="p-3 bg-gray-50/60 border-b border-gray-200 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-gray-600 font-semibold text-[11px]">Workshop:</span>
                <div className="p-1 border border-gray-300 rounded bg-white text-xs font-medium text-gray-800">
                  {selectedWorkshop}
                </div>

                <select
                  value={serviceTypeFilter}
                  onChange={(e) => setServiceTypeFilter(e.target.value)}
                  className="p-1.5 border border-gray-300 rounded bg-white text-xs hover:border-gray-400 focus:outline-hidden focus:border-blue-500 font-medium text-gray-800 cursor-pointer shadow-2xs"
                  title="Filter leads by Service Type"
                >
                  <option value="Select Service Type">Select Service Type</option>
                  <option value="All Service Types">All Service Types</option>
                  <option value="Paid Service">Paid Service</option>
                  <option value="Free Service">Free Service</option>
                  <option value="Running Repair">Running Repair</option>
                </select>

                <select
                  value={opportunityTagFilter}
                  onChange={(e) => setOpportunityTagFilter(e.target.value)}
                  className="p-1.5 border border-gray-300 rounded bg-white text-xs hover:border-gray-400 focus:outline-hidden focus:border-blue-500 font-medium text-gray-800 cursor-pointer shadow-2xs"
                  title="Filter leads by Opportunity Tag"
                >
                  <option value="Opportunity Tag">Opportunity Tag</option>
                  <option value="All Opportunity Tags">All Opportunity Tags</option>
                  <option value="EW Expiring">EW Expiring</option>
                  <option value="Paid Service Due">Paid Service Due</option>
                  <option value="AMC Renewal">AMC Renewal</option>
                  <option value="Brake Pad Replacement">Brake Pad Replacement</option>
                  <option value="Wheel Alignment">Wheel Alignment</option>
                  <option value="Oil Change">Oil Change</option>
                  <option value="HV Battery Diagnostics">HV Battery Diagnostics</option>
                  <option value="2nd Free Service">2nd Free Service</option>
                </select>

                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="p-1.5 border border-gray-300 rounded bg-white text-xs hover:border-gray-400 focus:outline-hidden focus:border-blue-500 font-medium text-gray-800 cursor-pointer shadow-2xs"
                  title="Filter leads by Telecaller Assignee"
                >
                  <option value="Assignee">Assignee</option>
                  <option value="All Assignees">All Assignees</option>
                  <option value="Unassigned">Unassigned Leads</option>
                  <option value="PRASAD BHAGWATI">PRASAD BHAGWATI</option>
                  <option value="SUBHASH VIRMANI">SUBHASH VIRMANI</option>
                  <option value="LALIT KHURANA">LALIT KHURANA</option>
                  <option value="POORAN CHAND">POORAN CHAND</option>
                  <option value="YATIN SARKAR">YATIN SARKAR</option>
                </select>

                <div className="flex items-center gap-1.5 ml-auto">
                  <input
                    type="text"
                    placeholder="Search by name, phone, reg..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="p-1.5 border border-gray-300 rounded bg-white text-xs w-48 focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    onClick={() => {}}
                    className="px-3 py-1.5 bg-[#0052cc] hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-2xs cursor-pointer"
                  >
                    Search
                  </button>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setServiceTypeFilter('Select Service Type');
                      setOpportunityTagFilter('Opportunity Tag');
                      setAssigneeFilter('Assignee');
                      setPowertrainFilter('All');
                      setAgingFilter('All');
                    }}
                    className="px-2.5 py-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-600 text-xs font-medium cursor-pointer"
                    title="Reset all filters and search"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Action Bar with Bulk Assign, Powertrain, and Aging Filter Pills (Page 1) */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-0.5">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-gray-500 font-mono">
                    Showing 1 to {visibleLeads.length} of {visibleLeads.length} entries (Position: {currentPosition})
                  </span>
                  <button
                    disabled={isReadOnly}
                    onClick={() => setShowBulkAssignModal(true)}
                    className="px-3 py-1 bg-[#0052cc] hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    title={isReadOnly ? 'Read-only in TML Position View (toggle unlock above to test)' : ''}
                  >
                    Bulk Assign
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Powertrain: All | PV | EV */}
                  <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white text-[11px]">
                    {['All', 'PV', 'EV'].map((fuel) => (
                      <button
                        key={fuel}
                        onClick={() => setPowertrainFilter(fuel as any)}
                        className={`px-2 py-0.5 ${
                          powertrainFilter === fuel ? 'bg-blue-600 text-white font-bold' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {fuel}
                      </button>
                    ))}
                  </div>

                  {/* Aging Pills: -30 Days | 0-6 Days | 7-14 Days | 15-30 Days */}
                  <div className="flex items-center gap-1 text-[11px]">
                    {['-30 Days', '0-6 Days', '7-14 Days', '15-30 Days'].map((pill) => (
                      <button
                        key={pill}
                        onClick={() => setAgingFilter(agingFilter === pill ? 'All' : pill)}
                        className={`px-2 py-0.5 rounded border font-mono ${
                          agingFilter === pill
                            ? 'bg-gray-800 text-white border-gray-800 font-semibold'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Table (Page 1) - Adaptive for each Tab Category */}
          <div className="overflow-x-auto">
            {visibleLeads.length === 0 ? (
              <div className="py-12 px-4 text-center bg-white">
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-gray-800 mb-1">
                  No records in {activeTab}
                </h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto mb-3">
                  There are currently no records in the <span className="font-semibold text-gray-700">{activeTab}</span> queue for {selectedWorkshop} under the {currentPosition} position scope.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setAgingFilter('All');
                      setPowertrainFilter('All');
                    }}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-2xs"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => setActiveTab('Service Due Leads')}
                    className="px-3 py-1 bg-[#0052cc] hover:bg-blue-700 rounded text-xs font-semibold text-white shadow-2xs"
                  >
                    View Service Due Leads
                  </button>
                </div>
              </div>
            ) : activeTab === 'Closed/Inactive' ? (
              /* Specific Table for Closed / Inactive Leads */
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 text-[11px] font-semibold">
                    <th className="p-2.5 w-7 text-center">
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.length === visibleLeads.length && visibleLeads.length > 0}
                        onChange={() => {
                          if (selectedLeadIds.length === visibleLeads.length) {
                            setSelectedLeadIds([]);
                          } else {
                            setSelectedLeadIds(visibleLeads.map((l) => l.id));
                          }
                        }}
                        className="rounded text-blue-600"
                      />
                    </th>
                    <th className="p-2.5">Customer Name</th>
                    <th className="p-2.5 font-mono">Mobile No.</th>
                    <th className="p-2.5 font-mono">Reg No.</th>
                    <th className="p-2.5">Vehicle Model</th>
                    <th className="p-2.5">Service Type</th>
                    <th className="p-2.5">Closure Reason</th>
                    <th className="p-2.5 font-mono">Closed Date</th>
                    <th className="p-2.5">Last Call Outcome</th>
                    <th className="p-2.5">Workshop Division</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleLeads.map((lead) => {
                    const isChecked = selectedLeadIds.includes(lead.id);
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => {
                          setActiveCustomer(lead);
                          onScreenChange('customer360');
                        }}
                        className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                          isChecked ? 'bg-yellow-50/30' : ''
                        }`}
                      >
                        <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedLeadIds((prev) =>
                                prev.includes(lead.id) ? prev.filter((id) => id !== lead.id) : [...prev, lead.id]
                              );
                            }}
                            className="rounded text-blue-600"
                          />
                        </td>
                        <td className="p-2.5 font-bold text-gray-900">{lead.customerName}</td>
                        <td className="p-2.5 font-mono text-gray-600">{lead.mobileNo}</td>
                        <td className="p-2.5 font-mono font-semibold text-blue-700">{lead.regNo}</td>
                        <td className="p-2.5 font-medium text-gray-800">{lead.pl}</td>
                        <td className="p-2.5 text-gray-600">{lead.serviceType}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            {lead.closureReason || 'Customer Opt-Out'}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-gray-500">{lead.closedDate || '18-09-2026'}</td>
                        <td className="p-2.5 font-medium text-gray-700">{lead.callOutcome}</td>
                        <td className="p-2.5 text-[11px] text-gray-600">
                          {lead.workshopCode}-Sv&amp;Pa-Kandivali-Wasan
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-200 text-gray-700 uppercase">
                            Inactive
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : activeTab === 'PSF Leads' ? (
              /* Specific Table for PSF (Post Service Feedback) Leads */
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 text-[11px] font-semibold">
                    <th className="p-2.5 w-7 text-center">
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.length === visibleLeads.length && visibleLeads.length > 0}
                        onChange={() => {
                          if (selectedLeadIds.length === visibleLeads.length) {
                            setSelectedLeadIds([]);
                          } else {
                            setSelectedLeadIds(visibleLeads.map((l) => l.id));
                          }
                        }}
                        className="rounded text-blue-600"
                      />
                    </th>
                    <th className="p-2.5">Customer Name</th>
                    <th className="p-2.5 font-mono">Mobile No.</th>
                    <th className="p-2.5 font-mono">Reg No.</th>
                    <th className="p-2.5">Vehicle Model</th>
                    <th className="p-2.5">PSF Rating</th>
                    <th className="p-2.5">Customer Feedback / Issues</th>
                    <th className="p-2.5 font-mono">Service Date</th>
                    <th className="p-2.5">Call Status</th>
                    <th className="p-2.5">Workshop Division</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleLeads.map((lead) => {
                    const isChecked = selectedLeadIds.includes(lead.id);
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => {
                          setActiveCustomer(lead);
                          onScreenChange('customer360');
                        }}
                        className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                          isChecked ? 'bg-yellow-50/30' : ''
                        }`}
                      >
                        <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedLeadIds((prev) =>
                                prev.includes(lead.id) ? prev.filter((id) => id !== lead.id) : [...prev, lead.id]
                              );
                            }}
                            className="rounded text-blue-600"
                          />
                        </td>
                        <td className="p-2.5 font-bold text-gray-900">{lead.customerName}</td>
                        <td className="p-2.5 font-mono text-gray-600">{lead.mobileNo}</td>
                        <td className="p-2.5 font-mono font-semibold text-blue-700">{lead.regNo}</td>
                        <td className="p-2.5 font-medium text-gray-800">{lead.pl}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            (lead.psfRating || 3) <= 2
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            ⭐ {lead.psfRating || 3} / 5
                          </span>
                        </td>
                        <td className="p-2.5 font-medium text-gray-700">{lead.opportunityTags}</td>
                        <td className="p-2.5 font-mono text-gray-600">{lead.dueDate}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {lead.callStatus}
                          </span>
                        </td>
                        <td className="p-2.5 text-[11px] text-gray-600">
                          {lead.workshopCode}-Sv&amp;Pa-Kandivali-Wasan
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : activeTab === 'Product Leads' ? (
              /* Specific Table for Product Leads Matching Dealer View Screenshot (image_a0618c8f.png) */
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 border-b border-gray-200 text-[11px] font-bold">
                    <th className="p-3 w-8 text-center">
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.length === visibleLeads.length && visibleLeads.length > 0}
                        onChange={() => {
                          if (selectedLeadIds.length === visibleLeads.length) {
                            setSelectedLeadIds([]);
                          } else {
                            setSelectedLeadIds(visibleLeads.map((l) => l.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="p-3">Customer Name</th>
                    <th className="p-3 font-mono">Mobile No.</th>
                    <th className="p-3 text-center">Customer Severity</th>
                    <th className="p-3 font-mono">Reg No.</th>
                    <th className="p-3">PPL</th>
                    <th className="p-3">PL</th>
                    <th className="p-3 text-center">Opportunity Count</th>
                    <th className="p-3 text-center w-14">EW</th>
                    <th className="p-3 text-center w-14">AMC</th>
                    <th className="p-3 text-center w-14">RSA</th>
                    <th className="p-3 text-center w-14">TMI</th>
                    {productAssignmentTab === 'assigned' && (
                      <>
                        <th className="p-3">Assigned Telecaller</th>
                        <th className="p-3 font-mono">Assign Time</th>
                        <th className="p-3 text-right">Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleLeads.map((lead) => {
                    const isChecked = selectedLeadIds.includes(lead.id);
                    const opps = lead.productOpportunities || { ew: false, amc: false, rsa: true, tmi: false };
                    const oppCountFormatted = String(lead.opportunityCount || (opps.rsa && opps.tmi ? 2 : 1)).padStart(2, '0');

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => {
                          setActiveCustomer(lead);
                          onScreenChange('customer360');
                        }}
                        className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                          isChecked ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedLeadIds((prev) =>
                                prev.includes(lead.id) ? prev.filter((id) => id !== lead.id) : [...prev, lead.id]
                              );
                            }}
                            className="rounded border-gray-300 text-blue-600 cursor-pointer"
                          />
                        </td>
                        <td className="p-3 font-bold text-gray-900 uppercase">{lead.customerName}</td>
                        <td className="p-3 font-mono text-gray-600">{lead.mobileNo}</td>
                        <td className="p-3 text-center text-gray-400">-</td>
                        <td className="p-3 font-mono font-semibold text-gray-800">{lead.regNo}</td>
                        <td className="p-3 font-medium text-gray-900">{lead.ppl}</td>
                        <td className="p-3 text-[11px] text-gray-700">{lead.pl}</td>
                        <td className="p-3 text-center font-mono font-semibold text-gray-800">
                          {oppCountFormatted}
                        </td>
                        {/* EW Indicator */}
                        <td className="p-3 text-center">
                          {opps.ew ? (
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-emerald-500 bg-white text-emerald-600">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="inline-block w-3.5 h-3.5 rounded-full border border-gray-300 bg-white"></span>
                          )}
                        </td>
                        {/* AMC Indicator */}
                        <td className="p-3 text-center">
                          {opps.amc ? (
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-emerald-500 bg-white text-emerald-600">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="inline-block w-3.5 h-3.5 rounded-full border border-gray-300 bg-white"></span>
                          )}
                        </td>
                        {/* RSA Indicator */}
                        <td className="p-3 text-center">
                          {opps.rsa ? (
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-emerald-500 bg-white text-emerald-600">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="inline-block w-3.5 h-3.5 rounded-full border border-gray-300 bg-white"></span>
                          )}
                        </td>
                        {/* TMI Indicator */}
                        <td className="p-3 text-center">
                          {opps.tmi ? (
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-emerald-500 bg-white text-emerald-600">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="inline-block w-3.5 h-3.5 rounded-full border border-gray-300 bg-white"></span>
                          )}
                        </td>
                        {productAssignmentTab === 'assigned' && (
                          <>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {lead.assignedTelecallerName || 'PRASAD BHAGWATI'}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-[11px] text-gray-500">
                              {lead.assignDateTime || '19-10-2026 3:31 PM'}
                            </td>
                            <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <button
                                disabled={isReadOnly}
                                onClick={() => {
                                  setSelectedLeadIds([lead.id]);
                                  setShowAssignModal(true);
                                }}
                                className="px-2 py-1 bg-white hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 border border-gray-300 rounded text-[11px] font-medium text-gray-700 cursor-pointer shadow-2xs"
                              >
                                Reassign
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              /* Default Table for Service Due Leads and others matching Page 1 & 7 */
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 text-[11px] font-semibold">
                    <th className="p-2.5 w-7 text-center">
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.length === visibleLeads.length && visibleLeads.length > 0}
                        onChange={() => {
                          if (selectedLeadIds.length === visibleLeads.length) {
                            setSelectedLeadIds([]);
                          } else {
                            setSelectedLeadIds(visibleLeads.map((l) => l.id));
                          }
                        }}
                        className="rounded text-blue-600"
                      />
                    </th>
                    <th className="p-2.5">Customer Name</th>
                    <th className="p-2.5 font-mono">Mobile No.</th>
                    <th className="p-2.5">Customer Severity</th>
                    <th className="p-2.5 font-mono">Due Date ⇕</th>
                    <th className="p-2.5 font-mono">Days Left ⇕</th>
                    <th className="p-2.5">PPL</th>
                    <th className="p-2.5 font-mono">Reg No.</th>
                    <th className="p-2.5">Customer Type</th>
                    <th className="p-2.5">PL</th>
                    <th className="p-2.5">Service Type</th>
                    <th className="p-2.5">Opportunity Tags</th>
                    <th className="p-2.5">Workshop Division</th>
                    <th className="p-2.5">Usage Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleLeads.map((lead) => {
                    const isChecked = selectedLeadIds.includes(lead.id);
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => {
                          setActiveCustomer(lead);
                          onScreenChange('customer360');
                        }}
                        className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                          isChecked ? 'bg-yellow-50/30' : ''
                        }`}
                      >
                        <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedLeadIds((prev) =>
                                prev.includes(lead.id) ? prev.filter((id) => id !== lead.id) : [...prev, lead.id]
                              );
                            }}
                            className="rounded text-blue-600"
                          />
                        </td>
                        <td className="p-2.5 font-bold text-gray-900">{lead.customerName}</td>
                        <td className="p-2.5 font-mono text-gray-600">{lead.mobileNo}</td>
                        <td className="p-2.5 text-gray-400">{lead.customerSeverity || '-'}</td>
                        <td className="p-2.5 font-mono text-gray-700">{lead.dueDate}</td>
                        <td className="p-2.5 font-mono font-bold text-red-600">{lead.daysLeft} Days</td>
                        <td className="p-2.5 font-medium text-gray-900">{lead.ppl}</td>
                        <td className="p-2.5 font-mono font-semibold text-blue-700">{lead.regNo}</td>
                        <td className="p-2.5 text-gray-600">{lead.customerType}</td>
                        <td className="p-2.5 font-mono text-[11px] text-gray-700">{lead.pl}</td>
                        <td className="p-2.5">{lead.serviceType}</td>
                        <td className="p-2.5 text-gray-600">{lead.opportunityTags || '-'}</td>
                        <td className="p-2.5 text-[11px] text-gray-600">
                          {lead.workshopCode}-Sv&amp;Pa-Kandivali-Wasan View all
                        </td>
                        <td className="p-2.5 font-semibold text-gray-700">{lead.usageType}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Bottom Pagination Strip matching dealer application screenshot (image_a0618c8f.png) */}
          <div className="border-t border-gray-200 px-4 py-2.5 bg-white flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600 select-none">
            <div className="text-[11px] text-gray-500">
              {activeTab === 'Product Leads'
                ? `Showing 1 to ${visibleLeads.length} of ${productAssignmentTab === 'unassigned' ? 295 : 2} entries`
                : `Showing 1 to ${visibleLeads.length} of ${visibleLeads.length} entries`}
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              <button
                disabled
                className="px-2.5 py-1 border border-gray-200 rounded text-gray-400 bg-gray-50/50 cursor-not-allowed text-[11px]"
              >
                Previous
              </button>
              <button className="w-6 h-6 rounded bg-[#1877F2] text-white font-bold flex items-center justify-center cursor-pointer shadow-2xs text-[11px]">
                1
              </button>
              {activeTab === 'Product Leads' && productAssignmentTab === 'unassigned' && (
                <>
                  <button className="w-6 h-6 rounded border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center cursor-pointer text-[11px]">
                    2
                  </button>
                  <button className="w-6 h-6 rounded border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center cursor-pointer text-[11px]">
                    3
                  </button>
                  <span className="px-1 text-gray-400">...</span>
                  <button className="w-6 h-6 rounded border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center cursor-pointer text-[11px]">
                    15
                  </button>
                </>
              )}
              <button className="px-2.5 py-1 border border-gray-200 rounded text-gray-700 hover:bg-gray-50 cursor-pointer text-[11px]">
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 2: TELECALLER PRASAD BHAGWATI WORKSPACE (PAGE 8)
         ========================================================================= */}
      {currentScreen === 'telecallerWorkspace' && (
        <div className="bg-white border border-gray-200 rounded shadow-xs overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-gray-800">
              <ChevronLeft className="w-4 h-4 text-gray-400 cursor-pointer" onClick={() => onScreenChange('serviceDueList')} />
              <span>Calling List : Service Due Leads</span>
            </div>
            <span className="font-mono text-gray-500">
              Login as Telecaller Prasad (PPB_3004450) · {isReadOnly ? 'Read-Only Mode' : 'Simulation'}
            </span>
          </div>

          {/* Counts Strip (Page 8) */}
          <div className="p-3 border-b border-gray-100 bg-gray-50/70 flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-white px-2.5 py-1 rounded border border-gray-200 font-medium">
              Service Due Leads: <span className="font-bold font-mono text-blue-700">2 Total Assigned</span>
            </div>
            <div className="bg-white px-2.5 py-1 rounded border border-gray-200">
              Appt. Reminder: <span className="font-bold font-mono text-amber-700">0 Follow up</span>
            </div>
            <div className="bg-white px-2.5 py-1 rounded border border-gray-200">
              PSF Leads: <span className="font-bold font-mono text-gray-700">1 Not Contacted</span>
            </div>
            <div className="bg-white px-2.5 py-1 rounded border border-gray-200">
              Product Leads: <span className="font-bold font-mono text-gray-700">0 Contacted</span>
            </div>
            <div className="ml-auto text-[11px] text-gray-500 flex items-center gap-3">
              <span>0 Appt. Booked/Scheduled</span>
              <span>0 Not Interested</span>
            </div>
          </div>

          {/* Calling Table */}
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-semibold text-[11px]">
                  <th className="pb-2">Customer Name</th>
                  <th className="pb-2">Mobile No.</th>
                  <th className="pb-2">Reg No.</th>
                  <th className="pb-2">Usage</th>
                  <th className="pb-2">PPL</th>
                  <th className="pb-2">PL</th>
                  <th className="pb-2">Service Type</th>
                  <th className="pb-2 font-mono">Due Date ⇕</th>
                  <th className="pb-2 font-mono">Assign Date &amp; Time ⇕</th>
                  <th className="pb-2">Call Status</th>
                  <th className="pb-2">Call Outcome</th>
                  <th className="pb-2 font-mono">Days Left</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-yellow-50/30">
                  <td className="py-2.5 font-bold text-gray-900">SUDIPT CHATTERJEE</td>
                  <td className="py-2.5 font-mono">9892224832</td>
                  <td className="py-2.5 font-mono font-bold text-blue-700">MH01BB2826</td>
                  <td className="py-2.5">PV</td>
                  <td className="py-2.5">Altroz</td>
                  <td className="py-2.5 font-mono text-[11px]">Altroz XE 1.2 P</td>
                  <td className="py-2.5">Paid Service</td>
                  <td className="py-2.5 font-mono">22-09-2026</td>
                  <td className="py-2.5 font-mono text-[11px] text-gray-600">19-10-2026 3:31 PM</td>
                  <td className="py-2.5">
                    <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium">
                      Attempted
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium">
                      Busy
                    </span>
                  </td>
                  <td className="py-2.5 font-mono font-bold text-red-600">-27 Days</td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => {
                        setActiveCustomer(leads[0]);
                        onScreenChange('customer360');
                      }}
                      className="px-2.5 py-1 bg-[#0052cc] hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-2xs"
                    >
                      Customer 360 &rarr;
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 3: CUSTOMER 360 VIEW (PAGES 9, 10, 11, 12, 13, 14, 18)
         ========================================================================= */}
      {currentScreen === 'customer360' && (
        <div className="space-y-3">
          {/* Top Line (Page 9) */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onScreenChange('serviceDueList')}
                className="hover:underline flex items-center gap-1 font-medium text-gray-700"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>LAST PAGE</span>
              </button>
              <span>|</span>
              <span className="font-bold text-gray-800">CUSTOMER 360</span>
            </div>

            {isReadOnly && (
              <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-medium">
                TML Position View: Fields are in readable/read-only mode
              </span>
            )}
          </div>

          {/* Customer Top Bar (Page 9) */}
          <div className="bg-white border border-gray-200 rounded p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#0052cc] text-white flex items-center justify-center font-bold text-xs font-mono">
                SC
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-xs">
                    {activeCustomer.customerName}
                  </span>
                  <span className="text-[11px] text-gray-500 font-mono">
                    (Customer ID: 1000140810)
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="font-mono text-gray-700 font-semibold">{activeCustomer.mobileNo}</span>
                  <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-medium">
                    H NO-381 BABU JAGJIVAN RAM NAGAR, DUMPING ROAD, MULUND WEST, MUMBAI, MH, 400604
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={isReadOnly}
                onClick={() => setIsCalling(!isCalling)}
                className={`px-3 py-1.5 rounded font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors ${
                  isCalling
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-500 text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{isCalling ? 'Call in Progress (00:01:14)' : 'Call'}</span>
              </button>
            </div>
          </div>

          {/* Main Content: Main Vehicle Info (65%) and Right Telecaller Panel (35%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Left 65% area */}
            <div className="lg:col-span-8 space-y-3">
              {/* Scheduled Jobs, Deferred Jobs, Open Updation Campaign */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white border border-gray-200 rounded p-2.5">
                  <span className="font-bold text-gray-700 block text-[11px] mb-1">SCHEDULED JOBS</span>
                  <span className="text-gray-400 italic text-[11px]">-</span>
                </div>
                <div className="bg-white border border-gray-200 rounded p-2.5">
                  <span className="font-bold text-gray-700 block text-[11px] mb-1">DEFERRED JOBS</span>
                  <span className="text-gray-400 italic text-[11px]">-</span>
                </div>
                <div className="bg-white border border-gray-200 rounded p-2.5">
                  <span className="font-bold text-gray-700 block text-[11px] mb-1">OPEN UPDATION CAMPAIGN</span>
                  <span className="font-bold font-mono text-gray-900 text-xs">00</span>
                </div>
              </div>

              {/* Vehicle & Last Service Details (Page 9) */}
              <div className="bg-white border border-gray-200 rounded p-3 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                  <span className="font-bold text-xs text-gray-800">
                    Altroz XE 1.2 P | JET SILVER | {activeCustomer.regNo}
                  </span>
                  <span className="text-[10px] bg-red-100 text-red-800 font-semibold px-1.5 py-0.2 rounded">
                    Warranty Expired
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-[10px] text-gray-500 block">Last Service Date</span>
                    <span className="font-mono font-bold text-gray-800">18 Jul 2019</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-[10px] text-gray-500 block">Odometer</span>
                    <span className="font-mono font-bold text-gray-800">9,243 km</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-[10px] text-gray-500 block">Due Date</span>
                    <span className="font-mono font-bold text-red-600">22 Sep 2026</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-[10px] text-gray-500 block">Estimated KM</span>
                    <span className="font-mono font-bold text-gray-800">19,528 km</span>
                  </div>
                </div>

                <div className="text-[11px] text-gray-600 border-t border-gray-100 pt-2 flex justify-between">
                  <span>Last Workshop: PRAGATI SERVICE STATION AND AUTO PARTS - NASHIK</span>
                  <span className="font-semibold text-gray-800">Current: WASAN MOTORS LTD</span>
                </div>
              </div>

              {/* Service History Grid (Page 9) */}
              <div className="bg-white border border-gray-200 rounded p-3 shadow-2xs space-y-2">
                <span className="font-bold text-xs text-gray-800 uppercase tracking-tight block">
                  SERVICE HISTORY
                </span>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-600">
                  <div className="p-2 border border-gray-100 rounded bg-gray-50/50">
                    <div className="font-bold text-gray-800">Campaign 1</div>
                    <div className="text-gray-400">1st Free Service · 1,200 km</div>
                  </div>
                  <div className="p-2 border border-gray-100 rounded bg-gray-50/50">
                    <div className="font-bold text-gray-800">Campaign 2</div>
                    <div className="text-gray-400">2nd Free Service · 5,400 km</div>
                  </div>
                  <div className="p-2 border border-gray-100 rounded bg-gray-50/50">
                    <div className="font-bold text-gray-800">Campaign 3</div>
                    <div className="text-gray-400">Periodic Svc · 9,243 km</div>
                  </div>
                </div>
              </div>

              {/* Eligible Product Leads (Page 9) */}
              <div className="bg-white border border-gray-200 rounded p-3 shadow-2xs space-y-2">
                <span className="font-bold text-xs text-gray-800 uppercase tracking-tight block">
                  ELIGIBLE PRODUCT LEADS
                </span>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Extd. Warranty Card */}
                  <div className="border border-gray-200 rounded p-2.5 bg-white space-y-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-800">Extd. Warranty</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded font-semibold">
                        Active
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 font-mono space-y-0.5">
                      <div>START DATE: 23 Oct 2023</div>
                      <div className="text-red-600 font-bold">END DATE: 24 Oct 2026 (5 Days)</div>
                      <div>KMS RANGE: 75000-150000 km</div>
                    </div>
                    <div className="pt-1">
                      <button className="px-2 py-0.5 bg-[#0052cc] text-white rounded text-[10px] font-semibold">
                        View EW Plan &gt;
                      </button>
                    </div>
                  </div>

                  {/* TMI Insurance Card */}
                  <div className="border border-gray-200 rounded p-2.5 bg-white space-y-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-800">TMI Insurance</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded font-semibold">
                        Active
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 font-mono space-y-0.5">
                      <div>POLICY NO: 800000323345578</div>
                      <div>PREMIUM: ₹22,011</div>
                      <div>END DATE: 04 Nov 2026</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 35% Panel: Telecaller Script & Call Disposition (Pages 9, 10, 11, 12, 13) */}
            <div className="lg:col-span-4 space-y-3">
              {/* Telecaller Script Box (Page 9, 10) */}
              <div className="bg-white border border-gray-200 rounded p-3 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs border-b border-gray-100 pb-1">
                  <span className="font-bold text-gray-800">Telecaller</span>
                  <span className="font-mono text-gray-400 text-[11px]">00:00:00</span>
                </div>

                {/* Script Tabs */}
                <div className="flex items-center gap-1 text-[11px] border-b border-gray-100 pb-1.5 overflow-x-auto">
                  {['svc', 'ew', 'amc', 'rsa'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setActiveScriptTab(s as any)}
                      className={`px-1.5 py-0.5 rounded font-medium ${
                        activeScriptTab === s
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {s.toUpperCase()} Script
                    </button>
                  ))}
                </div>

                <div className="p-2 bg-gray-50 rounded text-gray-700 italic text-[11px] leading-relaxed">
                  &ldquo;Good afternoon Mr. SUDIPT CHATTERJEE. I am calling from WASAN MOTORS LTD regarding your Tata Altroz. As per our records, your vehicle&apos;s periodic service is due on 22 Sep 2026...&rdquo;
                </div>
              </div>

              {/* Call Disposition (Pages 10, 11, 12, 13) */}
              <div className="bg-white border border-gray-200 rounded p-3 shadow-2xs space-y-2">
                <span className="font-bold text-xs text-gray-800 uppercase tracking-tight block border-b border-gray-100 pb-1">
                  Call Disposition
                </span>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">
                      Status
                    </label>
                    {isReadOnly ? (
                      <div className="p-1.5 bg-gray-100 border border-gray-200 rounded font-semibold text-gray-800 text-xs">
                        {callDispositionStatus}
                      </div>
                    ) : (
                      <select
                        value={callDispositionStatus}
                        onChange={(e) => setCallDispositionStatus(e.target.value)}
                        className="w-full p-1.5 border border-gray-300 rounded bg-white text-xs"
                      >
                        <option value="Call Back">Call Back</option>
                        <option value="Customer Busy">Customer Busy</option>
                        <option value="Appt. Booked">Appt. Booked</option>
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">
                      Sub Status
                    </label>
                    {isReadOnly ? (
                      <div className="p-1.5 bg-gray-100 border border-gray-200 rounded text-gray-700 text-xs">
                        {callSubStatus}
                      </div>
                    ) : (
                      <select
                        value={callSubStatus}
                        onChange={(e) => setCallSubStatus(e.target.value)}
                        className="w-full p-1.5 border border-gray-300 rounded bg-white text-xs"
                      >
                        <option value="Call Back">Call Back</option>
                        <option value="Customer Busy">Customer Busy</option>
                      </select>
                    )}
                  </div>

                  {/* Follow Up Date with validation (Page 12) */}
                  <div className="pt-1">
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 mb-1">
                      <input
                        type="checkbox"
                        checked={isFollowUpChecked}
                        disabled={isReadOnly}
                        onChange={(e) => setIsFollowUpChecked(e.target.checked)}
                      />
                      <span>Set a Follow Up Date &amp; Time for Call Back</span>
                    </label>
                    {isFollowUpChecked && (
                      <div>
                        {isReadOnly ? (
                          <div className="p-1 bg-gray-100 border border-gray-200 rounded font-mono text-gray-800 text-xs">
                            {followUpDateInput.replace('T', ' ')}
                          </div>
                        ) : (
                          <input
                            type="datetime-local"
                            value={followUpDateInput}
                            onChange={(e) => handleFollowUpChange(e.target.value)}
                            className="w-full p-1 border border-gray-300 rounded text-xs font-mono"
                          />
                        )}
                        {followUpError && (
                          <p className="text-[11px] text-red-600 font-bold mt-1">
                            x {followUpError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">
                      Voice of Customer
                    </label>
                    {isReadOnly ? (
                      <div className="p-1.5 bg-gray-100 border border-gray-200 rounded text-gray-800 text-xs">
                        {vocText}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={vocText}
                        onChange={(e) => setVocText(e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded text-xs"
                      />
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">
                      Remark
                    </label>
                    {isReadOnly ? (
                      <div className="p-1.5 bg-gray-100 border border-gray-200 rounded text-gray-800 text-xs">
                        {remarkText}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={remarkText}
                        onChange={(e) => setRemarkText(e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded text-xs"
                      />
                    )}
                  </div>

                  <div className="pt-1 border-t border-gray-100">
                    <span className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Product Lead Disposition
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={productLeadDispo.ew}
                          disabled={isReadOnly}
                          onChange={(e) => setProductLeadDispo({ ...productLeadDispo, ew: e.target.checked })}
                        />
                        <span>EW</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={productLeadDispo.amc}
                          disabled={isReadOnly}
                          onChange={(e) => setProductLeadDispo({ ...productLeadDispo, amc: e.target.checked })}
                        />
                        <span>AMC</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={productLeadDispo.tmi}
                          disabled={isReadOnly}
                          onChange={(e) => setProductLeadDispo({ ...productLeadDispo, tmi: e.target.checked })}
                        />
                        <span>TMI Insurance</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                  <button
                    onClick={() => setShowSlotModal(true)}
                    className="w-full py-1.5 bg-[#0052cc] hover:bg-blue-700 text-white font-semibold rounded text-xs shadow-2xs"
                  >
                    View Slots &amp; Book Appointment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 4: APPOINTMENT REMINDER LIST & RESCHEDULING (PAGES 19, 20, 21, 22)
         ========================================================================= */}
      {currentScreen === 'apptReminderList' && (
        <div className="bg-white border border-gray-200 rounded shadow-xs overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-800">
              Appointment Reminder View – Total Appointment Booked
            </span>
            <span className="font-mono text-gray-500">1 Total Appt. Booked · 1 Reminder · 0 No Show</span>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-semibold text-[11px]">
                  <th className="pb-2">Customer Name</th>
                  <th className="pb-2 font-mono">Mobile No.</th>
                  <th className="pb-2 font-mono">Reg No.</th>
                  <th className="pb-2 font-mono">PL</th>
                  <th className="pb-2">Service Type</th>
                  <th className="pb-2 font-mono">Service Due Date ⇕</th>
                  <th className="pb-2 font-mono">Appt. Date &amp; Time ⇕</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookedAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-yellow-50/20">
                    <td className="py-2.5 font-bold text-gray-900">{appt.customerName}</td>
                    <td className="py-2.5 font-mono">{appt.mobileNo}</td>
                    <td className="py-2.5 font-mono font-bold text-blue-700">{appt.regNo}</td>
                    <td className="py-2.5 font-mono text-[11px]">{appt.vehicleModel}</td>
                    <td className="py-2.5">{appt.serviceType}</td>
                    <td className="py-2.5 font-mono">22-09-2026</td>
                    <td className="py-2.5 font-mono bg-yellow-100 px-2 py-0.5 rounded font-bold text-yellow-900">
                      {appt.date} {appt.timeSlot}
                    </td>
                    <td className="py-2.5">
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                        {appt.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => {
                          setRescheduleLead(appt);
                          setIsRescheduleMode(true);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                      >
                        Reschedule Appt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: BULK ASSIGN LEADS (PAGES 4 & 5)
         ========================================================================= */}
      {showBulkAssignModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded max-w-sm w-full p-4 shadow-xl border border-gray-200 space-y-3">
            <h3 className="font-bold text-sm text-gray-900">Bulk Assign Leads</h3>
            <p className="text-xs text-gray-500">Choose how many leads you want to assign</p>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="bulkType"
                  checked={bulkOption === 'all'}
                  onChange={() => setBulkOption('all')}
                  className="text-blue-600"
                />
                <span>Select All</span>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="bulkType"
                    checked={bulkOption === 'custom'}
                    onChange={() => setBulkOption('custom')}
                    className="text-blue-600"
                  />
                  <span>Custom Select</span>
                </div>
                <input
                  type="number"
                  min={1}
                  max={unassignedCount}
                  value={customCount}
                  onChange={(e) => setCustomCount(parseInt(e.target.value) || 1)}
                  className="w-14 p-1 border border-gray-300 rounded text-right font-mono text-xs"
                />
              </label>
              <div className="text-[10px] text-gray-400">
                Max available: {unassignedCount} leads in the Unassigned tab
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowBulkAssignModal(false)}
                className="px-3 py-1 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowBulkAssignModal(false);
                  setShowAssignModal(true);
                }}
                className="px-4 py-1 bg-[#0052cc] hover:bg-blue-700 text-white text-xs font-semibold rounded shadow-2xs"
              >
                Assign Telecaller
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ASSIGN TELECALLER (PAGES 2 & 6 SCREENSHOTS)
         ========================================================================= */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded max-w-2xl w-full p-4 shadow-xl border border-gray-200 space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="font-bold text-sm text-gray-900">Assign Telecaller</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-1 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAssignment}
                  className="px-4 py-1 bg-[#0052cc] hover:bg-blue-700 text-white text-xs font-semibold rounded shadow-2xs"
                >
                  Assign
                </button>
              </div>
            </div>

            {/* Inputs & Stats Row (Page 2, 6) */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-gray-500 font-semibold block mb-0.5">Workshop*</label>
                <div className="p-1 border border-gray-300 rounded bg-gray-50 text-gray-800 text-xs font-medium">
                  {selectedWorkshop}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 font-semibold block mb-0.5">Search Telecaller*</label>
                <input
                  type="text"
                  placeholder="Enter Name"
                  className="w-full p-1 border border-gray-300 rounded text-xs"
                />
              </div>
            </div>

            {/* Stat Counters Row (Page 2) */}
            <div className="flex items-center justify-center gap-8 py-1.5 border-y border-gray-100 text-xs">
              <div className="text-center font-mono">
                <div className="text-gray-400 text-[10px]">Total Selected Leads</div>
                <div className="text-sm font-bold text-gray-800">
                  {bulkOption === 'all' ? selectedLeadIds.length : customCount}
                </div>
              </div>
              <div className="text-center font-mono">
                <div className="text-emerald-600 text-[10px]">Leads Distributed</div>
                <div className="text-sm font-bold text-emerald-700 flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{bulkOption === 'all' ? selectedLeadIds.length : customCount}</span>
                </div>
              </div>
              <div className="text-center font-mono">
                <div className="text-gray-400 text-[10px]">Unassigned Leads</div>
                <div className="text-sm font-bold text-gray-800">00</div>
              </div>
            </div>

            {/* Distribution Progress Bar */}
            <div>
              <div className="flex justify-between text-[11px] text-gray-500 mb-0.5">
                <span>Distribution Progress</span>
                <span className="font-bold font-mono text-emerald-700">100% Distributed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden flex">
                <div className="bg-blue-600 h-full w-[33%]" />
                <div className="bg-emerald-600 h-full w-[67%]" />
              </div>
            </div>

            {/* Telecaller Table (Page 6) */}
            <div className="border border-gray-200 rounded overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 text-[11px] font-semibold">
                    <th className="p-2">Name ⇕</th>
                    <th className="p-2">Workshop ⇕</th>
                    <th className="p-2 font-mono text-center">Skill ⇕</th>
                    <th className="p-2 font-mono text-center">Total Leads Active ⇕</th>
                    <th className="p-2 font-mono text-center">Fresh ⇕</th>
                    <th className="p-2 font-mono text-center">Not Contacted ⇕</th>
                    <th className="p-2 font-mono text-center">Follow ups ⇕</th>
                    <th className="p-2 font-mono text-center">Today&apos;s Follow ups ⇕</th>
                    <th className="p-2">Input By</th>
                    <th className="p-2 font-mono text-center">Weight% ⇕</th>
                    <th className="p-2 font-mono text-center font-bold">No of Leads ⇕</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {telecallers.map((tc) => {
                    const isPrasad = tc.name === 'PRASAD BHAGWATI';
                    const isSubhash = tc.name === 'SUBHASH VIRMANI';
                    const checked = isPrasad || isSubhash;
                    return (
                      <tr key={tc.id} className={checked ? 'bg-yellow-50/40' : ''}>
                        <td className="p-2 font-semibold text-gray-900 flex items-center gap-1.5">
                          <input type="checkbox" checked={checked} readOnly className="rounded text-blue-600" />
                          <span>{tc.name}</span>
                        </td>
                        <td className="p-2 text-gray-500 text-[10px]">{tc.workshopCode}</td>
                        <td className="p-2 text-center text-gray-500 text-[10px]">View all</td>
                        <td className="p-2 text-center font-mono">{tc.totalLeadsActive}</td>
                        <td className="p-2 text-center font-mono">{tc.fresh}</td>
                        <td className="p-2 text-center font-mono">{tc.notContacted}</td>
                        <td className="p-2 text-center font-mono">{tc.followUps}</td>
                        <td className="p-2 text-center font-mono">{tc.todaysFollowUps}</td>
                        <td className="p-2 text-center font-mono text-gray-500 text-[10px]">Weight%</td>
                        <td className="p-2 text-center font-mono font-bold">
                          {isPrasad ? '33%' : isSubhash ? '67%' : '0%'}
                        </td>
                        <td className="p-2 text-center font-mono font-bold text-blue-700">
                          {isPrasad ? '1' : isSubhash ? '2' : '0'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: SUCCESSFUL ASSIGNMENT DIALOG (PAGES 2 & 7)
         ========================================================================= */}
      {assignedSuccessDialog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded max-w-xs w-full p-5 text-center space-y-3 shadow-xl border border-gray-200">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <h3 className="font-bold text-sm text-gray-900">Successful</h3>
            <p className="text-xs text-gray-700 font-medium">{assignedSuccessDialog.count} leads assigned.</p>
            <div className="text-xs font-mono text-gray-600 space-y-0.5">
              {assignedSuccessDialog.lines.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
            <button
              onClick={() => setAssignedSuccessDialog(null)}
              className="w-full py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-xs font-semibold text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: SLOT AVAILABILITY (PAGES 14-17)
         ========================================================================= */}
      {showSlotModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded max-w-4xl w-full p-4 shadow-xl border border-gray-200 space-y-3 max-h-[92vh] overflow-y-auto">
            {/* Top Bar (Page 14) */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Slot Availability</h3>
                <span className="text-[11px] text-gray-500 font-mono">
                  Workshop: {selectedWorkshop}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 block">Preferred SA Name:</span>
                  <select
                    value={serviceAdvisor}
                    disabled={isReadOnly}
                    onChange={(e) => setServiceAdvisor(e.target.value)}
                    className="p-1 border border-gray-300 rounded text-xs font-semibold text-gray-800 bg-white disabled:bg-gray-100"
                  >
                    <option value="LALIT VISPUTE">LALIT VISPUTE</option>
                    <option value="RAMESH KALE">RAMESH KALE</option>
                  </select>
                </div>
                <div className="p-1.5 bg-yellow-100 border border-yellow-300 rounded text-right font-mono text-[10px] leading-tight">
                  <div className="text-gray-500">Selected Slot:</div>
                  <div className="font-bold text-yellow-900">{slotDate} | {slotTime}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left Column: Slot Matrix (7 Cols) */}
              <div className="md:col-span-7 space-y-2">
                <div className="flex items-center gap-3 text-[10px] text-gray-600">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Partial
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400" /> Full / Expired
                  </span>
                </div>

                {/* Days Headers */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {['Today', 'Tue 20 Oct', 'Wed 21 Oct', 'Thu 22 Oct', 'Fri 23 Oct', 'Sat 24 Oct', 'Sun 25 Oct'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setSlotDate(d)}
                      className={`p-1 rounded border text-[10px] font-medium ${
                        slotDate.includes(d.split(' ')[1] || '20')
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                {/* Times Grid */}
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {[
                    '09:00-09:30 AM',
                    '09:30-10:00 AM',
                    '10:00-10:30 AM',
                    '10:30-11:00 AM',
                    '11:00-11:30 AM',
                    '11:30 AM-12:00 PM',
                    '12:00-12:30 PM'
                  ].map((t) => {
                    const isSelected = slotTime === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setSlotTime(t)}
                        className={`p-1.5 rounded border text-left font-mono ${
                          isSelected
                            ? 'bg-yellow-100 border-yellow-500 text-yellow-900 font-bold'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-[11px] font-bold">{t}</div>
                        <div className="text-[9px] text-emerald-700">0/2 Available</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Pickup & Drop & Mulund West Google Map (5 Cols) */}
              <div className="md:col-span-5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">Pickup &amp; Drop</span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pickupDropSelection === 'pickup' || pickupDropSelection === 'both'}
                        disabled={isReadOnly}
                        onChange={() => setPickupDropSelection(pickupDropSelection === 'pickup' ? 'both' : 'pickup')}
                      />
                      <span>Pickup</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pickupDropSelection === 'drop' || pickupDropSelection === 'both'}
                        disabled={isReadOnly}
                        onChange={() => setPickupDropSelection(pickupDropSelection === 'drop' ? 'both' : 'drop')}
                      />
                      <span>Drop</span>
                    </label>
                  </div>
                </div>

                {/* Google Map Mockup Frame (Mulund West / Dumping Road) */}
                <div className="h-28 rounded border border-gray-200 bg-gray-100 relative overflow-hidden flex items-center justify-center p-2">
                  <div className="text-center">
                    <MapPin className="w-5 h-5 text-red-600 mx-auto" />
                    <span className="text-[10px] font-bold text-gray-800 bg-white/90 px-1.5 py-0.5 rounded shadow-xs mt-1 inline-block">
                      Dumping Rd, Mulund West, Mumbai
                    </span>
                  </div>
                  <span className="absolute bottom-1 right-2 text-[9px] text-gray-400 font-mono">
                    Google Maps
                  </span>
                </div>

                {/* Address Form (Page 15, 16) */}
                <div className="space-y-1.5">
                  <div>
                    <label className="text-[10px] text-gray-500 font-semibold block">Address Details 1 *</label>
                    <input
                      type="text"
                      value={addressLine1}
                      disabled={isReadOnly}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="w-full p-1 border border-gray-300 rounded text-xs bg-white disabled:bg-gray-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-500 font-semibold block">Address Details 2</label>
                      <input
                        type="text"
                        value={addressLine2}
                        disabled={isReadOnly}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded text-xs bg-white disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 font-semibold block">Pin Code *</label>
                      <input
                        type="text"
                        value={pinCode}
                        disabled={isReadOnly}
                        onChange={(e) => setPinCode(e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded text-xs font-mono bg-white disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowSlotModal(false)}
                className="px-3 py-1 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={isReadOnly}
                onClick={handleConfirmSlotBooking}
                className="px-4 py-1 bg-[#0052cc] hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white text-xs font-bold rounded shadow-2xs"
              >
                Book Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: APPOINTMENT BOOKED CONFIRMATION (PAGE 18)
         ========================================================================= */}
      {appointmentBookedConfirmation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded max-w-sm w-full p-5 text-center space-y-3 shadow-xl border border-gray-200">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>

            <h3 className="font-bold text-sm text-gray-900">Appointment Booked Successfully</h3>
            <p className="text-xs font-mono text-gray-500 flex items-center justify-center gap-1">
              <span>Appointment ID: {appointmentBookedConfirmation.id}</span>
              <Copy className="w-3 h-3 text-gray-400 cursor-pointer" />
            </p>

            {/* 6 Grid details matching Page 18 screenshot */}
            <div className="bg-gray-50 p-2.5 rounded text-left grid grid-cols-2 gap-2 text-xs border border-gray-200">
              <div>
                <span className="text-[10px] text-gray-500 block">CUSTOMER</span>
                <span className="font-bold text-gray-900">{appointmentBookedConfirmation.customerName}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">DATE</span>
                <span className="font-bold text-gray-900">{appointmentBookedConfirmation.date}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">WORKSHOP</span>
                <span className="text-[11px] text-gray-800">{appointmentBookedConfirmation.workshopName}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">VEHICLE</span>
                <span className="font-mono font-bold text-gray-900">{appointmentBookedConfirmation.regNo} | Altroz</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">TIME</span>
                <span className="font-mono font-bold text-blue-700">{appointmentBookedConfirmation.timeSlot}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">SERVICE ADVISOR</span>
                <span className="font-bold text-gray-900">{appointmentBookedConfirmation.serviceAdvisor}</span>
              </div>
            </div>

            <div className="text-[10px] text-gray-400 italic">
              Appointment confirmation and workshop location have been shared with the customer.
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setAppointmentBookedConfirmation(null);
                  onScreenChange('apptReminderList');
                }}
                className="flex-1 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                View Appointment
              </button>
              <button
                onClick={() => {
                  setAppointmentBookedConfirmation(null);
                  onScreenChange('serviceDueList');
                }}
                className="flex-1 py-1 bg-[#0052cc] hover:bg-blue-700 text-white rounded text-xs font-semibold"
              >
                Next Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: RESCHEDULE FLOW (PAGES 20-22)
         ========================================================================= */}
      {isRescheduleMode && rescheduleLead && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded max-w-md w-full p-4 shadow-xl border border-gray-200 space-y-3">
            <h3 className="font-bold text-sm text-gray-900">Reschedule Appointment</h3>

            {rescheduleError && (
              <div className="p-2 rounded bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-start gap-1">
                <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{rescheduleError}</span>
              </div>
            )}

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">
                  Voice of Customer
                </label>
                <select
                  value={rescheduleVoc}
                  disabled={isReadOnly}
                  onChange={(e) => setRescheduleVoc(e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded bg-white text-xs disabled:bg-gray-100"
                >
                  <option value="Low Mileage">Low Mileage</option>
                  <option value="Vehicle Out of Town">Vehicle Out of Town</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">
                  Reschedule Reason *
                </label>
                <select
                  value={rescheduleReason}
                  disabled={isReadOnly}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded bg-white text-xs disabled:bg-gray-100"
                >
                  <option value="Vehicle Unavailable">Vehicle Unavailable</option>
                  <option value="Driver Not Available">Driver Not Available</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">
                  Select New Slot
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    '11:00-11:30 AM',
                    '12:00-12:30 PM',
                    '14:00-14:30 PM',
                    '16:00-16:30 PM'
                  ].map((s) => (
                    <button
                      key={s}
                      disabled={isReadOnly}
                      onClick={() => setRescheduleNewSlot(s)}
                      className={`p-1.5 rounded border text-xs font-mono disabled:opacity-60 ${
                        rescheduleNewSlot === s
                          ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                          : 'bg-white border-gray-200 text-gray-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setIsRescheduleMode(false)}
                className="px-3 py-1 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={isReadOnly}
                onClick={handleConfirmReschedule}
                className="px-4 py-1 bg-[#0052cc] hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white text-xs font-semibold rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
