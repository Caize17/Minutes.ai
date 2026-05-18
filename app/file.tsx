"use client";

import { useState } from "react";

// Icons
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

interface FileProps {
  onViewChange: (view: 'home' | 'login' | 'signup' | 'dashboard' | 'team' | 'file' | 'about' | 'creators' | 'trash') => void;
}

export default function File({ onViewChange }: FileProps) {
  const [activeTab, setActiveTab] = useState<'draft' | 'mom'>('draft');
  const [showNotification, setShowNotification] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [emails, setEmails] = useState<string[]>([
    "clara.santos@mail.com",
    "marcelo.cruz@mail.com",
    "marcos.perez@mail.com"
  ]);
  const [newEmail, setNewEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);

  // AI automation simulation states
  const [isAutomating, setIsAutomating] = useState(false);
  const [automationProgress, setAutomationProgress] = useState(0);
  const [automationStage, setAutomationStage] = useState('');

  const handleAutomateMOM = () => {
    setIsAutomating(true);
    setAutomationProgress(0);
    setAutomationStage('Analyzing draft text...');
    
    setTimeout(() => {
      setAutomationProgress(30);
      setAutomationStage('Extracting key tasks...');
    }, 700);

    setTimeout(() => {
      setAutomationProgress(65);
      setAutomationStage('Building decisions matrix...');
    }, 1400);

    setTimeout(() => {
      setAutomationProgress(90);
      setAutomationStage('Structuring MOM layout...');
    }, 2100);

    setTimeout(() => {
      setAutomationProgress(100);
      setIsAutomating(false);
      setActiveTab('mom');
    }, 2800);
  };

  const handleSend = () => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newEmail.trim();
    if (trimmed && trimmed.includes("@")) {
      setEmails([...emails, trimmed]);
      setNewEmail("");
      setShowEmailInput(false);
    }
  };

  const removeEmail = (indexToRemove: number) => {
    setEmails(emails.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSavePDF = () => {
    setIsGeneratingPDF(true);
    setTimeout(() => {
      setIsGeneratingPDF(false);
      window.print();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FFEEDF] flex selection:bg-[#935073]/20 relative overflow-hidden">
      
      {/* PDF Generation Loading Overlay */}
      {isGeneratingPDF && (
        <div className="fixed inset-0 bg-[#502D55]/60 backdrop-blur-md flex flex-col items-center justify-center z-50 text-white gap-4 transition-all duration-200">
          <div className="w-12 h-12 border-4 border-[#F3DDC8] border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <p className="font-plus-jakarta font-extrabold text-lg text-[#FFEEDF] tracking-wide">Generating PDF...</p>
            <p className="font-hanken text-xs text-[#FFEEDF]/75 mt-1">Formatting meeting minutes document layout</p>
          </div>
        </div>
      )}

      {/* Top Banner Success Notification */}
      {showNotification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-[#502D55] border border-[#FFEEDF]/15 text-[#FFEEDF] px-6 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-bounce">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#F3DDC8]">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <span className="font-plus-jakarta font-bold text-sm">Meeting Minutes successfully distributed to all recipients!</span>
        </div>
      )}

      {/* Main Document Workspace (Left Side) */}
      <div className="flex-1 p-8 md:p-12 pb-24 mr-80 print:mr-0 overflow-y-auto relative flex flex-col justify-between h-screen">
        
        <div>
          {/* Header Bar: Back Button & Tabs (Now fully wide and aligned matching outer container) */}
          <div className="flex items-center gap-8 mb-12 print:hidden w-full">
            <button 
              onClick={() => onViewChange('team')}
              className="w-11 h-11 border-2 border-[#502D55] rounded-xl flex items-center justify-center text-[#502D55] hover:bg-[#502D55]/5 transition-all duration-200 active:scale-[0.97] group cursor-pointer"
            >
              <span className="transform group-hover:-translate-x-0.5 transition-transform duration-200">
                <BackIcon />
              </span>
            </button>

            {/* Tab Switching Links */}
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setActiveTab('draft')}
                className={`font-plus-jakarta font-bold text-base pb-1.5 transition-all relative cursor-pointer ${
                  activeTab === 'draft' ? 'text-[#502D55]' : 'text-[#502D55]/50 hover:text-[#502D55]/85'
                }`}
              >
                Draft Note
                {activeTab === 'draft' && (
                  <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#502D55] rounded-full animate-fade-in" />
                )}
              </button>
              
              <button 
                onClick={() => setActiveTab('mom')}
                className={`font-plus-jakarta font-bold text-base pb-1.5 transition-all relative cursor-pointer ${
                  activeTab === 'mom' ? 'text-[#502D55]' : 'text-[#502D55]/50 hover:text-[#502D55]/85'
                }`}
              >
                Automated MOM
                {activeTab === 'mom' && (
                  <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#502D55] rounded-full animate-fade-in" />
                )}
              </button>
            </div>
          </div>

          {/* Centered Document Column Wrapper */}
          <div className="max-w-[760px] mx-auto w-full animate-fade-in">
            
            {/* Document Content Block */}
            <div className="w-full">
              <h1 className="font-plus-jakarta font-extrabold text-[#502D55] text-4xl md:text-[45px] tracking-tight leading-none mb-2">
                Relation's Meeting
              </h1>
              <p className="font-hanken text-sm text-[#502D55]/65 font-bold mb-8 uppercase tracking-wider">
                May 17, 2026
              </p>

              {/* Draft Note Raw State */}
              {activeTab === 'draft' ? (
                <div className="flex flex-col gap-6 font-hanken text-[15.5px] text-[#502D55]/85 leading-relaxed">
                  <p>
                    Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
                  </p>
                </div>
              ) : (
                /* PROPER FORMATTED AUTOMATED MOM STATE */
                <div className="bg-[#FAF6F2] rounded-[24px] p-6 md:p-8 border border-[#502D55]/5 shadow-lg shadow-[#502D55]/3 flex flex-col gap-6 animate-fade-in text-[#502D55]">
                  
                  {/* Header Row with Save to PDF */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#502D55]/10 pb-4">
                    <h2 className="font-plus-jakarta font-extrabold text-xl text-[#502D55]">Automated Minutes of Meeting</h2>
                    
                    <button 
                      onClick={handleSavePDF}
                      className="flex items-center gap-2 bg-[#502D55] hover:bg-[#502D55]/95 text-white font-plus-jakarta font-bold text-xs px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-[#502D55]/10 active:scale-[0.98] cursor-pointer print:hidden"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>Save to PDF</span>
                    </button>
                  </div>
                  
                  {/* Metabar */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-b border-[#502D55]/10 pb-6 text-sm">
                    <div>
                      <span className="font-plus-jakarta font-bold block text-[10px] tracking-wider text-[#502D55]/50 uppercase">Date</span>
                      <span className="font-hanken font-bold">May 17, 2026</span>
                    </div>
                    <div>
                      <span className="font-plus-jakarta font-bold block text-[10px] tracking-wider text-[#502D55]/50 uppercase">Facilitator</span>
                      <span className="font-hanken font-bold">Juan Dela Cruz</span>
                    </div>
                    <div>
                      <span className="font-plus-jakarta font-bold block text-[10px] tracking-wider text-[#502D55]/50 uppercase">Meeting Type</span>
                      <span className="font-hanken font-bold">Strategic Review</span>
                    </div>
                  </div>

                  {/* Section 1: Overview */}
                  <div>
                    <h3 className="font-plus-jakarta font-bold text-lg mb-2">1. Overview & Objectives</h3>
                    <p className="font-hanken text-[14.5px] text-[#502D55]/85 leading-relaxed">
                      The committee convened to review key system automation rules and establish timeline markers for the upcoming June rollout. Designated designs are slated for rapid prototyping inside integrated flat directories to optimize tooling performance.
                    </p>
                  </div>

                  {/* Section 2: Key Decisions */}
                  <div>
                    <h3 className="font-plus-jakarta font-bold text-lg mb-2.5">2. Key Decisions Made</h3>
                    <ul className="list-disc pl-5 flex flex-col gap-2 font-hanken text-[14.5px] text-[#502D55]/85 leading-relaxed">
                      <li>
                        <strong>Architecture Standards:</strong> Finalized flat folder routing scheme within Next.js directories for rapid, hot-reload efficiency.
                      </li>
                      <li>
                        <strong>Design Identity:</strong> Selected warm peach and cream background grids with aubergine labels to assure maximum design elegance.
                      </li>
                    </ul>
                  </div>

                  {/* Section 3: Action Items Table */}
                  <div>
                    <h3 className="font-plus-jakarta font-bold text-lg mb-3">3. Action Items & Timeline</h3>
                    <div className="w-full overflow-x-auto rounded-xl border border-[#502D55]/10">
                      <table className="w-full text-left border-collapse text-xs font-hanken">
                        <thead>
                          <tr className="bg-[#502D55]/5 border-b border-[#502D55]/10 text-[#502D55]/70 font-plus-jakarta font-bold">
                            <th className="p-3">Action Item / Task</th>
                            <th className="p-3">Assigned Lead</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Due Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#502D55]/5">
                          <tr>
                            <td className="p-3 font-semibold">Build client dynamic routers</td>
                            <td className="p-3">Camille</td>
                            <td className="p-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">Completed</span></td>
                            <td className="p-3">May 18, 2026</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold">Integrate AI Automation Tagging</td>
                            <td className="p-3">Juan Dela Cruz</td>
                            <td className="p-3"><span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">In Progress</span></td>
                            <td className="p-3">May 25, 2026</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold">Run final production test suite</td>
                            <td className="p-3">Admin Committee</td>
                            <td className="p-3"><span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[10px] font-bold">Pending</span></td>
                            <td className="p-3">June 01, 2026</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Luxurious breathing room bottom spacer to avoid scroll boundary cut-off */}
            <div className="h-28 w-full print:hidden flex-shrink-0" />

          </div>

          {/* Floating Text Styling Editor (Only visible on Draft Note state) */}
          {activeTab === 'draft' && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-[#502D55] text-white px-6 py-4 rounded-full flex items-center justify-between gap-5 shadow-2xl border border-white/5 w-max max-w-full overflow-x-auto selection:bg-white/20 print:hidden z-30">
              {/* Bold Italic Underline */}
              <div className="flex items-center gap-4 border-r border-white/10 pr-4">
                <button className="font-plus-jakarta font-black hover:opacity-85 text-base transition-opacity px-1 cursor-pointer" data-tooltip="Bold" title="Bold">B</button>
                <button className="font-plus-jakarta italic hover:opacity-85 text-base transition-opacity px-1 cursor-pointer" data-tooltip="Italic" title="Italic">I</button>
                <button className="font-plus-jakarta underline hover:opacity-85 text-base transition-opacity px-1 cursor-pointer" data-tooltip="Underline" title="Underline">U</button>
              </div>
              {/* Alignments */}
              <div className="flex items-center gap-3 border-r border-white/10 pr-4">
                <button className="hover:opacity-85 transition-opacity cursor-pointer" data-tooltip="Align Left" title="Align Left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
                </button>
                <button className="hover:opacity-85 transition-opacity cursor-pointer" data-tooltip="Align Center" title="Align Center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>
                </button>
                <button className="hover:opacity-85 transition-opacity cursor-pointer" data-tooltip="Align Right" title="Align Right">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
                </button>
              </div>
              {/* Indents */}
              <div className="flex items-center gap-3 border-r border-white/10 pr-4">
                <button className="hover:opacity-85 transition-opacity cursor-pointer" data-tooltip="Decrease Indent" title="Decrease Indent">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M11 17l-5-5 5-5M18 12H6"/></svg>
                </button>
                <button className="hover:opacity-85 transition-opacity cursor-pointer" data-tooltip="Increase Indent" title="Increase Indent">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M13 17l5-5-5-5M6 12h12"/></svg>
                </button>
              </div>
              {/* Lists */}
              <div className="flex items-center gap-3 border-r border-white/10 pr-4">
                <button className="font-plus-jakarta font-extrabold text-xs hover:opacity-85 transition-opacity cursor-pointer" data-tooltip="Bullet List" title="Bullet List">• List</button>
                <button className="font-plus-jakarta font-extrabold text-xs hover:opacity-85 transition-opacity cursor-pointer" data-tooltip="Numbered List" title="Numbered List">1. List</button>
              </div>
              {/* Headers */}
              <div className="flex items-center gap-2">
                <button className="font-plus-jakarta font-bold text-xs hover:opacity-85 transition-opacity cursor-pointer" data-tooltip="Header 1" title="Header 1">H1</button>
                <button className="font-plus-jakarta font-bold text-xs hover:opacity-85 transition-opacity cursor-pointer" data-tooltip="Header 2" title="Header 2">H2</button>
                <button className="font-plus-jakarta font-bold text-xs hover:opacity-85 transition-opacity cursor-pointer" data-tooltip="Header 3" title="Header 3">H3</button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Recipient Sidebar (Right Side - Premium Command Board Fixed in Place) */}
      <aside className="fixed right-0 top-0 bottom-0 w-80 bg-[var(--tertiarycolor)] flex flex-col p-8 border-l border-[#502D55]/5 h-screen overflow-y-auto justify-between print:hidden z-25">
        
        <div>
          {/* Premium AI Automation Command Hub Card */}
          <div className="bg-[#502D55] text-white p-5 rounded-[24px] shadow-lg relative overflow-hidden mb-8">
            <span className="bg-white/10 text-white font-plus-jakarta text-[8.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider block w-max mb-3">
              Minutes Engine v1.0
            </span>
            
            <h3 className="font-plus-jakarta font-extrabold text-base text-[#FFEEDF] mb-1.5 leading-none">
              AI Automator
            </h3>
            <p className="font-hanken text-[10px] text-[#FFEEDF]/75 mb-5 leading-normal">
              Extract action items and format structured minutes automatically in seconds.
            </p>

            {!isAutomating ? (
              <button 
                onClick={handleAutomateMOM}
                className="w-full bg-[#FAF6F2] hover:bg-white text-[#502D55] font-plus-jakarta font-bold text-xs py-3 rounded-xl transition-all duration-200 shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#502D55]">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                <span>Automate MOM</span>
              </button>
            ) : (
              /* Premium AI Generation Shimmer Progress Screen */
              <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2.5 animate-pulse">
                <div className="flex justify-between items-center text-[10px] font-bold font-plus-jakarta text-white/90">
                  <span className="truncate max-w-[150px]">{automationStage}</span>
                  <span>{automationProgress}%</span>
                </div>
                {/* Glowing progress tracking bar */}
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#FAF6F2] transition-all duration-300"
                    style={{ width: `${automationProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Recipient's Email Stack */}
          <div className="flex flex-col gap-4 mt-8 border-t border-[#502D55]/10 pt-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-plus-jakarta font-bold text-sm text-[#502D55] tracking-tight">
                  Recipient's Email
                </h2>
                <span className="font-hanken text-[9.5px] text-[#502D55]/50 block font-semibold mt-0.5">
                  Automated distribution list
                </span>
              </div>
              
              <button 
                onClick={() => setShowEmailInput(!showEmailInput)}
                className="w-6 h-6 rounded-full border border-[#502D55]/20 flex items-center justify-center text-[#502D55] hover:text-[#502D55] hover:bg-[#502D55]/5 transition-colors font-bold text-base cursor-pointer"
                title="Add Recipient Address"
              >
                +
              </button>
            </div>

            {/* Email form display inline */}
            {showEmailInput && (
              <form onSubmit={handleAddEmail} className="flex flex-col gap-2 bg-[#FAF6F2]/30 p-3 rounded-lg border border-[#502D55]/10 animate-fade-in">
                <input 
                  type="email"
                  required
                  placeholder="Enter email..."
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#FAF5F0] border-2 border-[#502D55] rounded-md px-2 py-1.5 text-xs text-[#502D55] placeholder-[#B6B6B6] font-hanken focus:outline-none"
                />
                <button 
                  type="submit" 
                  className="bg-[#502D55] text-white font-plus-jakarta text-[10px] font-bold py-1.5 rounded-lg hover:bg-[#502D55]/95 cursor-pointer"
                >
                  Add Recipient
                </button>
              </form>
            )}
            
            {/* Elegant Distribution email pills */}
            <div className="flex flex-col gap-2.5">
              {emails.map((email, idx) => (
                <div 
                  key={idx}
                  className="w-full bg-[#FAF6F2]/90 border border-[#502D55]/5 rounded-xl p-3 flex items-center justify-between transition-all shadow-sm group/pill relative animate-fade-in"
                >
                  <span className="truncate max-w-[180px] text-xs font-bold text-[#502D55] font-hanken">{email}</span>
                  <button 
                    type="button"
                    onClick={() => removeEmail(idx)}
                    className="w-4.5 h-4.5 bg-[#502D55]/5 hover:bg-[#935073]/15 text-[#502D55]/70 hover:text-[#935073] rounded-full flex items-center justify-center transition-colors text-[9px] font-bold flex-shrink-0 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Document Stats & Send Actions Block */}
        <div className="mt-8 border-t border-[#502D55]/10 pt-6">
          <div className="bg-[#FAF6F2]/40 rounded-xl p-3 border border-[#502D55]/5 mb-4 flex flex-col gap-2">
            <span className="font-plus-jakarta text-[8px] font-bold text-[#502D55]/40 uppercase tracking-wider block">QUICK FILE STATS</span>
            <div className="flex justify-between items-center text-[10px] font-bold text-[#502D55]/60 font-hanken">
              <span>Reading time</span>
              <span>~3 min read</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold text-[#502D55]/60 font-hanken">
              <span>Word count</span>
              <span>420 words</span>
            </div>
          </div>

          <button 
            onClick={() => setIsSendModalOpen(true)}
            className="w-full bg-[#935073] hover:bg-[#935073]/95 text-white font-plus-jakarta font-bold text-sm py-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#935073]/15 active:scale-[0.99] cursor-pointer"
          >
            Send to Team
          </button>
        </div>

      </aside>

      {/* Send to Team Confirmation Modal Overlay */}
      {isSendModalOpen && (
        <div className="fixed inset-0 bg-[#502D55]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200">
          
          {/* Modal Container */}
          <div className="w-full max-w-[500px] bg-[#FAF6F2] rounded-[32px] p-8 md:p-10 shadow-2xl border border-[#502D55]/5 transform transition-all scale-100 flex flex-col items-center text-center">
            
            {/* Tilted Paper Airplane Icon */}
            <div className="mb-6 text-[#502D55] bg-[#F3DDC8]/20 p-5 rounded-full">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 transform -rotate-[28deg]">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </div>

            {/* Header */}
            <h2 className="font-plus-jakarta font-extrabold text-[#502D55] text-3xl tracking-tight mb-4">
              Send to Team?
            </h2>

            {/* Subtitle description */}
            <p className="font-hanken text-sm text-[#502D55]/85 leading-relaxed max-w-sm mb-8">
              This will email the meeting summary, key action items, and full transcript to the <strong className="font-bold text-[#502D55]">{emails.length} members</strong> of the <strong className="font-bold text-[#502D55]">Relation's Meeting</strong> team.
            </p>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-4 w-full">
              <button 
                type="button"
                onClick={() => setIsSendModalOpen(false)}
                className="flex-1 font-plus-jakarta font-bold text-sm text-[#502D55] border-2 border-[#502D55]/80 hover:bg-[#502D55]/5 py-3.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
              >
                Close
              </button>
              
              <button 
                type="button"
                onClick={() => { setIsSendModalOpen(false); handleSend(); }}
                className="flex-1 font-plus-jakarta font-bold text-sm text-white bg-[#502D55] hover:bg-[#502D55]/95 py-3.5 rounded-xl transition-all shadow-md shadow-[#502D55]/10 active:scale-[0.98] cursor-pointer"
              >
                Confirm
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
