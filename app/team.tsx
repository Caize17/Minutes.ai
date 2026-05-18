"use client";

import { useState } from "react";

// Back Arrow Vector Icon
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

// Card Document File SVG Icon
const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#502D55]/85">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-4H8V8h5v2zm1-3V3.5L18.5 9H14z" />
  </svg>
);

// Small Trash Icon SVG
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

interface TeamCard {
  id: number;
  title: string;
  edited: string;
  type: 'draft' | 'mom';
  status: string;
  actionsCount: number;
  decisionsCount: number;
  summary: string;
}

interface TeamProps {
  onViewChange: (view: 'home' | 'login' | 'signup' | 'dashboard' | 'team' | 'file' | 'about' | 'creators' | 'trash') => void;
}

export default function Team({ onViewChange }: TeamProps) {
  const [recipients, setRecipients] = useState<string[]>([
    "clara.santos@mail.com",
    "marcelo.cruz@mail.com",
    "marcos.perez@mail.com"
  ]);
  const [showInput, setShowInput] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const [momStructure, setMomStructure] = useState<'standard' | 'detailed' | 'concise'>('standard');

  const handleStructureChange = (structure: 'standard' | 'detailed' | 'concise') => {
    setMomStructure(structure);
    const label = structure === 'standard' ? 'Standard' : structure === 'detailed' ? 'Detailed' : 'Concise';
    triggerNotification(`AI Minutes format updated to "${label}" structure successfully!`);
  };

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'draft' | 'mom'>('all');

  // Highly premium, structured metadata files state
  const [cards, setCards] = useState<TeamCard[]>([
    { id: 1, title: "GDGoC's Meeting", edited: "Edited Just now", type: "mom", status: "Completed MOM", actionsCount: 3, decisionsCount: 2, summary: "Reviewed Google Automation Python script markers and timelines." },
    { id: 2, title: "Relation's Meeting", edited: "Edited 12 hours ago", type: "draft", status: "Draft Note", actionsCount: 0, decisionsCount: 0, summary: "Raw notes on client dynamic routing flat prototypes." },
    { id: 3, title: "Marketing Synch", edited: "Edited 1 day ago", type: "mom", status: "Completed MOM", actionsCount: 4, decisionsCount: 3, summary: "Social media outreach guidelines and banner assets reviews." },
    { id: 4, title: "Design Sprint Notes", edited: "Edited 2 days ago", type: "draft", status: "Draft Note", actionsCount: 0, decisionsCount: 0, summary: "Brainstorming warm peach and cream gradient templates." },
    { id: 5, title: "Product Roadmap", edited: "Edited 3 days ago", type: "mom", status: "Completed MOM", actionsCount: 5, decisionsCount: 4, summary: "Quarterly timeline roadmap commitments for core flat APIs." },
    { id: 6, title: "Launch Timeline Review", edited: "Edited 5 days ago", type: "mom", status: "Completed MOM", actionsCount: 2, decisionsCount: 1, summary: "Pre-production test suite verification checklists." },
    { id: 7, title: "Engineering Sync", edited: "Edited 1 week ago", type: "draft", status: "Draft Note", actionsCount: 0, decisionsCount: 0, summary: "Raw notes on typescript types interface alignment." },
    { id: 8, title: "Operations Planning", edited: "Edited 2 weeks ago", type: "mom", status: "Completed MOM", actionsCount: 3, decisionsCount: 2, summary: "Workspace directories flat structure alignments." }
  ]);

  const [notification, setNotification] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<TeamCard | null>(null);

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newEmail.trim();
    if (trimmed && trimmed.includes("@")) {
      setRecipients([...recipients, trimmed]);
      setNewEmail("");
      setShowInput(false);
    }
  };

  const removeRecipient = (indexToRemove: number) => {
    setRecipients(recipients.filter((_, idx) => idx !== indexToRemove));
  };

  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const openDeleteModal = (card: TeamCard) => {
    setSelectedCard(card);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCard) {
      setCards(cards.filter(c => c.id !== selectedCard.id));
      triggerNotification(`"${selectedCard.title}" has been successfully moved to Trash.`);
      setSelectedCard(null);
    }
    setIsConfirmModalOpen(false);
  };

  // Symmetrical live filtering calculation
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          card.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' ? true : card.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#FFEEDF] flex selection:bg-[#935073]/20 relative overflow-hidden">
      
      {/* Success Notification Banner */}
      {notification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-[#502D55] border border-[#FFEEDF]/15 text-[#FFEEDF] px-6 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-bounce">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#F3DDC8]">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <span className="font-plus-jakarta font-bold text-sm">{notification}</span>
        </div>
      )}

      {/* Move to Trash Confirmation Modal */}
      {isConfirmModalOpen && selectedCard && (
        <div className="fixed inset-0 bg-[#502D55]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200">
          
          <div className="w-full max-w-[480px] bg-[#FAF6F2] rounded-[32px] p-8 md:p-10 shadow-2xl border border-[#502D55]/5 transform transition-all scale-100 flex flex-col items-center text-center">
            
            <div className="mb-6 text-[#935073] bg-[#935073]/10 p-5 rounded-full animate-pulse">
              <TrashIcon />
            </div>

            <h2 className="font-plus-jakarta font-extrabold text-[#502D55] text-2xl md:text-3xl tracking-tight mb-3">
              Move to Trash?
            </h2>

            <p className="font-hanken text-sm text-[#502D55]/85 leading-relaxed max-w-sm mb-8">
              Are you sure you want to move <strong className="text-[#502D55] font-bold">"{selectedCard.title}"</strong> to the Trash Bin? You will be able to restore it or delete it permanently from there.
            </p>

            <div className="flex items-center gap-4 w-full">
              <button 
                type="button"
                onClick={() => { setIsConfirmModalOpen(false); setSelectedCard(null); }}
                className="flex-1 font-plus-jakarta font-bold text-sm text-[#502D55] border-2 border-[#502D55]/80 hover:bg-[#502D55]/5 py-3.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
              >
                Cancel
              </button>
              
              <button 
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 font-plus-jakarta font-bold text-sm text-white bg-[#935073] hover:bg-[#935073]/95 py-3.5 rounded-xl transition-all shadow-md shadow-[#935073]/10 active:scale-[0.98] cursor-pointer"
              >
                Move to Trash
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Main Workspace (Left Side) */}
      <div className="flex-1 p-8 md:p-12 overflow-y-auto flex flex-col justify-between h-screen">
        
        <div>
          {/* Header Action Bar */}
          <div className="flex justify-between items-center mb-8 print:hidden">
            {/* Top-left Back button */}
            <button 
              onClick={() => onViewChange('dashboard')}
              className="w-11 h-11 border-2 border-[#502D55] rounded-xl flex items-center justify-center text-[#502D55] hover:bg-[#502D55]/5 transition-all duration-200 active:scale-[0.97] group cursor-pointer"
            >
              <span className="transform group-hover:-translate-x-0.5 transition-transform duration-200">
                <BackIcon />
              </span>
            </button>

            {/* Quick Actions */}
            <button 
              onClick={() => onViewChange('file')}
              className="flex items-center gap-2 bg-[#502D55] hover:bg-[#502D55]/95 text-white font-plus-jakarta font-bold text-xs px-5 py-3 rounded-xl transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              <span>+ Create Note</span>
            </button>
          </div>

          {/* Premium Collaborative Team Banner Header Card */}
          <div className="w-full max-w-[1200px] mx-auto bg-[#FAF6F2] border border-[#502D55]/5 rounded-[32px] p-6 md:p-8 shadow-sm mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in">
            <div>
              <h1 className="font-plus-jakarta font-extrabold text-3xl md:text-[38px] text-[#502D55] tracking-tight leading-none">
                Your Team Name
              </h1>
              <p className="font-hanken text-xs text-[#502D55]/60 mt-2 font-semibold">
                Established May 18, 2026 • Registered Academic Group
              </p>
            </div>

            {/* Team Metrics Stack */}
            <div className="flex flex-wrap items-center gap-6 md:gap-8 border-t md:border-t-0 md:border-l border-[#502D55]/10 pt-4 md:pt-0 md:pl-8">
              <div className="text-center md:text-left">
                <span className="font-plus-jakarta text-[10px] font-bold text-[#502D55]/50 uppercase tracking-wider block">FILES</span>
                <span className="font-plus-jakarta font-black text-2xl text-[#502D55]">{cards.length} Docs</span>
              </div>
              <div className="text-center md:text-left">
                <span className="font-plus-jakarta text-[10px] font-bold text-[#502D55]/50 uppercase tracking-wider block">RECIPIENTS</span>
                <span className="font-plus-jakarta font-black text-2xl text-[#502D55]">{recipients.length} Emails</span>
              </div>
            </div>
          </div>

          {/* Premium Search and Filtering Toolbar Bar */}
          <div className="w-full max-w-[1200px] mx-auto bg-[#FAF6F2]/60 border border-[#502D55]/5 rounded-2xl p-4 mb-8 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 print:hidden">
            {/* Live Search Input */}
            <div className="flex-1 relative flex items-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-[#502D55]/40 absolute left-4.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input 
                type="text" 
                placeholder="Search documents and preview descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAF6F2]/30 border-2 border-[#502D55]/15 focus:border-[#502D55]/40 focus:outline-none rounded-xl pl-11 pr-4 py-2.5 font-hanken text-sm text-[#502D55] placeholder-[#502D55]/40 transition-colors"
              />
            </div>

            {/* Filtering tab links */}
            <div className="flex items-center bg-[#502D55]/5 p-1 rounded-xl gap-1">
              <button 
                onClick={() => setFilterType('all')}
                className={`font-plus-jakarta font-bold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  filterType === 'all' ? 'bg-white text-[#502D55] shadow-sm' : 'text-[#502D55]/60 hover:text-[#502D55]'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setFilterType('draft')}
                className={`font-plus-jakarta font-bold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  filterType === 'draft' ? 'bg-white text-[#502D55] shadow-sm' : 'text-[#502D55]/60 hover:text-[#502D55]'
                }`}
              >
                Drafts
              </button>
              <button 
                onClick={() => setFilterType('mom')}
                className={`font-plus-jakarta font-bold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  filterType === 'mom' ? 'bg-white text-[#502D55] shadow-sm' : 'text-[#502D55]/60 hover:text-[#502D55]'
                }`}
              >
                MOM Only
              </button>
            </div>
          </div>

          {/* Dynamic 8-Card Document Grid */}
          {filteredCards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1200px] mx-auto w-full animate-fade-in pb-16">
              {filteredCards.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onViewChange('file')}
                  className="bg-[#FAF6F2] hover:scale-[1.015] hover:shadow-md hover:bg-[#FAF6F2]/95 rounded-[24px] p-6 min-h-[220px] flex flex-col justify-between transition-all duration-300 shadow-sm border-t-[5px] border-x border-b border-[#502D55]/5 group relative cursor-pointer"
                  style={{ borderTopColor: item.type === 'mom' ? '#502D55' : '#935073' }}
                >
                  
                  {/* Absolute positioned hoverable trash icon */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); openDeleteModal(item); }}
                    className="absolute top-4.5 right-4.5 p-2 rounded-xl bg-[#935073]/10 hover:bg-[#935073]/20 text-[#935073] opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer z-10"
                    title="Move to Trash"
                  >
                    <TrashIcon />
                  </button>

                  <div>
                    {/* Badge Indicator Header */}
                    <div className="flex justify-between items-center mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold font-plus-jakarta uppercase tracking-wider ${
                        item.type === 'mom' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <h3 className="font-plus-jakarta font-extrabold text-base text-[#502D55] leading-snug group-hover:text-[#935073] transition-colors duration-200">
                      {item.title}
                    </h3>
                    
                    {/* Real structured text preview */}
                    <p className="font-hanken text-[11px] text-[#502D55]/65 mt-2 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                  
                  {/* Premium details bottom strip */}
                  <div className="mt-4 pt-3.5 border-t border-[#502D55]/5 flex items-center justify-between text-[10px] font-bold font-plus-jakarta text-[#502D55]/50">
                    <span className="font-hanken font-semibold text-[#502D55]/60">{item.edited}</span>
                    
                    {item.type === 'mom' && (
                      <div className="flex items-center gap-2 text-[#502D55]/70">
                        <span className="bg-[#502D55]/5 px-1.5 py-0.5 rounded flex items-center gap-0.5" title="Action Items">
                          ✦ {item.actionsCount}
                        </span>
                        <span className="bg-[#502D55]/5 px-1.5 py-0.5 rounded flex items-center gap-0.5" title="Decisions">
                          ✓ {item.decisionsCount}
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          ) : (
            /* Premium Empty Workspace View */
            <div className="flex flex-col items-center justify-center text-center py-16 animate-fade-in max-w-sm mx-auto">
              <div className="w-16 h-16 bg-[#502D55]/5 rounded-full flex items-center justify-center text-[#502D55]/60 mb-6 animate-pulse">
                <FileIcon />
              </div>
              <h3 className="font-plus-jakarta font-bold text-xl text-[#502D55] mb-2">No documents found</h3>
              <p className="font-hanken text-sm text-[#502D55]/60 leading-relaxed mb-6">
                Try adjusting your search criteria or filter options to locate your meeting files.
              </p>
              <button 
                onClick={() => { setSearchQuery(""); setFilterType('all'); }}
                className="bg-[#502D55] hover:bg-[#502D55]/95 text-white font-plus-jakarta font-bold text-xs py-3 px-6 rounded-xl transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Recipient Sidebar (Right Side - Premium Command Board Fixed in Place) */}
      <aside className="w-80 bg-[var(--tertiarycolor)] flex flex-col p-8 border-l border-[#502D55]/5 h-screen overflow-y-auto flex-shrink-0 print:hidden justify-between">
        
        <div>
          {/* Premium MOM Structure Selector Card */}
          <div className="bg-[#502D55] text-white p-5 rounded-[24px] shadow-lg relative overflow-hidden mb-8">
            <span className="bg-white/10 text-white font-plus-jakarta text-[8.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider block w-max mb-3">
              MOM Engine Config
            </span>
            
            <h3 className="font-plus-jakarta font-extrabold text-base text-[#FFEEDF] mb-1.5 leading-none">
              MOM Structure
            </h3>
            <p className="font-hanken text-[10px] text-[#FFEEDF]/75 mb-4 leading-normal">
              Select the outline format for all automated minutes.
            </p>

            {/* Radio / Tab selectors stack */}
            <div className="flex flex-col gap-2">
              <button 
                type="button"
                onClick={() => handleStructureChange('standard')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-plus-jakarta text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                  momStructure === 'standard' ? 'bg-[#FAF6F2] text-[#502D55] shadow-sm' : 'bg-white/5 text-[#FFEEDF]/80 hover:bg-white/10 border border-white/5'
                }`}
              >
                <span>Standard (Summary & Tasks)</span>
                {momStructure === 'standard' && <span className="text-[10px]">✓</span>}
              </button>

              <button 
                type="button"
                onClick={() => handleStructureChange('detailed')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-plus-jakarta text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                  momStructure === 'detailed' ? 'bg-[#FAF6F2] text-[#502D55] shadow-sm' : 'bg-white/5 text-[#FFEEDF]/80 hover:bg-white/10 border border-white/5'
                }`}
              >
                <span>Detailed (Discussion + Tasks)</span>
                {momStructure === 'detailed' && <span className="text-[10px]">✓</span>}
              </button>

              <button 
                type="button"
                onClick={() => handleStructureChange('concise')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-plus-jakarta text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                  momStructure === 'concise' ? 'bg-[#FAF6F2] text-[#502D55] shadow-sm' : 'bg-white/5 text-[#FFEEDF]/80 hover:bg-white/10 border border-white/5'
                }`}
              >
                <span>Concise (Key Action Points)</span>
                {momStructure === 'concise' && <span className="text-[10px]">✓</span>}
              </button>
            </div>
          </div>

          {/* Add Email Action Trigger */}
          <div className="mb-8">
            {!showInput ? (
              <button 
                onClick={() => setShowInput(true)}
                className="w-full bg-[#935073] hover:bg-[#935073]/95 text-white font-plus-jakarta font-bold text-sm py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#935073]/15 active:scale-[0.99] cursor-pointer"
              >
                Add email
              </button>
            ) : (
              <form onSubmit={handleAddEmail} className="flex flex-col gap-2 bg-[#FAF6F2]/30 p-3.5 rounded-xl border border-[#502D55]/10 animate-fade-in">
                <input 
                  type="email"
                  required
                  placeholder="Enter collaborator email..."
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#FAF5F0] border-2 border-[#502D55] rounded-lg px-3 py-2 text-xs text-[#502D55] placeholder-[#B6B6B6] font-hanken focus:outline-none"
                />
                <div className="flex gap-2 justify-end">
                  <button 
                    type="button" 
                    onClick={() => setShowInput(false)}
                    className="font-plus-jakarta text-[11px] font-bold text-[#502D55]/70 hover:text-[#502D55] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-[#502D55] text-white font-plus-jakarta text-[11px] font-bold px-3 py-1.5 rounded-md hover:bg-[#502D55]/95 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Recipient's Email Stack */}
          <div className="flex flex-col gap-4 border-t border-[#502D55]/10 pt-6">
            <div>
              <h2 className="font-plus-jakarta font-bold text-sm text-[#502D55] tracking-tight">
                Recipient's Email
              </h2>
              <span className="font-hanken text-[9.5px] text-[#502D55]/50 block font-semibold mt-0.5">
                Automated distribution list
              </span>
            </div>
            
            <div className="flex flex-col gap-2.5">
              {recipients.map((email, idx) => (
                <div 
                  key={idx}
                  className="w-full bg-[#FAF6F2]/90 border border-[#502D55]/5 rounded-xl p-3 flex items-center justify-between transition-all shadow-sm group/pill relative animate-fade-in"
                >
                  <span className="truncate max-w-[180px] text-xs font-bold text-[#502D55] font-hanken">{email}</span>
                  <button 
                    type="button"
                    onClick={() => removeRecipient(idx)}
                    className="w-4.5 h-4.5 bg-[#502D55]/5 hover:bg-[#935073]/15 text-[#502D55]/70 hover:text-[#935073] rounded-full flex items-center justify-center transition-colors text-[9px] font-bold flex-shrink-0 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Small bottom brand indicator */}
        <div className="text-center mt-12 border-t border-[#502D55]/10 pt-6 text-[10px] font-bold text-[#502D55]/30 font-plus-jakarta">
          DISPATCH ENGINE ACTIVE
        </div>

      </aside>

    </div>
  );
}
