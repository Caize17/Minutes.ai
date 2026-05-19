"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "../backend/supabase/client";

// Icons
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

interface FileProps {
  onViewChange: (view: 'home' | 'login' | 'signup' | 'dashboard' | 'team' | 'file' | 'about' | 'creators' | 'trash') => void;
  fileId?: string | null;
  onSelectTeam?: (id: string | null) => void;

  // Local states
  teams?: any[];
  documents?: any[];
  onUpdateTeams?: (newTeams: any[]) => void;
  onUpdateDocuments?: (newDocs: any[]) => void;
}

export default function File({
  onViewChange,
  fileId,
  onSelectTeam,
  teams = [],
  documents = [],
  onUpdateTeams,
  onUpdateDocuments
}: FileProps) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const [activeTab, setActiveTab] = useState<'draft' | 'mom'>('draft');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("Meeting Minutes successfully distributed to all recipients!");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  const [fileName, setFileName] = useState("Untitled Meeting");
  const [fileDate, setFileDate] = useState("May 17, 2026");
  const [draftContent, setDraftContent] = useState("");
  const [momContent, setMomContent] = useState<any>(null);
  const [activeTeamName, setActiveTeamName] = useState("Your Team");
  const [facilitator, setFacilitator] = useState("AI Assistant");
  const [meetingType, setMeetingType] = useState("Automated MOM");

  const editorRef = useRef<HTMLDivElement>(null);

  const applyStyle = (format: string) => {
    if (typeof document === 'undefined') return;

    if (editorRef.current) {
      editorRef.current.focus();
    }

    if (format === 'bold') {
      document.execCommand('bold', false);
    } else if (format === 'italic') {
      document.execCommand('italic', false);
    } else if (format === 'underline') {
      document.execCommand('underline', false);
    } else if (format === 'h1') {
      document.execCommand('formatBlock', false, '<h1>');
    } else if (format === 'h2') {
      document.execCommand('formatBlock', false, '<h2>');
    } else if (format === 'h3') {
      document.execCommand('formatBlock', false, '<h3>');
    } else if (format === 'bullet') {
      document.execCommand('insertUnorderedList', false);
    } else if (format === 'number') {
      document.execCommand('insertOrderedList', false);
    } else if (format === 'left') {
      document.execCommand('justifyLeft', false);
    } else if (format === 'center') {
      document.execCommand('justifyCenter', false);
    } else if (format === 'right') {
      document.execCommand('justifyRight', false);
    } else if (format === 'indent') {
      document.execCommand('indent', false);
    } else if (format === 'outdent') {
      document.execCommand('outdent', false);
    }

    // Save and record HTML changes
    if (editorRef.current) {
      const newHTML = editorRef.current.innerHTML;
      setDraftContent(newHTML);

      let activeFileId = fileId;
      if (!activeFileId && documents.length > 0) {
        activeFileId = documents[0].id;
      }
      if (activeFileId && onUpdateDocuments) {
        const updatedDocs = documents.map(doc => {
          if (doc.id === activeFileId) {
            return { ...doc, content: newHTML, updated_at: new Date().toISOString() };
          }
          return doc;
        });
        onUpdateDocuments(updatedDocs);
      }
    }
  };

  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const getWordCount = () => {
    if (!draftContent) return 0;
    // Strip HTML tags to count actual text words accurately
    const cleanText = draftContent.replace(/<[^>]*>/g, ' ');
    const words = cleanText.trim().split(/\s+/).filter(w => w.length > 0);
    return words.length;
  };

  const getReadingTime = () => {
    const words = getWordCount();
    return Math.max(1, Math.ceil(words / 200));
  };

  const lastLoadedFileIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    setIsLoading(true);
    let activeFileId = fileId;
    if (!activeFileId && documents.length > 0) {
      activeFileId = documents[0].id;
    }

    if (activeFileId) {
      const activeDoc = documents.find(d => d.id === activeFileId);
      if (activeDoc) {
        setFileName(activeDoc.title !== undefined && activeDoc.title !== null ? activeDoc.title : "Untitled Meeting");
        setFileDate(new Date(activeDoc.created_at).toLocaleDateString());
        setFacilitator(activeDoc.facilitator || "AI Assistant");
        setMeetingType(activeDoc.meeting_type || "Automated MOM");

        // ONLY update the editor and active tab if we're switching documents to fully prevent cursor jumps and tab snapping!
        if (lastLoadedFileIdRef.current !== activeFileId) {
          setDraftContent(activeDoc.content || "");
          if (editorRef.current) {
            editorRef.current.innerHTML = activeDoc.content || "";
          }

          if (activeDoc.type === 'mom') {
            setActiveTab('mom');
            setMomContent({
              overview: activeDoc.summary || "",
              decisions: activeDoc.decisions || [],
              actions: activeDoc.action_items || []
            });
          } else {
            setActiveTab('draft');
            setMomContent(null);
          }

          lastLoadedFileIdRef.current = activeFileId;
        }

        // Fetch team recipients from local state
        if (activeDoc.team_id) {
          const matchingTeam = teams.find(t => t.id === activeDoc.team_id);
          if (matchingTeam) {
            setEmails(matchingTeam.recipients || []);
            setActiveTeamName(matchingTeam.name || "Your Team");
          }
        }
      }
    }
    setIsLoading(false);
  }, [fileId, teams, documents]);

  // AI automation simulation states
  const [isAutomating, setIsAutomating] = useState(false);
  const [automationProgress, setAutomationProgress] = useState(0);
  const [automationStage, setAutomationStage] = useState('');

  const handleAutomateMOM = async () => {
    setIsAutomating(true);
    setAutomationProgress(0);
    setAutomationStage('Analyzing draft text...');

    let activeFileId = fileId;
    if (!activeFileId && documents.length > 0) {
      activeFileId = documents[0].id;
    }

    const activeDoc = documents.find(d => d.id === activeFileId);
    let currentStructure = 'standard';
    if (activeDoc?.team_id) {
      const matchingTeam = teams.find(t => t.id === activeDoc.team_id);
      if (matchingTeam) {
        currentStructure = matchingTeam.structure || 'standard';
      }
    }

    const progInterval = setInterval(() => {
      setAutomationProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 200);

    try {
      setAutomationStage('Connecting to Gemini AI...');

      // Clean HTML tags from the draft content so the AI only reads the raw text
      const cleanText = draftContent.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();

      console.log("[AI Automation] Sending request to endpoint:", `${API_BASE_URL}/automate`);
      console.log("[AI Automation] Clean transcript text size:", cleanText.length);

      const response = await fetch(`${API_BASE_URL}/automate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_text: cleanText,
          structure: currentStructure
        })
      });

      console.log("[AI Automation] Response status:", response.status, response.statusText);
      const data = await response.json().catch((e) => {
        console.warn("[AI Automation] Response is not valid JSON:", e);
        return {};
      });
      console.log("[AI Automation] Parsed response body data:", data);

      if (!response.ok) {
        throw new Error(data.detail || `Server error ${response.status}: AI Automation failed on the server.`);
      }

      clearInterval(progInterval);
      setAutomationProgress(100);
      setAutomationStage('Structuring MOM layout...');

      setTimeout(() => {
        setIsAutomating(false);
        setActiveTab('mom');

        const cleanDecisions = Array.isArray(data.decisions)
          ? data.decisions
          : typeof data.decisions === 'string'
            ? data.decisions.split('\n').filter(Boolean)
            : [];

        const generatedMOM = {
          overview: data.overview || "AI synthesized notes from the transcript.",
          decisions: cleanDecisions, // Guarded conversion array
          actions: Array.isArray(data.actions) ? data.actions : []
        };
        setMomContent(generatedMOM);

        if (activeFileId && onUpdateDocuments) {
          const updatedDocs = documents.map(doc => {
            if (doc.id === activeFileId) {
              return {
                ...doc,
                type: 'mom',
                summary: generatedMOM.overview,
                decisions: generatedMOM.decisions,
                action_items: generatedMOM.actions,
                updated_at: new Date().toISOString()
              };
            }
            return doc;
          });
          onUpdateDocuments(updatedDocs);
        }
      }, 500);

    } catch (err) {
      console.error(err);
      clearInterval(progInterval);
      setIsAutomating(false);
      setAutomationProgress(0);
      setAutomationStage('');

      setNotificationMessage("AI Automation failed. Please check your Gemini API key inside the local environment files.");
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 4500);
    }
  };

  const handleSend = async () => {
    setIsSendModalOpen(false);
    setShowNotification(true);
    setNotificationMessage("Preparing email package...");

    // Construct the MOM text to send
    const overviewText = momContent?.overview || draftContent;
    const decisionsText = momContent?.decisions?.map((d: string) => `• Decision: ${d}`).join('\n') || "";
    const actionsText = momContent?.actions?.map((a: any) => `• Task: ${a.task} | Lead: ${a.lead} | Status: ${a.status} | Due: ${a.due}`).join('\n') || "";

    const fullSummaryText = `
Subject: ${fileName}

SUMMARY OVERVIEW:
${overviewText}

KEY DECISIONS:
${decisionsText || "None recorded."}

ACTION ITEMS & TASK DELEGATION:
${actionsText || "None recorded."}
    `.trim();

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      console.log("[MOM Distribution] Sending request to endpoint:", `${API_BASE_URL}/send-email`);
      console.log("[MOM Distribution] Payload:", {
        summary_text: fullSummaryText,
        file_name: fileName,
        emails: emails,
        mom_content: momContent
      });

      const response = await fetch(`${API_BASE_URL}/send-email`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          summary_text: fullSummaryText,
          file_name: fileName,
          emails: emails,
          mom_content: momContent
        })
      });

      console.log("[MOM Distribution] Response status:", response.status, response.statusText);
      const data = await response.json().catch((e) => {
        console.warn("[MOM Distribution] Response is not valid JSON:", e);
        return {};
      });
      console.log("[MOM Distribution] Parsed response body data:", data);

      if (!response.ok) {
        throw new Error(data.message || data.detail || `Server error ${response.status}: Failed to distribute MOM.`);
      }
      setNotificationMessage(data.message || "MOM distributed successfully!");
    } catch (err: any) {
      console.error("[MOM Distribution] Error caught in UI handler:", err);
      setNotificationMessage(err.message || "Failed to distribute MOM.");
    }

    setTimeout(() => {
      setShowNotification(false);
    }, 4500);
  };

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newEmail.trim();
    if (trimmed && trimmed.includes("@")) {
      const updatedEmails = [...emails, trimmed];
      setEmails(updatedEmails);
      setNewEmail("");
      setShowEmailInput(false);

      // Symmetrically persist back to active team recipients
      let activeFileId = fileId;
      if (!activeFileId && documents.length > 0) {
        activeFileId = documents[0].id;
      }
      const activeDoc = documents.find(d => d.id === activeFileId);
      if (activeDoc?.team_id && onUpdateTeams) {
        const updatedTeams = teams.map(t => {
          if (t.id === activeDoc.team_id) {
            return { ...t, recipients: updatedEmails };
          }
          return t;
        });
        onUpdateTeams(updatedTeams);
      }
    }
  };

  const removeEmail = (indexToRemove: number) => {
    const updatedEmails = emails.filter((_, idx) => idx !== indexToRemove);
    setEmails(updatedEmails);

    // Symmetrically persist back to active team recipients
    let activeFileId = fileId;
    if (!activeFileId && documents.length > 0) {
      activeFileId = documents[0].id;
    }
    const activeDoc = documents.find(d => d.id === activeFileId);
    if (activeDoc?.team_id && onUpdateTeams) {
      const updatedTeams = teams.map(t => {
        if (t.id === activeDoc.team_id) {
          return { ...t, recipients: updatedEmails };
        }
        return t;
      });
      onUpdateTeams(updatedTeams);
    }
  };

  const handleSavePDF = () => {
    setIsGeneratingPDF(true);
    setTimeout(() => {
      setIsGeneratingPDF(false);
      window.print();
    }, 1500);
  };

  const handleDeleteDocument = () => {
    let activeFileId = fileId;
    if (!activeFileId && documents.length > 0) {
      activeFileId = documents[0].id;
    }
    if (!activeFileId) return;

    if (window.confirm("Are you sure you want to permanently delete this document?")) {
      if (onUpdateDocuments) {
        const updatedDocs = documents.filter(d => d.id !== activeFileId);
        onUpdateDocuments(updatedDocs);
      }
      onViewChange('team');
    }
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
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          <span className="font-plus-jakarta font-bold text-sm">{notificationMessage}</span>
        </div>
      )}

      {/* Main Document Workspace (Left Side) */}
      <div className="flex-1 p-8 md:p-12 pb-24 mr-80 print:mr-0 overflow-y-auto relative flex flex-col justify-between h-screen">

        <div>
          {/* Header Bar: Back Button & Tabs (Now fully wide and aligned matching outer container) */}
          <div className="flex items-center justify-between mb-12 print:hidden w-full">
            <div className="flex items-center gap-8">
              <button
                onClick={() => {
                  let activeFileId = fileId;
                  if (!activeFileId && documents.length > 0) {
                    activeFileId = documents[0].id;
                  }
                  const activeDoc = documents.find(d => d.id === activeFileId);
                  if (activeDoc?.team_id && onSelectTeam) {
                    onSelectTeam(activeDoc.team_id);
                  }
                  onViewChange('team');
                }}
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
                  className={`font-plus-jakarta font-bold text-base pb-1.5 transition-all relative cursor-pointer ${activeTab === 'draft' ? 'text-[#502D55]' : 'text-[#502D55]/50 hover:text-[#502D55]/85'
                    }`}
                >
                  Draft Note
                  {activeTab === 'draft' && (
                    <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#502D55] rounded-full animate-fade-in" />
                  )}
                </button>

                {momContent && (
                  <button
                    onClick={() => setActiveTab('mom')}
                    className={`font-plus-jakarta font-bold text-base pb-1.5 transition-all relative cursor-pointer ${activeTab === 'mom' ? 'text-[#502D55]' : 'text-[#502D55]/50 hover:text-[#502D55]/85'
                      }`}
                  >
                    Automated MOM
                    {activeTab === 'mom' && (
                      <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#502D55] rounded-full animate-fade-in" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={handleDeleteDocument}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 font-plus-jakarta font-bold text-xs rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2"
            >
              <TrashIcon />
              Delete Document
            </button>
          </div>

          {/* Centered Document Column Wrapper */}
          <div className="max-w-[760px] mx-auto w-full animate-fade-in">

            {/* Document Content Block */}
            <div className="w-full">
              <input
                type="text"
                value={fileName}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setFileName(newTitle);

                  let activeFileId = fileId;
                  if (!activeFileId && documents.length > 0) {
                    activeFileId = documents[0].id;
                  }
                  if (activeFileId && onUpdateDocuments) {
                    const updatedDocs = documents.map(doc => {
                      if (doc.id === activeFileId) {
                        return { ...doc, title: newTitle, updated_at: new Date().toISOString() };
                      }
                      return doc;
                    });
                    onUpdateDocuments(updatedDocs);
                  }
                }}
                className="font-plus-jakarta font-extrabold text-[#502D55] text-4xl md:text-[45px] tracking-tight leading-none mb-2 bg-transparent border-0 outline-none w-full p-0 focus:ring-0 focus:outline-none"
              />
              <p className="font-hanken text-sm text-[#502D55]/65 font-bold mb-8 uppercase tracking-wider">
                {fileDate}
              </p>

              {/* Draft Note Raw State */}
              <div className={`flex flex-col gap-6 font-hanken text-[15.5px] text-[#502D55]/85 leading-relaxed ${activeTab !== 'draft' ? 'hidden' : ''}`}>
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning={true}
                  onInput={(e) => {
                    const newContent = e.currentTarget.innerHTML;
                    setDraftContent(newContent);

                    let activeFileId = fileId;
                    if (!activeFileId && documents.length > 0) {
                      activeFileId = documents[0].id;
                    }
                    if (activeFileId && onUpdateDocuments) {
                      const updatedDocs = documents.map(doc => {
                        if (doc.id === activeFileId) {
                          return { ...doc, content: newContent, updated_at: new Date().toISOString() };
                        }
                        return doc;
                      });
                      onUpdateDocuments(updatedDocs);
                    }
                  }}
                  data-placeholder="Type or paste your meeting transcript notes here..."
                  className="w-full min-h-[400px] bg-transparent border-0 outline-none resize-none font-hanken text-[16px] text-[#502D55]/85 leading-relaxed placeholder-[#502D55]/30 focus:ring-0 focus:outline-none draft-editor empty:before:content-[attr(data-placeholder)] empty:before:text-[#502D55]/30 empty:before:pointer-events-none"
                />
              </div>

              {/* PROPER FORMATTED AUTOMATED MOM STATE */}
              {activeTab === 'mom' && (
                <div className="bg-[#FAF6F2] rounded-[24px] p-6 md:p-8 border border-[#502D55]/5 shadow-lg shadow-[#502D55]/3 flex flex-col gap-6 animate-fade-in text-[#502D55]">

                  {/* Header Row with Save to PDF */}
                  <div className="flex justify-end items-center gap-4 border-b border-[#502D55]/10 pb-4">

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



                  {/* Section 1: Overview */}
                  <div>
                    <h3 className="font-plus-jakarta font-bold text-lg mb-2">1. Overview & Objectives</h3>
                    <p className="font-hanken text-[14.5px] text-[#502D55]/85 leading-relaxed">
                      {momContent?.overview || "No overview summary synthesized yet."}
                    </p>
                  </div>

                  {/* Section 2: Key Decisions */}
                  <div>
                    <h3 className="font-plus-jakarta font-bold text-lg mb-2.5">2. Key Decisions Made</h3>
                    {momContent?.decisions && momContent.decisions.length > 0 ? (
                      <ul className="list-disc pl-5 flex flex-col gap-2 font-hanken text-[14.5px] text-[#502D55]/85 leading-relaxed">
                        {momContent.decisions.map((decision: string, idx: number) => (
                          <li key={idx}>
                            {decision.includes(":") ? (
                              <>
                                <strong>{decision.split(":")[0]}:</strong>
                                {decision.split(":").slice(1).join(":")}
                              </>
                            ) : (
                              decision
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="italic text-[#502D55]/55 text-sm">No decisions logged.</p>
                    )}
                  </div>

                  {/* Section 3: Action Items Table */}
                  <div>
                    <h3 className="font-plus-jakarta font-bold text-lg mb-3">3. Action Items & Timeline</h3>
                    <div className="w-full overflow-x-auto rounded-xl border border-[#502D55]/10">
                      <table className="w-full text-left border-collapse text-xs font-hanken">
                        <thead>
                          <tr className="bg-[#502D55]/5 border-b border-[#502D55]/10 text-[#502D55]/70 font-plus-jakarta font-bold">
                            <th className="p-3">Action Item / Task</th>
                            <th className="p-3 whitespace-nowrap">Assigned Lead</th>
                            <th className="p-3 whitespace-nowrap">Status</th>
                            <th className="p-3 whitespace-nowrap">Due Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#502D55]/5">
                          {momContent?.actions && momContent.actions.length > 0 ? (
                            momContent.actions.map((act: any, idx: number) => (
                              <tr key={idx}>
                                <td className="p-3 font-semibold">{act.task}</td>
                                <td className="p-3 whitespace-nowrap">{act.lead}</td>
                                <td className="p-3 whitespace-nowrap">
                                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold whitespace-nowrap inline-block ${
                                    act.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                                    act.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {act.status}
                                  </span>
                                </td>
                                <td className="p-3 whitespace-nowrap">{act.due}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="p-4 text-center italic text-[#502D55]/50">No action items defined.</td>
                            </tr>
                          )}
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
            <div className="fixed bottom-8 left-[calc(50%-160px)] transform -translate-x-1/2 bg-[#502D55] text-white px-6 py-4 rounded-full flex items-center justify-between gap-5 shadow-2xl border border-white/5 w-max max-w-full overflow-x-auto selection:bg-white/20 print:hidden z-30 animate-fade-in">
              {/* Bold Italic Underline */}
              <div className="flex items-center gap-4 border-r border-white/10 pr-4">
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('bold')} className="font-plus-jakarta font-black hover:opacity-85 text-base transition-opacity px-1 cursor-pointer" data-tooltip="Bold" title="Bold">B</button>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('italic')} className="font-plus-jakarta italic hover:opacity-85 text-base transition-opacity px-1 cursor-pointer" data-tooltip="Italic" title="Italic">I</button>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('underline')} className="font-plus-jakarta underline hover:opacity-85 text-base transition-opacity px-1 cursor-pointer" data-tooltip="Underline" title="Underline">U</button>
              </div>
              {/* Alignments */}
              <div className="flex items-center gap-3 border-r border-white/10 pr-4">
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('left')} className="hover:opacity-85 transition-opacity cursor-pointer" data-tooltip="Align Left" title="Align Left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg>
                </button>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('center')} className="hover:opacity-85 transition-opacity cursor-pointer" data-tooltip="Align Center" title="Align Center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" /></svg>
                </button>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('right')} className="hover:opacity-85 transition-opacity cursor-pointer" data-tooltip="Align Right" title="Align Right">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="21" y1="10" x2="7" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="7" y2="18" /></svg>
                </button>
              </div>
              {/* Indents */}
              <div className="flex items-center gap-3 border-r border-white/10 pr-4">
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('outdent')} className="hover:opacity-85 transition-opacity cursor-pointer" data-tooltip="Decrease Indent" title="Decrease Indent">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M11 17l-5-5 5-5M18 12H6" /></svg>
                </button>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('indent')} className="hover:opacity-85 transition-opacity cursor-pointer" data-tooltip="Increase Indent" title="Increase Indent">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M13 17l5-5-5-5M6 12h12" /></svg>
                </button>
              </div>
              {/* Lists */}
              <div className="flex items-center gap-3 border-r border-white/10 pr-4">
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('bullet')} className="font-plus-jakarta font-extrabold text-xs hover:opacity-85 transition-opacity cursor-pointer" data-tooltip="Bullet List" title="Bullet List">• List</button>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('number')} className="font-plus-jakarta font-extrabold text-xs hover:opacity-85 transition-opacity cursor-pointer" data-tooltip="Numbered List" title="Numbered List">1. List</button>
              </div>
              {/* Headers */}
              <div className="flex items-center gap-2">
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('h1')} className="font-plus-jakarta font-bold text-xs hover:opacity-85 transition-opacity cursor-pointer" data-tooltip="Header 1" title="Header 1">H1</button>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('h2')} className="font-plus-jakarta font-bold text-xs hover:opacity-85 transition-opacity cursor-pointer" data-tooltip="Header 2" title="Header 2">H2</button>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('h3')} className="font-plus-jakarta font-bold text-xs hover:opacity-85 transition-opacity cursor-pointer" data-tooltip="Header 3" title="Header 3">H3</button>
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
              <span>~{getReadingTime()} min read</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold text-[#502D55]/60 font-hanken">
              <span>Word count</span>
              <span>{getWordCount()} words</span>
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
              This will email the meeting summary, key action items, and full transcript to the <strong className="font-bold text-[#502D55]">{emails.length} members</strong> of the <strong className="font-bold text-[#502D55]">{activeTeamName}</strong> team.
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
