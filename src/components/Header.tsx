import React, { useState } from 'react';
import {
  Building2,
  ChevronDown,
  Lock,
  Unlock,
  Check,
  Briefcase,
  Layers,
  MapPin,
  Share2,
  Copy,
  ExternalLink,
  Download,
  X,
  CheckCircle2
} from 'lucide-react';
import { TMLPosition } from '../types';

interface HeaderProps {
  currentPosition: TMLPosition;
  onPositionChange: (pos: TMLPosition) => void;
  selectedOrganization: string;
  onOrganizationChange: (org: string) => void;
  selectedDivision: string;
  onDivisionChange: (div: string) => void;
  selectedWorkshop: string;
  onWorkshopChange: (ws: string) => void;
  isReadOnly: boolean;
  onToggleReadOnly: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPosition,
  onPositionChange,
  selectedOrganization,
  onOrganizationChange,
  selectedDivision,
  onDivisionChange,
  selectedWorkshop,
  onWorkshopChange,
  isReadOnly,
  onToggleReadOnly
}) => {
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);


  // Available divisions based on position
  const getDivisionOptions = () => {
    if (currentPosition === 'ASM Mumbai' || currentPosition === 'Dealer Workshop SA / Telecaller') {
      return ['West Zone - Mumbai Area'];
    }
    if (currentPosition === 'RSM West') {
      return ['All West Divisions', 'West Zone - Mumbai Area', 'West Zone - Pune Area'];
    }
    return [
      'All Organizations & Divisions',
      'West Zone - Mumbai Area',
      'West Zone - Pune Area',
      'North Zone - Delhi Area'
    ];
  };

  const getWorkshopOptions = () => {
    if (selectedDivision === 'West Zone - Mumbai Area' || currentPosition === 'Dealer Workshop SA / Telecaller') {
      return [
        { code: '3004450', name: 'ST-Sv&Pa-Kandivali-Wasan' },
        { code: '3004455', name: 'Wasan Motors - Chembur' },
        { code: '3004456', name: 'Heritage Motors - Borivali' }
      ];
    }
    if (selectedDivision === 'West Zone - Pune Area') {
      return [{ code: '3004451', name: 'Pune Auto Hub Central' }];
    }
    if (selectedDivision === 'North Zone - Delhi Area') {
      return [{ code: '1002230', name: 'Delhi Central TML Hub' }];
    }
    return [
      { code: 'ALL', name: 'All Workshops in Division' },
      { code: '3004450', name: 'ST-Sv&Pa-Kandivali-Wasan' },
      { code: '3004451', name: 'Pune Auto Hub Central' },
      { code: '1002230', name: 'Delhi Central TML Hub' }
    ];
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 text-xs shadow-2xs font-sans">
      {/* Primary Dealer App Header: TATA MOTORS | Service Transformation */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm tracking-wider text-gray-900 uppercase">
            TATA MOTORS
          </span>
          <span className="text-gray-300 font-light text-base">|</span>
          <span className="text-gray-600 font-medium text-xs">
            Service Transformation
          </span>
          <span className="ml-2 text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded font-semibold uppercase font-mono">
            TML Journey · Siebel CRM
          </span>
        </div>

        {/* Right Side: Position Switcher & Read-Only Badge */}
        <div className="flex items-center gap-3">
          {/* Read-Only Status Indicator */}
          <button
            onClick={onToggleReadOnly}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium border flex items-center gap-1.5 transition-colors ${
              isReadOnly
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
            title="Toggle between TML Read-Only and Interactive Workshop Simulation"
          >
            {isReadOnly ? (
              <>
                <Lock className="w-3 h-3 text-blue-600" />
                <span>TML Position: Read-Only Visibility</span>
              </>
            ) : (
              <>
                <Unlock className="w-3 h-3 text-emerald-600" />
                <span>Workshop Mode (Interactive)</span>
              </>
            )}
          </button>

          {/* Siebel Position Dropdown (RSM West, ASM Mumbai, National Service Head) */}
          <div className="relative">
            <button
              onClick={() => setShowPositionDropdown(!showPositionDropdown)}
              className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-[#0052cc] text-white flex items-center justify-center font-bold text-[10px] font-mono">
                {currentPosition === 'RSM West'
                  ? 'RS'
                  : currentPosition === 'ASM Mumbai'
                  ? 'AS'
                  : currentPosition === 'National Service Head'
                  ? 'NS'
                  : 'PK'}
              </div>
              <div className="text-left leading-tight">
                <span className="font-bold text-gray-800 block text-[11px] font-mono">
                  {currentPosition}
                </span>
                <span className="text-[9px] text-gray-500">TML Siebel Position</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
            </button>

            {showPositionDropdown && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded shadow-xl border border-gray-200 py-1 z-50 text-xs">
                <div className="px-3 py-1 border-b border-gray-100 text-[10px] text-gray-400 font-semibold uppercase">
                  Select TML Position (Siebel Visibility)
                </div>
                {[
                  'RSM West',
                  'ASM Mumbai',
                  'National Service Head',
                  'Dealer Workshop SA / Telecaller'
                ].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => {
                      onPositionChange(pos as TMLPosition);
                      setShowPositionDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-gray-50 ${
                      currentPosition === pos ? 'font-bold text-blue-700 bg-blue-50/50' : 'text-gray-700'
                    }`}
                  >
                    <span>{pos}</span>
                    {currentPosition === pos && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Share App / Direct Live URL Button */}
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs text-[11px] transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share App URL</span>
          </button>
        </div>
      </div>

      {/* Share & Deployment Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Working App URL for Sharing</h3>
                  <p className="text-[11px] text-gray-500">Share with stakeholders, dealers, or teammates</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Hosted URL Box */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-gray-700 block">
                Direct Working URL (Live & Hosted Now)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="https://ais-pre-mbu4letyewq2ilad2kfiph-122141304163.asia-east1.run.app"
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-800 font-mono select-all focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('https://ais-pre-mbu4letyewq2ilad2kfiph-122141304163.asia-east1.run.app');
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                  }}
                  className={`px-3 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-900 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-gray-500 flex items-center gap-1">
                <ExternalLink className="w-3 h-3 text-blue-500" />
                Anyone with this URL can open and interact with the full app directly in any browser.
              </p>
            </div>

            {/* GitHub Pages section */}
            <div className="bg-amber-50/70 border border-amber-200 rounded p-3 text-xs space-y-2">
              <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                <span>Want to host on GitHub Pages instead?</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                If your GitHub Pages page is blank, it is because GitHub was serving raw uncompiled code. We built the complete distribution bundle for you:
              </p>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href="/tml-github-pages-ready.zip"
                  download="tml-github-pages-ready.zip"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded text-xs font-medium cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download GitHub-Pages-Ready ZIP
                </a>
              </div>
              <ol className="text-[10px] text-amber-900 list-decimal list-inside space-y-0.5 pt-1">
                <li>Unzip and upload those files (index.html, 404.html, assets folder) to your repo.</li>
                <li>Or in GitHub: <strong>Settings &gt; Pages &gt; Source</strong>, choose <strong>GitHub Actions</strong> (we added the workflow file).</li>
              </ol>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Siebel Organization, Division & Workshop Hierarchy Selector Bar */}
      <div className="h-9 px-4 bg-gray-50/90 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-gray-200">
        <div className="flex items-center gap-3">
          {/* Organization */}
          <div className="flex items-center gap-1.5 text-gray-600">
            <Building2 className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-500 text-[11px]">Org:</span>
            <span className="font-semibold text-gray-800 font-mono text-[11px]">
              {selectedOrganization}
            </span>
          </div>

          <span className="text-gray-300">|</span>

          {/* Division (Zone / Area) */}
          <div className="flex items-center gap-1.5 text-gray-600">
            <Layers className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-500 text-[11px]">Division:</span>
            <select
              value={selectedDivision}
              onChange={(e) => onDivisionChange(e.target.value)}
              className="p-0.5 border border-gray-300 rounded bg-white text-gray-800 text-[11px] font-semibold focus:outline-none"
            >
              {getDivisionOptions().map((div) => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>
          </div>

          <span className="text-gray-300">|</span>

          {/* Workshop / Division Branch */}
          <div className="flex items-center gap-1.5 text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-500 text-[11px]">Workshop:</span>
            <select
              value={selectedWorkshop}
              onChange={(e) => onWorkshopChange(e.target.value)}
              className="p-0.5 border border-gray-300 rounded bg-white text-gray-800 text-[11px] font-semibold focus:outline-none"
            >
              {getWorkshopOptions().map((ws) => (
                <option key={ws.code} value={ws.name}>
                  {ws.code !== 'ALL' ? `[${ws.code}] ` : ''}{ws.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Position Visibility Scope Summary */}
        <div className="text-[11px] text-gray-500 font-mono">
          Visibility Scope: <span className="font-bold text-gray-700">{currentPosition}</span>
          {currentPosition === 'National Service Head' && ' · All India Records'}
          {currentPosition === 'RSM West' && ' · West Zone Records'}
          {currentPosition === 'ASM Mumbai' && ' · Mumbai Area Workshops'}
          {currentPosition === 'Dealer Workshop SA / Telecaller' && ' · Wasan Kandivali Only'}
        </div>
      </div>
    </header>
  );
};
