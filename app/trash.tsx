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

const RestoreIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#502D55]/70">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-4H8V8h5v2zm1-3V3.5L18.5 9H14z" />
  </svg>
);

interface TrashItem {
  id: string;
  title: string;
  type: 'Document' | 'Workspace';
  deletedAt: string;
  originalPath: string;
}

interface TrashProps {
  onViewChange: (view: 'home' | 'login' | 'signup' | 'dashboard' | 'team' | 'file' | 'about' | 'creators' | 'trash') => void;
  documents?: any[];
  onUpdateDocuments?: (newDocs: any[]) => void;
  teams?: any[];
  onUpdateTeams?: (newTeams: any[]) => void;
}

export default function Trash({ 
  onViewChange, 
  documents = [], 
  onUpdateDocuments, 
  teams = [], 
  onUpdateTeams 
}: TrashProps) {
  const supabase = createClient();
  
  const [notification, setNotification] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'delete-item' | 'empty-trash'>('delete-item');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || "Active User");
      }
    }).catch(() => {});
  }, []);

  // Compute dynamic deleted items
  const deletedDocs: TrashItem[] = documents.filter(d => d.deleted).map(d => ({
    id: d.id,
    title: d.title,
    type: 'Document',
    deletedAt: d.deletedAt ? new Date(d.deletedAt).toLocaleDateString() : "Recently",
    originalPath: `Workspace / Documents`
  }));

  const deletedWorkspaces: TrashItem[] = teams.filter(t => t.deleted).map(t => ({
    id: t.id,
    title: t.name || "Your Team",
    type: 'Workspace',
    deletedAt: t.deletedAt ? new Date(t.deletedAt).toLocaleDateString() : "Recently",
    originalPath: `Dashboard / Workspaces`
  }));

  const deletedItems = [...deletedWorkspaces, ...deletedDocs];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onViewChange('home');
  };

  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const handleRestore = (id: string, title: string, type: 'Document' | 'Workspace') => {
    if (type === 'Document') {
      if (onUpdateDocuments) {
        const docToRestore = documents.find(d => d.id === id);
        const docTeamId = docToRestore?.team_id;
        if (docTeamId) {
          const teamOfDoc = teams.find(t => t.id === docTeamId);
          if (teamOfDoc?.deleted && onUpdateTeams) {
            const updatedTeams = teams.map(t => t.id === docTeamId ? { ...t, deleted: false } : t);
            onUpdateTeams(updatedTeams);
          }
        }
        const updatedDocs = documents.map(d => d.id === id ? { ...d, deleted: false } : d);
        onUpdateDocuments(updatedDocs);
      }
    } else if (type === 'Workspace') {
      if (onUpdateTeams) {
        const updatedTeams = teams.map(t => t.id === id ? { ...t, deleted: false } : t);
        onUpdateTeams(updatedTeams);
      }
      if (onUpdateDocuments) {
        const updatedDocs = documents.map(d => d.team_id === id ? { ...d, deleted: false } : d);
        onUpdateDocuments(updatedDocs);
      }
    }
    triggerNotification(`"${title}" successfully restored to active workspaces!`);
  };

  const openDeleteModal = (id: string) => {
    setSelectedItemId(id);
    setModalAction('delete-item');
    setIsConfirmModalOpen(true);
  };

  const openEmptyTrashModal = () => {
    if (deletedItems.length === 0) return;
    setModalAction('empty-trash');
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = () => {
    setIsConfirmModalOpen(false);
    if (modalAction === 'delete-item' && selectedItemId) {
      const targetItem = deletedItems.find(item => item.id === selectedItemId);
      if (targetItem) {
        if (targetItem.type === 'Document') {
          if (onUpdateDocuments) {
            onUpdateDocuments(documents.filter(d => d.id !== selectedItemId));
          }
        } else if (targetItem.type === 'Workspace') {
          if (onUpdateTeams) {
            onUpdateTeams(teams.filter(t => t.id !== selectedItemId));
          }
          if (onUpdateDocuments) {
            onUpdateDocuments(documents.filter(d => d.team_id !== selectedItemId));
          }
        }
        triggerNotification(`"${targetItem.title}" has been permanently deleted.`);
      }
      setSelectedItemId(null);
    } else if (modalAction === 'empty-trash') {
      if (onUpdateDocuments) {
        onUpdateDocuments(documents.filter(d => !d.deleted));
      }
      if (onUpdateTeams) {
        onUpdateTeams(teams.filter(t => !t.deleted));
      }
      triggerNotification("Trash bin successfully purged and emptied permanently.");
    }
  };

  return (
    <div className="h-screen bg-[#FFEEDF] flex selection:bg-[#935073]/20 relative overflow-hidden">

      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-[#502D55] border border-[#FFEEDF]/15 text-[#FFEEDF] px-6 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-bounce">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#F3DDC8]">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          <span className="font-plus-jakarta font-bold text-sm">{notification}</span>
        </div>
      )}

      {/* Confirmation Modal Overlay */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-[#502D55]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200">

          <div className="w-full max-w-[480px] bg-[#FAF6F2] rounded-[32px] p-8 md:p-10 shadow-2xl border border-[#502D55]/5 transform transition-all scale-100 flex flex-col items-center text-center">

            {/* Warning Trash Can Icon */}
            <div className="mb-6 text-[#935073] bg-[#935073]/10 p-5 rounded-full">
              <TrashIcon />
            </div>

            {/* Header */}
            <h2 className="font-plus-jakarta font-extrabold text-[#502D55] text-2xl md:text-3xl tracking-tight mb-3">
              {modalAction === 'empty-trash' ? "Empty Trash Bin?" : "Delete Permanently?"}
            </h2>

            {/* Description */}
            <p className="font-hanken text-sm text-[#502D55]/85 leading-relaxed max-w-sm mb-8">
              {modalAction === 'empty-trash'
                ? "This action is completely irreversible. All workspaces, meeting transcripts, and minutes currently in the bin will be erased forever."
                : "This item will be permanently purged from your account storage. You will not be able to restore this document or its transcript ever again."
              }
            </p>

            {/* Buttons Row */}
            <div className="flex items-center gap-4 w-full">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 font-plus-jakarta font-bold text-sm text-[#502D55] border-2 border-[#502D55]/80 hover:bg-[#502D55]/5 py-3.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmAction}
                className="flex-1 font-plus-jakarta font-bold text-sm text-white bg-[#935073] hover:bg-[#935073]/95 py-3.5 rounded-xl transition-all shadow-md shadow-[#935073]/10 active:scale-[0.98] cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Dashboard Left Sidebar (Fixed) */}
      <aside className="w-20 hover:w-64 md:hover:w-72 group/sidebar transition-all duration-300 ease-in-out bg-[var(--tertiarycolor)] flex flex-col justify-between border-r border-[#502D55]/5 h-screen flex-shrink-0 overflow-hidden">

        <div className="flex flex-col w-full">
          {/* Logo block */}
          <button
            onClick={() => onViewChange('home')}
            className="font-plus-jakarta text-2xl md:text-3xl font-extrabold text-[#502D55] px-6 pt-8 pb-12 text-left self-start hover:opacity-85 transition-all duration-300 cursor-pointer flex items-center overflow-hidden whitespace-nowrap"
          >
            <span className="text-3xl font-extrabold min-w-[32px] text-center">M</span>
            <span className="opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto transition-all duration-300 ease-in-out overflow-hidden">inutes.ai</span>
          </button>

          {/* Menu Items */}
          <nav className="px-3.5 flex flex-col gap-1.5 w-full">
            <button
              onClick={() => onViewChange('dashboard')}
              className="flex items-center w-full px-4.5 py-4 rounded-2xl font-plus-jakarta font-bold text-[#502D55]/65 hover:text-[#502D55] hover:bg-[#502D55]/4 text-left transition-colors cursor-pointer relative overflow-hidden whitespace-nowrap"
            >
              <div className="flex-shrink-0 min-w-[20px] flex justify-center">
                <GridIcon />
              </div>
              <span className="opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto transition-all duration-300 ease-in-out overflow-hidden ml-0 group-hover/sidebar:ml-4">
                Dashboard
              </span>
            </button>

            <button
              className="flex items-center w-full px-4.5 py-4 rounded-2xl font-plus-jakarta font-bold text-[#502D55] bg-[#502D55]/8 text-left transition-colors relative overflow-hidden whitespace-nowrap"
            >
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#502D55] rounded-r-md" />
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
      <main className="flex-1 p-8 md:p-12 overflow-y-auto relative h-screen flex flex-col justify-between">

        <div>
          {/* Welcome User Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
            <div>
              <h1 className="font-plus-jakarta font-extrabold text-4xl md:text-[45px] text-[#502D55] tracking-tight leading-none">
                Trash Bin
              </h1>
              <p className="font-hanken text-xs md:text-sm text-[#502D55]/60 mt-2 font-semibold">
                Workspaces and document files deleted will stay here.
              </p>
            </div>

            {/* Profile Avatar & Empty Trash Button */}
            <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-start">

              {deletedItems.length > 0 && (
                <button
                  onClick={openEmptyTrashModal}
                  className="flex items-center gap-2 bg-[#935073]/10 hover:bg-[#935073]/15 text-[#935073] font-plus-jakarta font-bold text-xs px-4.5 py-3 rounded-xl transition-all duration-200 active:scale-[0.98] cursor-pointer"
                >
                  <TrashIcon />
                  <span>Empty Bin</span>
                </button>
              )}

            </div>
          </header>

          {/* Conditional Grid Layout */}
          {deletedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto w-full animate-fade-in">
              {deletedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#FAF6F2] rounded-[24px] p-6 min-h-[190px] flex flex-col justify-between transition-all duration-300 shadow-sm border border-[#502D55]/5 group relative hover:scale-[1.01]"
                >
                  <div>
                    {/* Badge Row */}
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-[#F3DDC8]/40 text-[#502D55] px-3 py-1 rounded-full text-[10px] font-bold font-plus-jakarta uppercase tracking-wider">
                        {item.type}
                      </span>
                      <span className="font-hanken text-[10px] text-[#502D55]/50 font-bold">
                        {item.deletedAt}
                      </span>
                    </div>

                    <h3 className="font-plus-jakarta font-bold text-lg text-[#502D55] leading-snug">
                      {item.title}
                    </h3>

                    <p className="font-hanken text-[11px] text-[#502D55]/55 mt-1.5 font-medium">
                      Original: {item.originalPath}
                    </p>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center justify-between mt-6 border-t border-[#502D55]/5 pt-4">
                    <button
                      onClick={() => handleRestore(item.id, item.title, item.type)}
                      className="flex items-center gap-1.5 text-xs font-plus-jakarta font-bold text-[#502D55] hover:text-[#502D55]/80 bg-[#FFEEDF] hover:bg-[#FFEEDF]/90 px-3 py-1.5 rounded-lg border border-[#502D55]/10 active:scale-[0.97] transition-all cursor-pointer"
                    >
                      <RestoreIcon />
                      <span>Restore</span>
                    </button>

                    <button
                      onClick={() => openDeleteModal(item.id)}
                      className="p-1.5 text-[#935073] hover:text-[#935073]/80 hover:bg-[#935073]/5 rounded-lg active:scale-[0.95] transition-all cursor-pointer"
                      title="Delete Permanently"
                    >
                      <TrashIcon />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            /* Premium "Trash is Empty" State Layout */
            <div className="flex flex-col items-center justify-center text-center py-20 animate-fade-in max-w-md mx-auto">

              {/* Star-burst Graphic Icon */}
              <div className="relative mb-8 text-[#502D55]">
                <div className="w-20 h-20 bg-[#F3DDC8]/30 rounded-full flex items-center justify-center text-[#502D55]/80 animate-pulse">
                  <TrashIcon />
                </div>
                {/* Micro sparks decorative vectors */}
                <div className="absolute top-1 right-1 text-amber-500 animate-bounce">✦</div>
                <div className="absolute -bottom-2 -left-2 text-amber-600 animate-spin">✦</div>
              </div>

              <h2 className="font-plus-jakarta font-extrabold text-[#502D55] text-2xl md:text-3xl tracking-tight mb-3">
                Trash is Empty
              </h2>

              <p className="font-hanken text-sm text-[#502D55]/65 leading-relaxed mb-8">
                Your deleted files and workspaces will be collected here. There are currently no items pending permanent deletion.
              </p>

              <button
                onClick={() => onViewChange('dashboard')}
                className="bg-[#502D55] hover:bg-[#502D55]/95 text-white font-plus-jakarta font-bold text-xs py-3.5 px-6 rounded-xl transition-all duration-200 shadow-md shadow-[#502D55]/10 active:scale-[0.98] cursor-pointer"
              >
                Go to Dashboard
              </button>

            </div>
          )}
        </div>

        {/* Small bottom brand label */}
        <footer className="text-center sm:text-left mt-12 border-t border-[#502D55]/5 pt-6 text-[11px] font-medium text-[#502D55]/40 font-hanken">
          © 2026 Minutes.ai. All rights reserved. Registered TUP Academic Project.
        </footer>

      </main>

    </div>
  );
}
