import React from 'react';
import {
  Menu,
  CalendarCheck,
  Search,
  Users,
  Settings,
  HelpCircle,
  Clock,
  ShieldCheck,
  Sun,
  LogOut
} from 'lucide-react';
import { AppScreen } from '../types';

interface SidebarProps {
  currentSubScreen: AppScreen;
  onSubScreenChange: (s: AppScreen) => void;
  unassignedCount: number;
  productUnassignedCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSubScreen,
  onSubScreenChange,
  unassignedCount,
  productUnassignedCount = 295
}) => {
  return (
    <aside className="w-12 bg-white border-r border-gray-200 flex flex-col items-center justify-between py-3 shrink-0 select-none">
      {/* Top Navigation Icons */}
      <div className="flex flex-col items-center gap-2.5 w-full">
        {/* Menu Hamburger */}
        <button
          className="w-8 h-8 rounded flex items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer"
          title="Toggle Menu"
        >
          <Menu className="w-4 h-4 text-gray-700" />
        </button>

        <div className="w-6 h-[1px] bg-gray-200 my-0.5" />

        {/* Lead Assignment / Service Due Leads */}
        <button
          onClick={() => onSubScreenChange('serviceDueList')}
          title="Lead Assignment: Service Due Leads"
          className={`w-8 h-8 rounded flex items-center justify-center relative transition-colors cursor-pointer ${
            currentSubScreen === 'serviceDueList'
              ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-2xs'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Users className="w-4 h-4" />
          {unassignedCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        {/* Lead Assignment / Product Leads (EW, AMC, RSA, TMI) */}
        <button
          onClick={() => onSubScreenChange('productLeads')}
          title="Lead Assignment: Product Leads (EW, AMC, RSA, TMI)"
          className={`w-8 h-8 rounded flex items-center justify-center relative transition-colors cursor-pointer ${
            currentSubScreen === 'productLeads'
              ? 'bg-blue-50 text-[#1877F2] font-bold border border-blue-300 shadow-2xs'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
        </button>

        {/* Telecaller Calling List (Prasad) */}
        <button
          onClick={() => onSubScreenChange('telecallerWorkspace')}
          title="Telecaller Workspace (Prasad Bhagwati)"
          className={`w-8 h-8 rounded flex items-center justify-center transition-colors cursor-pointer ${
            currentSubScreen === 'telecallerWorkspace'
              ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-2xs'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
        </button>

        {/* Appointment Reminders */}
        <button
          onClick={() => onSubScreenChange('apptReminderList')}
          title="Appointment Reminder View"
          className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
            currentSubScreen === 'apptReminderList'
              ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-2xs'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Clock className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Icons matching dealer app screenshot */}
      <div className="flex flex-col items-center gap-2">
        <button
          className="w-8 h-8 rounded flex items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer"
          title="Theme Toggle"
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          className="w-8 h-8 rounded flex items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer"
          title="Sign Out / Exit"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
