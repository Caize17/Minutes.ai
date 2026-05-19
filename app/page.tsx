"use client";

import { useState, useEffect } from "react";
import Login from "./login";
import Signup from "./signup";
import Dashboard from "./dashboard";
import Team from "./team";
import File from "./file";
import Trash from "./trash";
import { createClient } from "../backend/supabase/client";

// 1. Sparkles Icon SVG (Card 1)
const SparklesIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-[#502D55]">
    {/* Large Star */}
    <path d="M 8 2 Q 8 8 2 8 Q 8 8 8 14 Q 8 8 14 8 Q 8 8 8 2 Z" />
    {/* Medium Star */}
    <path d="M 17 6 Q 17 10 13 10 Q 17 10 17 14 Q 17 10 21 10 Q 17 10 17 6 Z" />
    {/* Small Star */}
    <path d="M 12 16 Q 12 18 10 18 Q 12 18 12 20 Q 12 18 14 18 Q 12 18 12 16 Z" />
  </svg>
);

// 2. Document Icon SVG (Card 2)
const DocumentIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-4H8V8h5v2zm1-3V3.5L18.5 9H14z" />
  </svg>
);

// 3. Paper Airplane Icon SVG (Card 3)
const PaperAirplaneIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-[#502D55] transform -rotate-[28deg]">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

export default function Home() {
  const [view, setView] = useState<'home' | 'login' | 'signup' | 'dashboard' | 'team' | 'file' | 'about' | 'creators' | 'trash'>('home');
  const [isVerifiedTab, setIsVerifiedTab] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const supabase = createClient();

  const [teams, setTeams] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Synchronize dynamic user-specific localStorage arrays whenever userId changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const teamsKey = userId ? `minutes_ai_teams_${userId}` : 'minutes_ai_teams_guest';
      const docsKey = userId ? `minutes_ai_documents_${userId}` : 'minutes_ai_documents_guest';

      const savedTeams = localStorage.getItem(teamsKey);
      const savedDocs = localStorage.getItem(docsKey);

      if (savedTeams) {
        setTeams(JSON.parse(savedTeams));
      } else {
        setTeams([]);
        localStorage.setItem(teamsKey, JSON.stringify([]));
      }

      if (savedDocs) {
        setDocuments(JSON.parse(savedDocs));
      } else {
        setDocuments([]);
        localStorage.setItem(docsKey, JSON.stringify([]));
      }
    }
  }, [userId]);

  const updateTeams = (newTeams: any[]) => {
    setTeams(newTeams);
    const teamsKey = userId ? `minutes_ai_teams_${userId}` : 'minutes_ai_teams_guest';
    localStorage.setItem(teamsKey, JSON.stringify(newTeams));
  };

  const updateDocuments = (newDocs: any[]) => {
    setDocuments(newDocs);
    const docsKey = userId ? `minutes_ai_documents_${userId}` : 'minutes_ai_documents_guest';
    localStorage.setItem(docsKey, JSON.stringify(newDocs));
  };

  // Push new state to history for back/forward buttons
  const handleViewChange = (newView: 'home' | 'login' | 'signup' | 'dashboard' | 'team' | 'file' | 'about' | 'creators' | 'trash') => {
    setView(newView);
    const url = newView === 'home' ? '/' : `?view=${newView}`;
    window.history.pushState({ view: newView }, '', url);
  };

  // Synchronize on mount and handle popstate browser back/forward buttons
  useEffect(() => {
    // 1. Exchange 'code' parameter on mount and strip it to prevent double-exchange loops
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (!error && data?.session) {
          setUserId(data.session.user.id);
          setView('dashboard');
        }
      }).catch(() => {});

      const cleanParams = new URLSearchParams(window.location.search);
      cleanParams.delete('code');
      const cleanUrl = window.location.pathname + (cleanParams.toString() ? `?${cleanParams.toString()}` : '');
      window.history.replaceState({}, '', cleanUrl);
    }

    const initialView = params.get('view') as 'login' | 'signup' | 'dashboard' | 'team' | 'file' | 'about' | 'creators' | 'trash' | null;
    const validViews: ('login' | 'signup' | 'dashboard' | 'team' | 'file' | 'about' | 'creators' | 'trash')[] = [
      'login', 'signup', 'dashboard', 'team', 'file', 'about', 'creators', 'trash'
    ];
    if (initialView && validViews.includes(initialView as any)) {
      setView(initialView);
    }

    if (params.get('verified') === 'true') {
      setIsVerifiedTab(true);
    }

    // 2. Force session recovery on mount (handles URL hash parsing on Tab B)
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error && error.message.includes('Refresh Token')) {
        // Self-heal: clear stale client credentials
        supabase.auth.signOut();
        setUserId(null);
      } else if (session) {
        setUserId(session.user.id);
        const p = new URLSearchParams(window.location.search);
        if (p.get('verified') !== 'true') {
          setView((prev) => {
            if (prev === 'home' || prev === 'login' || prev === 'signup') {
              return 'dashboard';
            }
            return prev;
          });
        }
      }
    }).catch(() => { });

    // 3. popstate event listener for browser navigation back/forward
    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search);
      const currentView = p.get('view') as 'login' | 'signup' | 'dashboard' | 'team' | 'file' | 'about' | 'creators' | 'trash' | null;
      setView(currentView || 'home');
    };
    window.addEventListener('popstate', handlePopState);

    // 4. Bulletproof cross-tab localStorage event listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('sb-') && e.key.endsWith('-auth-token')) {
        supabase.auth.getSession().then(({ data: { session }, error }) => {
          if (error && error.message.includes('Refresh Token')) {
            supabase.auth.signOut();
            setUserId(null);
          } else if (session) {
            setUserId(session.user.id);
            const p = new URLSearchParams(window.location.search);
            if (p.get('verified') !== 'true') {
              setView((prev) => {
                if (prev === 'home' || prev === 'login' || prev === 'signup') {
                  return 'dashboard';
                }
                return prev;
              });
            }
          }
        }).catch(() => { });
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 5. Listen for auth state changes inside the active tab
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        const p = new URLSearchParams(window.location.search);
        if (p.get('verified') !== 'true') {
          setView((prev) => {
            if (prev === 'home' || prev === 'login' || prev === 'signup') {
              return 'dashboard';
            }
            return prev;
          });
        }
      }
    });

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('storage', handleStorageChange);
      subscription.unsubscribe();
    };
  }, []);

  if (isVerifiedTab) {
    return (
      <div className="min-h-screen bg-[#FFEEDF] flex items-center justify-center p-4 selection:bg-[#935073]/20 relative overflow-hidden">
        {/* Modern Aesthetic Backdrop Gradient Orbs */}
        <div className="absolute top-[-10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-[#935073]/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[600px] h-[600px] rounded-full bg-[#502D55]/5 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md bg-[#FAF6F2] rounded-[32px] p-8 md:p-12 text-center shadow-2xl shadow-[#502D55]/10 border border-[#502D55]/5 relative z-10 animate-fade-in flex flex-col items-center">
          {/* Animated checkmark icon */}
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h1 className="font-plus-jakarta font-extrabold text-3xl text-[#502D55] tracking-tight mb-3">
            Email Confirmed!
          </h1>

          <p className="font-hanken text-sm text-[#502D55]/70 leading-relaxed mb-8 font-semibold">
            Your account has been successfully activated. You can now close this tab and return to your original screen where your workspace is already open!
          </p>

          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => {
                const url = window.location.origin + '/?view=dashboard';
                window.location.href = url;
              }}
              className="w-full bg-[#502D55] hover:bg-[#502D55]/95 text-white font-plus-jakarta font-bold text-sm py-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#502D55]/10 active:scale-[0.99] cursor-pointer"
            >
              Go to Workspace (This Tab)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dynamically render page views from the same app directory
  if (view === 'login') {
    return <Login onViewChange={handleViewChange} />;
  }

  if (view === 'signup') {
    return <Signup onViewChange={handleViewChange} />;
  }

  if (view === 'dashboard') {
    return (
      <Dashboard
        onViewChange={handleViewChange}
        onSelectTeam={(id) => setSelectedTeamId(id)}
        onSelectFile={(id) => setSelectedFileId(id)}
        teams={teams}
        documents={documents}
        onUpdateTeams={updateTeams}
        onUpdateDocuments={updateDocuments}
      />
    );
  }

  if (view === 'team') {
    return (
      <Team
        onViewChange={handleViewChange}
        teamId={selectedTeamId}
        onSelectFile={(id) => setSelectedFileId(id)}
        teams={teams}
        documents={documents}
        onUpdateTeams={updateTeams}
        onUpdateDocuments={updateDocuments}
      />
    );
  }

  if (view === 'file') {
    return (
      <File
        onViewChange={handleViewChange}
        fileId={selectedFileId}
        onSelectTeam={(id) => setSelectedTeamId(id)}
        teams={teams}
        documents={documents}
        onUpdateTeams={updateTeams}
        onUpdateDocuments={updateDocuments}
      />
    );
  }

  if (view === 'trash') {
    return (
      <Trash 
        onViewChange={handleViewChange} 
        documents={documents}
        onUpdateDocuments={updateDocuments}
        teams={teams}
        onUpdateTeams={updateTeams}
      />
    );
  }

  // ----------------------------------------------------
  // ABOUT VIEW (Screenshot 1)
  // ----------------------------------------------------
  if (view === 'about') {
    return (
      <div className="min-h-screen bg-[#FFEEDF] flex flex-col justify-between selection:bg-[#935073]/20">

        {/* Navigation Header */}
        <nav className="w-full px-6 md:px-12 lg:px-16 xl:px-20 py-6 flex items-center justify-between">
          <div className="flex items-baseline gap-12">
            <button
              onClick={() => handleViewChange('home')}
              className="font-plus-jakarta text-2xl md:text-3xl font-extrabold text-[#502D55] tracking-tight hover:opacity-85 transition-opacity cursor-pointer"
            >
              Minutes.ai
            </button>

            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => handleViewChange('about')}
                className="font-plus-jakarta font-semibold text-sm text-[#502D55] border-b-2 border-[#502D55] pb-0.5 cursor-pointer"
              >
                About
              </button>
              <button
                onClick={() => handleViewChange('creators')}
                className="font-plus-jakarta font-semibold text-sm text-[#935073] hover:text-[#502D55] transition-colors duration-200 cursor-pointer"
              >
                The Creators
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleViewChange('login')}
              className="font-plus-jakarta font-semibold text-sm text-[#502D55] border-2 border-[#502D55] hover:bg-[#502D55]/5 px-6 py-2 rounded-xl transition-all duration-200 cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => handleViewChange('signup')}
              className="font-plus-jakarta font-semibold text-sm text-[#FFEEDF] bg-[#502D55] hover:bg-[#502D55]/90 px-6 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-[#502D55]/10 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* About Main Section */}
        <main className="w-full max-w-6xl mx-auto px-6 md:px-12 pt-8 md:pt-16 pb-24 flex flex-col items-center gap-8">
          {/* Header Title */}
          <h1 className="font-plus-jakarta font-extrabold text-5xl md:text-[54px] tracking-tight leading-tight text-[#502D55] text-center max-w-4xl">
            The end of administrative busywork
          </h1>
          {/* Subtitle */}
          <p className="font-hanken text-base text-[#502D55]/85 text-center max-w-2xl leading-relaxed">
            Minutes.ai is the modern workspace designed to turn chaotic meeting notes into structured momentum.
          </p>

          {/* Paragraphs container */}
          <div className="flex flex-col gap-6 font-hanken text-[18px] md:text-[19px] text-[#502D55]/85 leading-[1.65] text-center max-w-3xl mt-6">
            <p>
              Meetings are where ideas happen, but documentation is where they go to die. We realized that fast-moving teams spend too much time formatting notes, assigning action items, and drafting summary emails instead of executing on the actual work.
            </p>
            <p>
              Minutes.ai was built to bridge that gap. By combining a distraction-free drafting environment with intelligent AI structuring, we allow teams to focus entirely on the conversation. You capture the raw thoughts; our engine handles the formatting, structuring, and seamless distribution. Secure, private, and instantaneous.
            </p>
          </div>

          {/* About Graphic Image */}
          <div className="w-full max-w-[940px] mt-8 rounded-[32px] overflow-hidden shadow-2xl border border-[#502D55]/5 bg-[#FAF6F2]/30 p-2">
            <img
              src="/about pic.png"
              alt="About illustration depicting crumpled notes turning into structured items"
              className="w-full h-auto rounded-[24px]"
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full bg-[#7A3E62] py-4 text-center mt-auto">
          <p className="font-hanken text-xs md:text-sm text-[#FFEEDF] tracking-wide font-medium">
            @2026 Minutes.ai. Google Automation Requirement
          </p>
        </footer>

      </div>
    );
  }

  // ----------------------------------------------------
  // THE CREATORS VIEW (Screenshot 2)
  // ----------------------------------------------------
  if (view === 'creators') {
    return (
      <div className="min-h-screen bg-[#FFEEDF] flex flex-col justify-between selection:bg-[#935073]/20">

        {/* Navigation Header */}
        <nav className="w-full px-6 md:px-12 lg:px-16 xl:px-20 py-6 flex items-center justify-between">
          <div className="flex items-baseline gap-12">
            <button
              onClick={() => handleViewChange('home')}
              className="font-plus-jakarta text-2xl md:text-3xl font-extrabold text-[#502D55] tracking-tight hover:opacity-85 transition-opacity cursor-pointer"
            >
              Minutes.ai
            </button>

            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => handleViewChange('about')}
                className="font-plus-jakarta font-semibold text-sm text-[#935073] hover:text-[#502D55] transition-colors duration-200 cursor-pointer"
              >
                About
              </button>
              <button
                onClick={() => handleViewChange('creators')}
                className="font-plus-jakarta font-semibold text-sm text-[#502D55] border-b-2 border-[#502D55] pb-0.5 cursor-pointer"
              >
                The Creators
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleViewChange('login')}
              className="font-plus-jakarta font-semibold text-sm text-[#502D55] border-2 border-[#502D55] hover:bg-[#502D55]/5 px-6 py-2 rounded-xl transition-all duration-200 cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => handleViewChange('signup')}
              className="font-plus-jakarta font-semibold text-sm text-[#FFEEDF] bg-[#502D55] hover:bg-[#502D55]/90 px-6 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-[#502D55]/10 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* Creators Main Section */}
        <main className="w-full max-w-6xl mx-auto px-6 md:px-12 pt-8 md:pt-16 pb-24 flex flex-col items-center gap-8">
          {/* Header Title */}
          <h1 className="font-plus-jakarta font-extrabold text-5xl md:text-[54px] tracking-tight leading-tight text-[#502D55] text-center max-w-4xl">
            Built for focused teams, by focused builders.
          </h1>
          {/* Subtitle */}
          <p className="font-hanken text-base text-[#502D55]/85 text-center max-w-2xl leading-relaxed">
            Meet the minds engineering a better way to document, collaborate, and execute.
          </p>

          {/* Circle Creators Avatars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 max-w-5xl w-full mt-12 justify-center">

            {/* Creator 1 */}
            <div className="flex flex-col items-center">
              <div className="w-56 h-56 lg:w-64 lg:h-64 rounded-full border-[5px] border-[#502D55] bg-white shadow-xl flex items-center justify-center hover:scale-[1.02] transition-transform duration-300">
                {/* Visual Placeholder Graphic inside the empty white circle */}
                <span className="font-plus-jakarta text-[#502D55]/15 font-black text-6xl">JDA</span>
              </div>
              <h3 className="font-plus-jakarta font-bold text-[#502D55] text-xl mt-6 text-center leading-snug">
                Joana Danielle Albaladejo
              </h3>
            </div>

            {/* Creator 2 */}
            <div className="flex flex-col items-center">
              <div className="w-56 h-56 lg:w-64 lg:h-64 rounded-full border-[5px] border-[#502D55] bg-white shadow-xl flex items-center justify-center hover:scale-[1.02] transition-transform duration-300">
                <span className="font-plus-jakarta text-[#502D55]/15 font-black text-6xl">ACA</span>
              </div>
              <h3 className="font-plus-jakarta font-bold text-[#502D55] text-xl mt-6 text-center leading-snug">
                Aiza Camille Alvarez
              </h3>
            </div>

            {/* Creator 3 */}
            <div className="flex flex-col items-center">
              <div className="w-56 h-56 lg:w-64 lg:h-64 rounded-full border-[5px] border-[#502D55] bg-white shadow-xl flex items-center justify-center hover:scale-[1.02] transition-transform duration-300">
                <span className="font-plus-jakarta text-[#502D55]/15 font-black text-6xl">SLB</span>
              </div>
              <h3 className="font-plus-jakarta font-bold text-[#502D55] text-xl mt-6 text-center leading-snug">
                Sophia Lorraine Banting
              </h3>
            </div>

          </div>

          {/* Footer Text Descriptions */}
          <div className="flex flex-col gap-3 font-hanken text-lg md:text-[19px] text-[#502D55]/85 leading-relaxed text-center max-w-2xl mt-12">
            <p>
              3rd Year Computer Science Students from Technological University of the Philippines.
            </p>
            <p className="mt-1">
              Created for the final requirements of Google Automation using Python.
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full bg-[#7A3E62] py-4 text-center mt-auto">
          <p className="font-hanken text-xs md:text-sm text-[#FFEEDF] tracking-wide font-medium">
            @2026 Minutes.ai. Google Automation Requirement
          </p>
        </footer>

      </div>
    );
  }

  // ----------------------------------------------------
  // HOME / WELCOME VIEW
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FFEEDF] flex flex-col justify-between selection:bg-[#935073]/20 relative overflow-hidden">

      {/* Modern Aesthetic Backdrop Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-[#935073]/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-15%] w-[700px] h-[700px] rounded-full bg-[#502D55]/5 blur-[140px] pointer-events-none" />

      {/* Navigation Header */}
      <nav className="w-full px-6 md:px-12 lg:px-16 xl:px-20 py-6 flex items-center justify-between">
        <div className="flex items-baseline gap-12">
          {/* Logo */}
          <button
            onClick={() => handleViewChange('home')}
            className="font-plus-jakarta text-2xl md:text-3xl font-extrabold text-[#502D55] tracking-tight hover:opacity-85 transition-opacity cursor-pointer"
          >
            Minutes.ai
          </button>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => handleViewChange('about')}
              className="font-plus-jakarta font-semibold text-sm text-[#935073] hover:text-[#502D55] transition-colors duration-200 cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => handleViewChange('creators')}
              className="font-plus-jakarta font-semibold text-sm text-[#935073] hover:text-[#502D55] transition-colors duration-200 cursor-pointer"
            >
              The Creators
            </button>
          </div>
        </div>

        {/* Nav Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleViewChange('login')}
            className="font-plus-jakarta font-semibold text-sm text-[#502D55] border-2 border-[#502D55] hover:bg-[#502D55]/5 px-6 py-2 rounded-xl transition-all duration-200 cursor-pointer"
          >
            Login
          </button>
          <button
            onClick={() => handleViewChange('signup')}
            className="font-plus-jakarta font-semibold text-sm text-[#FFEEDF] bg-[#502D55] hover:bg-[#502D55]/90 px-6 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-[#502D55]/10 cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full max-w-5xl mx-auto px-6 md:px-12 pt-8 md:pt-16 pb-12 text-center flex flex-col items-center gap-8">

        {/* Intelligent Workspace Pill Badge */}
        <div className="inline-flex items-center gap-2 bg-[#935073]/8 border border-[#935073]/15 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold font-plus-jakarta text-[#935073] tracking-widest uppercase shadow-sm">
          <span>✧</span>
          <span>INTELLIGENT WORKSPACE NOW LIVE</span>
        </div>

        {/* Main Heading */}
        <h1 className="font-plus-jakarta font-extrabold text-5xl sm:text-6xl md:text-[76px] tracking-tight leading-[1.08] max-w-none md:whitespace-nowrap">
          <span className="text-[#935073] inline-block mr-2">Automate</span>
          <span className="text-[#502D55]">your meeting minutes</span>
        </h1>

        {/* Subtitle */}
        <p className="font-hanken text-base md:text-[19px] text-[#502D55]/85 leading-relaxed max-w-3xl mx-auto mt-2">
          The modern workspace for automated meeting minutes and seamless distribution.
          Jot down your thoughts, let AI handle the formatting, and instantly send the
          final documentation to your organization.
        </p>

        {/* Action Call to Buttons */}
        <div className="flex flex-wrap gap-4 justify-center items-center mt-4">
          <button
            onClick={() => handleViewChange('signup')}
            className="font-plus-jakarta font-bold text-base text-[#FFEEDF] bg-[#502D55] hover:bg-[#502D55]/95 px-8 py-4 rounded-2xl flex items-center transition-all duration-200 shadow-lg shadow-[#502D55]/15 hover:scale-[1.02] cursor-pointer"
          >
            {/* Play triangle icon */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2.5">
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
            Start writing
          </button>
          <button
            onClick={() => handleViewChange('login')}
            className="font-plus-jakarta font-bold text-base text-[#502D55] border-2 border-[#502D55] hover:bg-[#502D55]/5 px-8 py-3.5 rounded-2xl transition-all duration-200 cursor-pointer"
          >
            View Recent Work
          </button>
        </div>

        {/* macOS Style Mockup Preview Window */}
        <div className="w-full max-w-[860px] bg-[#FAF6F2] border border-[#502D55]/10 rounded-[28px] shadow-2xl p-6 md:p-8 mt-12 relative overflow-hidden transition-all duration-500 hover:shadow-[0_25px_60px_-15px_rgba(80,45,85,0.25)] hover:scale-[1.01] hover:-translate-y-1 group z-10">

          {/* Window Chrome Header Bar */}
          <div className="flex justify-between items-center pb-5 border-b border-[#502D55]/5 mb-6">
            <div className="flex gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-400/90 block" />
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-400/90 block" />
              <span className="w-3.5 h-3.5 rounded-full bg-green-400/90 block" />
            </div>

            {/* Mock Window Address Bar */}
            <div className="bg-[#502D55]/5 border border-[#502D55]/5 text-[10px] font-bold text-[#502D55]/50 px-8 py-1.5 rounded-xl font-hanken">
              minutes.ai/workspace/Automation-sync
            </div>

            <div className="w-12" /> {/* Spacer */}
          </div>

          {/* Split Screen Application Workspace Layout Preview */}
          <div className="grid grid-cols-12 gap-6 text-left">
            {/* Mock Left Document Navigation */}
            <div className="col-span-3 border-r border-[#502D55]/5 pr-6 hidden md:flex flex-col gap-3.5">
              <span className="font-plus-jakarta text-[8px] font-bold text-[#502D55]/40 uppercase tracking-widest block mb-1">
                MY FILES
              </span>
              <div className="bg-[#502D55]/5 p-2.5 rounded-xl text-[11px] font-bold text-[#502D55] truncate border-l-[3px] border-[#502D55]">
                📝 Automation meeting.txt
              </div>
              <div className="p-2.5 rounded-xl text-[11px] font-semibold text-[#935073] hover:bg-[#502D55]/5 truncate transition-all cursor-pointer">
                📝 Project notes.txt
              </div>
              <div className="p-2.5 rounded-xl text-[11px] font-semibold text-[#935073] hover:bg-[#502D55]/5 truncate transition-all cursor-pointer">
                📝 Project roadmap.txt
              </div>
            </div>

            {/* Mock Editor Area */}
            <div className="col-span-12 md:col-span-9 flex flex-col gap-5">
              <div className="flex justify-between items-center border-b border-[#502D55]/5 pb-3">
                <div>
                  <h4 className="font-plus-jakarta font-extrabold text-[#502D55] text-lg leading-tight">
                    Project's Sync Meeting
                  </h4>
                  <p className="font-hanken text-[10px] text-[#502D55]/50 mt-1">Edited Just now • Automated Layout</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2.5 py-1 rounded-full font-plus-jakarta uppercase tracking-wider block animate-pulse">
                  ✦ AI Synthesized
                </span>
              </div>

              {/* Fake Text Outline Previews */}
              <div className="flex flex-col gap-4 font-hanken text-xs text-[#502D55]/85">
                <div className="border-l-[3px] border-[#502D55] pl-4 py-1.5 bg-[#FAF6F2]/30 rounded-r-xl">
                  <strong className="text-[#502D55] font-bold font-plus-jakarta text-[13px]">1. Executive Summary</strong>
                  <p className="text-[#502D55]/70 mt-1 leading-relaxed">
                    Reviewed the Google Automation Python scripts timeline markers. Completed dynamic routing alignments and folder structure clean-up guidelines.
                  </p>
                </div>

                <div className="border-l-[3px] border-[#935073] pl-4 py-1.5 rounded-r-xl">
                  <strong className="text-[#935073] font-bold font-plus-jakarta text-[13px]">2. Key Action Items</strong>
                  <ul className="list-none text-[#502D55]/70 mt-1 flex flex-col gap-1.5">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>Camille to verify firebase dynamic auth credentials.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>Sophia to refine aesthetic corner rounding guidelines.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle lighting overlay blur element */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#FFEEDF]/5 to-[#FFEEDF]/15 pointer-events-none" />
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="w-full max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-24 md:pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 items-end">

          {/* Card 1: Intelligent Formatting */}
          <div className="bg-[#F3DDC8] rounded-[32px] p-8 md:p-10 min-h-[330px] flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300 shadow-lg shadow-[#502D55]/3">
            <div className="mb-12">
              <SparklesIcon />
            </div>
            <div>
              <h3 className="font-plus-jakarta font-bold text-2xl text-[#502D55] mb-2 leading-tight">
                Intelligent Formatting
              </h3>
              <p className="font-hanken text-sm md:text-[15px] text-[#502D55]/80 leading-relaxed">
                Instantly transform messy thoughts into organized, professional minutes with clear action items.
              </p>
            </div>
          </div>

          {/* Card 2: Focused Drafting (Featured Center Card) */}
          <div className="bg-[#502D55] rounded-[32px] p-8 md:p-10 min-h-[350px] flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300 md:-translate-y-8 shadow-xl shadow-[#502D55]/20 z-10">
            <div className="mb-12">
              <DocumentIcon />
            </div>
            <div>
              <h3 className="font-plus-jakarta font-bold text-2xl text-white mb-2 leading-tight">
                Focused Drafting
              </h3>
              <p className="font-hanken text-sm md:text-[15px] text-[#FFEEDF]/80 leading-relaxed">
                Type your raw meeting notes in a clean, distraction-free editor designed for speed and deep work.
              </p>
            </div>
          </div>

          {/* Card 3: Seamless Distribution */}
          <div className="bg-[#F3DDC8] rounded-[32px] p-8 md:p-10 min-h-[330px] flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300 shadow-lg shadow-[#502D55]/3">
            <div className="mb-12">
              <PaperAirplaneIcon />
            </div>
            <div>
              <h3 className="font-plus-jakarta font-bold text-2xl text-[#502D55] mb-2 leading-tight">
                Seamless Distribution
              </h3>
              <p className="font-hanken text-sm md:text-[15px] text-[#502D55]/80 leading-relaxed">
                Select your team members and distribute the finalized documentation straight to their inboxes with one click.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Footer Bar */}
      <footer className="w-full bg-[#7A3E62] py-4 text-center mt-auto">
        <p className="font-hanken text-xs md:text-sm text-[#FFEEDF] tracking-wide font-medium">
          @2026 Minutes.ai. Google Automation Requirement
        </p>
      </footer>

    </div>
  );
}
