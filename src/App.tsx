import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AppointmentGovernance } from './components/AppointmentGovernance';
import {
  TMLPosition,
  AppScreen,
  ServiceLead,
  Telecaller,
  BookedAppointment
} from './types';
import {
  INITIAL_TELECALLERS,
  INITIAL_LEADS,
  INITIAL_BOOKED_APPOINTMENT
} from './data/mockData';

export default function App() {
  // Siebel TML Position & Hierarchy Session State
  const [currentPosition, setCurrentPosition] = useState<TMLPosition>(
    'RSM West'
  );
  const [selectedOrganization, setSelectedOrganization] = useState<string>(
    'Tata Motors Passenger Vehicles (TMPV)'
  );
  const [selectedDivision, setSelectedDivision] = useState<string>(
    'West Zone - Mumbai Area'
  );
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>(
    '3004450'
  );

  // Read-only state: default to true for TML positions, false for workshop users
  const [isReadOnly, setIsReadOnly] = useState<boolean>(true);

  // Active Appointment Sub-screen matching dealer application flow
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('productLeads');

  // Master Data Stores
  const [leads, setLeads] = useState<ServiceLead[]>(INITIAL_LEADS);
  const [telecallers, setTelecallers] = useState<Telecaller[]>(INITIAL_TELECALLERS);
  const [bookedAppointments, setBookedAppointments] = useState<BookedAppointment[]>([
    INITIAL_BOOKED_APPOINTMENT
  ]);

  // Handle Position Change (Siebel CRM behavior)
  const handlePositionChange = (newPos: TMLPosition) => {
    setCurrentPosition(newPos);
    if (newPos === 'Dealer Workshop SA / Telecaller') {
      setIsReadOnly(false);
      setSelectedDivision('West Zone - Mumbai Area');
      setSelectedWorkshop('3004450');
    } else if (newPos === 'ASM Mumbai') {
      setIsReadOnly(true);
      setSelectedDivision('West Zone - Mumbai Area');
      setSelectedWorkshop('3004450');
    } else if (newPos === 'RSM West') {
      setIsReadOnly(true);
      if (!selectedDivision.includes('West')) {
        setSelectedDivision('West Zone - Mumbai Area');
      }
    } else {
      // National Service Head
      setIsReadOnly(true);
    }
  };

  // Toggle Read-Only (allows OEM manager to inspect in view-only or audit mode)
  const handleToggleReadOnly = () => {
    setIsReadOnly((prev) => !prev);
  };

  // Dynamically filter leads based on Position and Siebel Organization/Division/Workshop hierarchy
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Position restrictions
      if (currentPosition === 'Dealer Workshop SA / Telecaller') {
        return lead.workshopCode === '3004450';
      }
      if (currentPosition === 'ASM Mumbai') {
        const mumbaiWorkshops = ['3004450', '3004455', '3004456'];
        if (!mumbaiWorkshops.includes(lead.workshopCode)) return false;
      }
      if (currentPosition === 'RSM West') {
        if (!lead.division.includes('West Zone')) return false;
      }

      // Hierarchy filter bar selection
      if (
        selectedDivision !== 'All Organizations & Divisions' &&
        selectedDivision !== 'All West Divisions' &&
        lead.division !== selectedDivision
      ) {
        return false;
      }

      if (selectedWorkshop !== 'ALL' && lead.workshopCode !== selectedWorkshop) {
        return false;
      }

      return true;
    });
  }, [leads, currentPosition, selectedDivision, selectedWorkshop]);

  // Lead Assignment Handler
  const handleAssignLeads = (
    allocations: { telecallerId: string; count: number }[]
  ) => {
    setTelecallers((prev) =>
      prev.map((tc) => {
        const alloc = allocations.find((a) => a.telecallerId === tc.id);
        if (alloc) {
          return {
            ...tc,
            totalLeadsActive: tc.totalLeadsActive + alloc.count,
            fresh: tc.fresh + alloc.count,
            assignedCount: tc.assignedCount + alloc.count
          };
        }
        return tc;
      })
    );

    setLeads((prev) =>
      prev.map((lead, idx) => {
        if (!lead.assignedTelecallerId) {
          const tc = idx % 2 === 0 ? telecallers[2] : telecallers[4];
          return {
            ...lead,
            assignedTelecallerId: tc.id,
            assignedTelecallerName: tc.name,
            assignDateTime: '19-10-2026 03:31 PM'
          };
        }
        return lead;
      })
    );
  };

  // Book Appointment Handler
  const handleBookAppointment = (appt: BookedAppointment) => {
    setBookedAppointments((prev) => [appt, ...prev]);
    setLeads((prev) =>
      prev.map((l) =>
        l.id === appt.leadId
          ? {
              ...l,
              callStatus: 'Connected',
              callOutcome: 'Appt. Booked'
            }
          : l
      )
    );
  };

  // Reschedule Appointment Handler
  const handleRescheduleAppointment = (
    apptId: string,
    newSlot: string,
    newDate: string,
    reason: string
  ) => {
    setBookedAppointments((prev) =>
      prev.map((a) =>
        a.id === apptId
          ? {
              ...a,
              timeSlot: newSlot,
              date: newDate,
              status: 'Rescheduled',
              rescheduleHistory: [
                ...(a.rescheduleHistory || []),
                {
                  previousSlot: a.timeSlot,
                  previousDate: a.date,
                  reason,
                  timestamp: '19-10-2026 16:02 PM'
                }
              ]
            }
          : a
      )
    );
  };

  const unassignedCount = filteredLeads.filter(
    (l) => !l.assignedTelecallerId
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800 antialiased">
      {/* 1. Top Header with Siebel Position & Hierarchy Bar */}
      <Header
        currentPosition={currentPosition}
        onPositionChange={handlePositionChange}
        selectedOrganization={selectedOrganization}
        onOrganizationChange={setSelectedOrganization}
        selectedDivision={selectedDivision}
        onDivisionChange={setSelectedDivision}
        selectedWorkshop={selectedWorkshop}
        onWorkshopChange={setSelectedWorkshop}
        isReadOnly={isReadOnly}
        onToggleReadOnly={handleToggleReadOnly}
      />

      {/* 2. Main Body: Dealer Application Left Rail + Appointment Module View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Dealer Left Navigation Rail */}
        <Sidebar
          currentSubScreen={currentScreen}
          onSubScreenChange={setCurrentScreen}
          unassignedCount={unassignedCount}
        />

        {/* Core Appointments Module (Dealer Application screens from PDF) */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <AppointmentGovernance
            leads={filteredLeads}
            telecallers={telecallers}
            bookedAppointments={bookedAppointments}
            onAssignLeads={handleAssignLeads}
            onBookAppointment={handleBookAppointment}
            onRescheduleAppointment={handleRescheduleAppointment}
            currentPosition={currentPosition}
            selectedDivision={selectedDivision}
            selectedWorkshop={selectedWorkshop}
            isReadOnly={isReadOnly}
            onToggleReadOnly={handleToggleReadOnly}
            currentScreen={currentScreen}
            onScreenChange={setCurrentScreen}
          />
        </main>
      </div>

      {/* 3. Siebel Status Bar Footer */}
      <footer className="border-t border-gray-200 bg-white py-1.5 px-4 text-[11px] text-gray-500 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800">TATA MOTORS LIMITED</span>
          <span>·</span>
          <span>Service Transformation · Appointments Module</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-gray-500">
          <span>Position: {currentPosition}</span>
          <span>·</span>
          <span>Division: {selectedDivision}</span>
          <span>·</span>
          <span className={isReadOnly ? 'text-amber-700 font-semibold' : 'text-emerald-700 font-semibold'}>
            Mode: {isReadOnly ? 'TML Read-Only Governance' : 'Interactive Workshop Execution'}
          </span>
        </div>
      </footer>
    </div>
  );
}
