"use client";

import { useState, useEffect } from "react";
import { createClient } from "../backend/supabase/client";

// Icons
const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// Card Document File SVG Icon
const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#502D55]">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-4H8V8h5v2zm1-3V3.5L18.5 9H14z" />
  </svg>
);

interface DashboardProps {
  onViewChange: (view: 'home' | 'login' | 'signup' | 'dashboard' | 'team' | 'file' | 'about' | 'creators' | 'trash') => void;
  onSelectTeam?: (id: string) => void;
  onSelectFile?: (id: string) => void;

  // Local states
  teams?: any[];
  documents?: any[];
  onUpdateTeams?: (newTeams: any[]) => void;
  onUpdateDocuments?: (newDocs: any[]) => void;
}

export default function Dashboard({
  onViewChange,
  onSelectTeam,
  onSelectFile,
  teams = [],
  documents = [],
  onUpdateTeams,
  onUpdateDocuments
}: DashboardProps) {
  const supabase = createClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [teamNameInput, setTeamNameInput] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || "Active User");
      }
    }).catch(() => {});
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onViewChange('home');
  };
  const [isUploadDrawerOpen, setIsUploadDrawerOpen] = useState(false);

  // Drag & drop state values
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStep, setUploadStep] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [uploadedFileName, setUploadedFileName] = useState("");

  // Unique high-fidelity collaborator emails (starts empty)
  const [emails, setEmails] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (trimmed && trimmed.includes('@') && !emails.includes(trimmed)) {
        setEmails([...emails, trimmed]);
        setInputValue("");
      }
    }
  };

  const removeEmail = (indexToRemove: number) => {
    setEmails(emails.filter((_, index) => index !== indexToRemove));
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      simulateFileUpload(file.name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      simulateFileUpload(file.name);
    }
  };

  const simulateFileUpload = async (fileName: string) => {
    setUploadedFileName(fileName);
    setUploadStep('uploading');

    const activeTeamId = teams.length > 0 ? teams[0].id : "";

    const newDoc = {
      id: `doc-${Date.now()}`,
      team_id: activeTeamId,
      title: fileName.replace(/\.[^/.]+$/, ""),
      type: 'draft',
      content: "This is a raw meeting transcript uploaded via the file manager. Trigger the AI Automator sidebar to synthesize action points and construct standard MOM minutes.",
      summary: "",
      decisions: [],
      action_items: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setTimeout(() => {
      setUploadStep('success');
      if (onUpdateDocuments) {
        onUpdateDocuments([newDoc, ...documents]);
      }
      if (onSelectFile) onSelectFile(newDoc.id);
    }, 1500);
  };

  const closeUploadDrawer = () => {
    setIsUploadDrawerOpen(false);
    setUploadStep('idle');
    setUploadedFileName("");
  };

  const teamItems = teams.filter(t => !t.deleted).map(team => {
    const docCount = documents.filter(doc => doc.team_id === team.id && !doc.deleted).length;
    return {
      id: team.id,
      title: team.name || "Your Team",
      docCount: docCount,
      createdAt: `Created ${new Date(team.created_at).toLocaleDateString()}`
    };
  });

  const recentHistoryItems = documents.filter(doc => !doc.deleted).map(doc => ({
    id: doc.id,
    title: doc.title,
    teamId: doc.team_id,
    type: doc.type || 'draft',
    edited: `Edited ${new Date(doc.updated_at || doc.created_at).toLocaleDateString()}`
  }));

  const isLoadingData = false;

  const handleCreateTeam = async () => {
    setIsCreateModalOpen(false);

    // Proactively add any pending email address that was typed but not yet submitted via Enter
    let finalEmails = [...emails];
    const trimmedInput = inputValue.trim();
    if (trimmedInput && trimmedInput.includes('@') && !finalEmails.includes(trimmedInput)) {
      finalEmails.push(trimmedInput);
      setInputValue(""); // Clear input
      setEmails(finalEmails); // Update state
    }

    const finalTeamName = teamNameInput.trim() || `${finalEmails[0]?.split('@')[0] || "New"}'s Team`;

    const newTeam = {
      id: `team-${Date.now()}`,
      name: finalTeamName,
      recipients: finalEmails,
      created_at: new Date().toISOString()
    };

    if (onUpdateTeams) {
      onUpdateTeams([newTeam, ...teams]);
    }

    setTeamNameInput("");
    setEmails([]);

    if (onSelectTeam) onSelectTeam(newTeam.id);
    onViewChange('team');
  };

  return (
    <div className="h-screen bg-[#FFEEDF] flex selection:bg-[#935073]/20 relative overflow-hidden">

      {/* Sidebar navigation */}
      <aside className="w-20 hover:w-64 md:hover:w-72 group/sidebar transition-all duration-300 ease-in-out bg-[var(--tertiarycolor)] flex flex-col justify-between border-r border-[#502D55]/5 flex-shrink-0 relative z-20 overflow-hidden h-screen">

        <div className="flex flex-col w-full">
          {/* Logo block */}
          <button
            className="font-plus-jakarta text-2xl md:text-3xl font-extrabold text-[#502D55] px-6 pt-8 pb-12 text-left self-start hover:opacity-80 transition-all duration-300 cursor-pointer flex items-center overflow-hidden whitespace-nowrap"
          >
            <span className="text-3xl font-extrabold min-w-[32px] text-center">M</span>
            <span className="opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto transition-all duration-300 ease-in-out overflow-hidden">inutes.ai</span>
          </button>

          {/* Menu Items */}
          <nav className="px-3.5 flex flex-col gap-1.5 w-full">
            {/* Active Dashboard Button with left accent block */}
            <button className="flex items-center w-full px-4.5 py-4 rounded-2xl font-plus-jakarta font-bold text-[#502D55] bg-[#502D55]/8 text-left transition-colors relative overflow-hidden whitespace-nowrap">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#502D55] rounded-r-md" />
              <div className="flex-shrink-0 min-w-[20px] flex justify-center">
                <GridIcon />
              </div>
              <span className="opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto transition-all duration-300 ease-in-out overflow-hidden ml-0 group-hover/sidebar:ml-4">
                Dashboard
              </span>
            </button>

            <button
              onClick={() => onViewChange('trash')}
              className="flex items-center w-full px-4.5 py-4 rounded-2xl font-plus-jakarta font-bold text-[#502D55]/65 hover:text-[#502D55] hover:bg-[#502D55]/4 text-left transition-colors cursor-pointer relative overflow-hidden whitespace-nowrap"
            >
              <div className="flex-shrink-0 min-w-[20px] flex justify-center">
                <TrashIcon />
              </div>
              <span className="opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto transition-all duration-300 ease-in-out overflow-hidden ml-0 group-hover/sidebar:ml-4">
                Trash
              </span>
            </button>
          </nav>
        </div>

        {/* Profile and Sign Out Container */}
        <div className="p-3.5 mb-4 w-full flex flex-col gap-2 border-t border-[#502D55]/5 pt-4">
          
          {/* User Profile Info Card */}
          {userEmail && (
            <div className="flex items-center w-full px-1.5 py-3 group-hover/sidebar:px-4 group-hover/sidebar:bg-[#502D55]/3 group-hover/sidebar:border group-hover/sidebar:border-[#502D55]/5 border border-transparent rounded-2xl whitespace-nowrap overflow-hidden transition-all duration-300">
              <div className="w-10 h-10 rounded-full bg-[#502D55]/10 text-[#502D55] font-extrabold flex items-center justify-center flex-shrink-0 font-plus-jakarta text-sm border border-[#502D55]/15 shadow-sm">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto transition-all duration-300 ease-in-out overflow-hidden ml-0 group-hover/sidebar:ml-3">
                <span className="font-plus-jakarta text-[10px] font-extrabold text-[#502D55]/50 uppercase tracking-wider leading-none mb-1">Signed in as</span>
                <span className="font-hanken text-[12px] font-bold text-[#502D55] truncate max-w-[135px] leading-tight" title={userEmail}>
                  {userEmail}
                </span>
              </div>
            </div>
          )}

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4.5 py-4 rounded-2xl font-plus-jakarta font-bold text-[#502D55]/65 hover:text-[#502D55] hover:bg-[#502D55]/4 text-left transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="flex-shrink-0 min-w-[20px] flex justify-center">
              <LogoutIcon />
            </div>
            <span className="opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto transition-all duration-300 ease-in-out overflow-hidden ml-0 group-hover/sidebar:ml-4">
              Sign out
            </span>
          </button>
        </div>

      </aside>

      {/* Main dashboard content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto w-full relative z-10">

        {/* Modern Aesthetic Backdrop Gradient Orbs */}
        <div className="absolute top-[-10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-[#935073]/4 blur-[130px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[600px] h-[600px] rounded-full bg-[#502D55]/4 blur-[130px] pointer-events-none animate-pulse" />

        <div className="max-w-[1240px] mx-auto w-full relative z-10">
          {/* Top action bar */}
          <div className="flex items-center gap-4 mb-10">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="font-plus-jakarta font-bold text-sm text-[#FFEEDF] bg-[#502D55] hover:bg-[#502D55]/95 px-6 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#502D55]/10 active:scale-[0.99] cursor-pointer"
            >
              Create New Team
            </button>
          </div>

          {/* Recent History section (Softened layout style) */}
          <section className="mb-12">
            <h2 className="font-plus-jakarta font-bold text-2xl text-[#502D55] mb-6 tracking-tight">
              Recent History
            </h2>

            {isLoadingData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-[#FAF6F2]/50 border border-[#502D55]/5 rounded-[24px] p-6 min-h-[175px] animate-pulse flex flex-col justify-between">
                    <div className="w-8 h-8 bg-[#502D55]/5 rounded-xl" />
                    <div className="space-y-2 mt-4">
                      <div className="h-4 bg-[#502D55]/5 rounded-full w-2/3" />
                      <div className="h-3 bg-[#502D55]/5 rounded-full w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentHistoryItems.length === 0 ? (
              <div className="bg-[#FAF6F2]/30 border-2 border-dashed border-[#502D55]/10 rounded-[32px] p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[220px]">
                <div className="w-14 h-14 bg-[#502D55]/5 text-[#502D55]/70 rounded-2xl flex items-center justify-center mb-4">
                  <FileIcon />
                </div>
                <h3 className="font-plus-jakarta font-bold text-lg text-[#502D55] mb-1">
                  No Recent Meetings
                </h3>
                <p className="font-hanken text-xs text-[#502D55]/60 max-w-sm mb-5 leading-relaxed font-semibold">
                  Create a team workspace first, then upload meeting transcripts or draft meeting minutes inside it!
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-[#502D55] hover:bg-[#502D55]/95 text-white font-plus-jakarta font-bold text-xs py-3 px-6 rounded-xl transition-all duration-200 shadow-md shadow-[#502D55]/10 active:scale-[0.98] cursor-pointer"
                >
                  Create Team to Start
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentHistoryItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.teamId && onSelectTeam) onSelectTeam(item.teamId);
                      if (onSelectFile) onSelectFile(item.id);
                      onViewChange('file');
                    }}
                    className="bg-[#FAF6F2] hover:bg-[#FAF6F2]/40 hover:scale-[1.01] hover:-translate-y-1 rounded-[24px] p-6 min-h-[175px] flex flex-col justify-between transition-all duration-300 shadow-md hover:shadow-lg border border-[#502D55]/5 group cursor-pointer relative"
                  >
                    <div className="flex items-start justify-between">
                      <FileIcon />
                      {item.type === 'mom' ? (
                        <span className="bg-emerald-50 text-emerald-800 text-[8.5px] font-bold px-2 py-0.5 rounded-full font-plus-jakarta uppercase tracking-wider block">
                          ✦ MOM
                        </span>
                      ) : (
                        <span className="bg-[#502D55]/5 text-[#502D55]/60 text-[8.5px] font-bold px-2 py-0.5 rounded-full font-plus-jakarta uppercase tracking-wider block">
                          ✏️ Draft
                        </span>
                      )}
                    </div>

                    <div className="mt-4">
                      <h3 className="font-plus-jakarta font-bold text-base text-[#502D55] leading-snug tracking-tight group-hover:text-[#935073] transition-colors">
                        {item.title}
                      </h3>
                      <p className="font-hanken text-[11px] text-[#502D55]/50 mt-1.5 font-semibold">
                        {item.edited}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Your Team section */}
          <section>
            <h2 className="font-plus-jakarta font-bold text-2xl text-[#502D55] mb-6 tracking-tight">
              Your Team
            </h2>

            {isLoadingData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-[#FAF6F2]/50 border border-[#502D55]/5 rounded-[24px] p-6 min-h-[175px] animate-pulse flex flex-col justify-between">
                    <div className="w-8 h-8 bg-[#502D55]/5 rounded-xl" />
                    <div className="space-y-2 mt-4">
                      <div className="h-4 bg-[#502D55]/5 rounded-full w-2/3" />
                      <div className="h-3 bg-[#502D55]/5 rounded-full w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : teamItems.length === 0 ? (
              <div className="bg-[#FAF6F2]/30 border-2 border-dashed border-[#502D55]/10 rounded-[32px] p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[220px]">
                <div className="w-14 h-14 bg-[#502D55]/5 text-[#502D55]/70 rounded-2xl flex items-center justify-center mb-4 text-[#502D55]/70">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="font-plus-jakarta font-bold text-lg text-[#502D55] mb-1">
                  No Teams Found
                </h3>
                <p className="font-hanken text-xs text-[#502D55]/60 max-w-sm mb-5 leading-relaxed font-semibold">
                  Add a team of collaborators to distribute meeting documentations automatically.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-[#502D55] hover:bg-[#502D55]/95 text-white font-plus-jakarta font-bold text-xs py-3 px-6 rounded-xl transition-all duration-200 shadow-md shadow-[#502D55]/10 active:scale-[0.98] cursor-pointer"
                >
                  Create New Team
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {teamItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (onSelectTeam) onSelectTeam(item.id);
                      onViewChange('team');
                    }}
                    className="bg-[#FAF6F2] hover:bg-[#FAF6F2]/40 hover:scale-[1.01] hover:-translate-y-1 rounded-[24px] p-6 min-h-[175px] flex flex-col justify-between transition-all duration-300 shadow-md hover:shadow-lg border border-[#502D55]/5 group cursor-pointer relative"
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="w-10 h-10 bg-[#502D55]/5 rounded-xl flex items-center justify-center text-[#502D55] font-bold font-plus-jakarta text-sm">
                        {item.title.charAt(0)}
                      </div>
                      <span className="bg-[#935073]/5 text-[#935073] text-[9px] font-extrabold px-2.5 py-1 rounded-full font-plus-jakarta">
                        📂 {item.docCount} Files
                      </span>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-plus-jakarta font-bold text-base text-[#502D55] leading-snug tracking-tight group-hover:text-[#935073] transition-colors truncate">
                        {item.title}
                      </h3>
                      <p className="font-hanken text-[11px] text-[#502D55]/50 mt-1.5 font-semibold">
                        {item.createdAt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

      </main>

      {/* Create Team Modal Overlay */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-[#502D55]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200">

          {/* Modal Container */}
          <div className="w-full max-w-[620px] bg-[#FAF6F2] rounded-[32px] p-8 md:p-10 shadow-2xl border border-[#502D55]/5 transform transition-all scale-100 animate-fade-in">

            {/* Header */}
            <div className="mb-6">
              <h2 className="font-plus-jakarta font-extrabold text-[#502D55] text-3xl md:text-[32px] tracking-tight leading-none mb-3">
                Create New Team
              </h2>
              <p className="font-hanken text-sm text-[#502D55]/85 leading-relaxed">
                Define your team's details and invite collaborators to receive automated minutes
              </p>
            </div>

            {/* Team Name Input field */}
            <div className="flex flex-col gap-2 mb-6">
              <span className="font-hanken text-[10.5px] font-bold text-[#502D55]/75 tracking-wider uppercase">
                TEAM NAME
              </span>
              <input
                type="text"
                placeholder="e.g. GDGoC's Team, Relations, Engineering..."
                value={teamNameInput}
                onChange={(e) => setTeamNameInput(e.target.value)}
                className="w-full bg-[#F3DDC8]/35 border-2 border-[#502D55]/10 rounded-2xl px-4 py-3.5 outline-none focus:border-[#502D55]/20 focus:bg-[#F3DDC8]/45 transition-all text-sm text-[#502D55] font-hanken placeholder-[#B6B6B6]"
              />
            </div>

            {/* Email field label */}
            <div className="flex flex-col gap-2">
              <span className="font-hanken text-[10.5px] font-bold text-[#502D55]/75 tracking-wider uppercase">
                INVITE VIA EMAIL
              </span>

              {/* Tag box container */}
              <div className="w-full bg-[#F3DDC8]/35 border-2 border-[#502D55]/10 rounded-2xl p-4 flex flex-wrap gap-2.5 min-h-[110px] items-start focus-within:border-[#502D55]/20 focus-within:bg-[#F3DDC8]/45 transition-all">
                {emails.map((email, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-[#502D55] text-white text-[11px] font-bold px-3 py-1.5 rounded-full"
                  >
                    <span className="font-hanken">{email}</span>
                    <button
                      type="button"
                      onClick={() => removeEmail(idx)}
                      className="w-4 h-4 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors text-[9px] font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))}

                <input
                  type="text"
                  placeholder="Type email and press Enter..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-0 outline-none p-1 min-w-[200px] text-sm text-[#502D55] placeholder-[#B6B6B6] font-hanken"
                />
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-end gap-6 mt-8">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="font-plus-jakarta font-bold text-sm text-[#935073] hover:text-[#502D55] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateTeam}
                className="font-plus-jakarta font-bold text-sm text-white bg-[#502D55] hover:bg-[#502D55]/95 px-6 py-3.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-[#502D55]/10 active:scale-[0.99] cursor-pointer"
              >
                <span>Continue to MOM</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Drag & Drop File Upload Modal Overlay */}
      {isUploadDrawerOpen && (
        <div className="fixed inset-0 bg-[#502D55]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200">

          <div className="w-full max-w-[550px] bg-[#FAF6F2] rounded-[32px] p-8 md:p-10 shadow-2xl border border-[#502D55]/5 transform transition-all scale-100 animate-fade-in relative">

            {/* Close button */}
            <button
              onClick={closeUploadDrawer}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#502D55]/5 hover:bg-[#502D55]/10 flex items-center justify-center text-[#502D55]/70 hover:text-[#502D55] transition-colors font-bold text-sm cursor-pointer"
            >
              ✕
            </button>

            {/* Header */}
            <div className="mb-6 text-center">
              <h2 className="font-plus-jakarta font-extrabold text-[#502D55] text-2xl md:text-3xl tracking-tight leading-none mb-3">
                Upload Meeting Note
              </h2>
              <p className="font-hanken text-sm text-[#502D55]/85 leading-relaxed">
                Drop your raw text file or transcript here to generate automated minutes.
              </p>
            </div>

            {uploadStep === 'idle' && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all ${isDragging
                    ? 'border-[#502D55] bg-[#F3DDC8]/40 scale-[1.01]'
                    : 'border-[#502D55]/20 bg-[#FAF6F2] hover:border-[#502D55]/40 hover:bg-[#F3DDC8]/10'
                  }`}
              >
                <div className="w-14 h-14 rounded-full bg-[#502D55]/5 flex items-center justify-center text-[#502D55]/70 mb-4 animate-bounce">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>

                <p className="font-plus-jakarta font-bold text-sm text-[#502D55] mb-1">
                  Drag & Drop transcript here
                </p>
                <p className="font-hanken text-[11px] text-[#502D55]/60 mb-5">
                  Supports .txt, .docx files up to 10MB
                </p>

                <label
                  htmlFor="file-select"
                  className="bg-[#502D55] hover:bg-[#502D55]/95 text-white font-plus-jakarta font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
                >
                  Choose File
                </label>
                <input
                  type="file"
                  id="file-select"
                  accept=".txt,.docx"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            )}

            {uploadStep === 'uploading' && (
              <div className="w-full bg-[#FAF6F2] border border-[#502D55]/5 rounded-2xl p-10 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-[#502D55] border-t-transparent rounded-full animate-spin"></div>
                <div className="text-center">
                  <p className="font-plus-jakarta font-bold text-sm text-[#502D55]">Parsing transcript content...</p>
                  <p className="font-hanken text-xs text-[#502D55]/60 mt-1">{uploadedFileName}</p>
                </div>
              </div>
            )}

            {uploadStep === 'success' && (
              <div className="w-full bg-[#FAF6F2] border border-[#502D55]/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center animate-fade-in">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>

                <h3 className="font-plus-jakarta font-bold text-lg text-[#502D55] mb-1">
                  Upload Successful!
                </h3>
                <p className="font-hanken text-xs text-[#502D55]/60 mb-6">
                  "{uploadedFileName}" successfully parsed into structured text notes.
                </p>

                <div className="flex gap-4 w-full">
                  <button
                    onClick={() => setUploadStep('idle')}
                    className="flex-1 border-2 border-[#502D55]/60 hover:bg-[#502D55]/5 text-[#502D55] font-plus-jakarta font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Upload Another
                  </button>
                  <button
                    onClick={() => { closeUploadDrawer(); onViewChange('file'); }}
                    className="flex-1 bg-[#502D55] hover:bg-[#502D55]/95 text-white font-plus-jakarta font-bold text-xs py-3 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
                  >
                    Continue to MOM
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
