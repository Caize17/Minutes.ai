"use client";
import { useState } from 'react';
import { createClient } from '../backend/supabase/client';

// Colorful Google Logo SVG
const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

interface SignupProps {
  onViewChange: (view: 'home' | 'login' | 'signup' | 'dashboard' | 'team' | 'file' | 'about' | 'creators' | 'trash') => void;
}

export default function Signup({ onViewChange }: SignupProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      if (data?.session) {
        onViewChange('dashboard');
      } else {
        setSuccess(true);
      }
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-[#FFEEDF] flex items-center justify-center p-4 md:p-8 selection:bg-[#935073]/20 w-full relative overflow-hidden">
        {/* Modern Aesthetic Backdrop Gradient Orbs */}
        <div className="absolute top-[-10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-[#935073]/5 blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[600px] h-[600px] rounded-full bg-[#502D55]/5 blur-[120px] pointer-events-none animate-pulse" />

        <div className="w-full max-w-md bg-[#FAF6F2] rounded-[32px] p-8 md:p-12 text-center shadow-2xl shadow-[#502D55]/10 border border-[#502D55]/5 relative z-10 animate-fade-in flex flex-col items-center">
          <div className="w-16 h-16 bg-[#502D55]/5 text-[#502D55] rounded-2xl flex items-center justify-center mb-6 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>

          <h1 className="font-plus-jakarta font-extrabold text-3xl text-[#502D55] tracking-tight mb-3">
            Verify your email
          </h1>
          
          <p className="font-hanken text-sm text-[#502D55]/70 leading-relaxed mb-8 font-semibold">
            We've sent a verification link to <span className="text-[#935073] font-bold">{email}</span>. Please check your inbox and click the link to activate your account.
          </p>

          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => onViewChange('login')}
              className="w-full bg-[#502D55] hover:bg-[#502D55]/95 text-white font-plus-jakarta font-bold text-sm py-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#502D55]/10 active:scale-[0.99] cursor-pointer"
            >
              Go to Log In
            </button>
            <button
              onClick={() => onViewChange('home')}
              className="w-full bg-transparent hover:bg-[#502D55]/5 border border-[#502D55]/20 text-[#502D55] font-plus-jakarta font-bold text-sm py-3.5 rounded-xl transition-all duration-200 cursor-pointer"
            >
              Return to Home
            </button>
          </div>

          <p className="font-hanken text-[11px] text-[#502D55]/50 mt-6 leading-relaxed font-semibold">
            Didn't receive the email? Check your spam folder or try signing up again.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFEEDF] flex items-center justify-center p-4 md:p-8 selection:bg-[#935073]/20 w-full relative overflow-hidden">

      {/* Modern Aesthetic Backdrop Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-[#935073]/5 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[600px] h-[600px] rounded-full bg-[#502D55]/5 blur-[120px] pointer-events-none animate-pulse" />

      {/* Auth Card Container */}
      <div className="w-full max-w-5xl bg-[#FAF6F2] rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-[#502D55]/10 border border-[#502D55]/5 relative z-10 animate-fade-in">

        {/* Left Side: Premium Info Panel */}
        <div className="w-full md:w-[46%] bg-[var(--tertiarycolor)] p-8 md:p-12 flex flex-col justify-between gap-8 md:gap-12">

          {/* Logo & Headline Block */}
          <div className="flex flex-col gap-8">
            <button
              onClick={() => onViewChange('home')}
              className="font-plus-jakarta text-xl font-extrabold text-[#502D55] tracking-tight text-left self-start hover:opacity-80 transition-opacity cursor-pointer"
            >
              Minutes.ai
            </button>

            <div className="flex flex-col gap-4">
              <h2 className="font-plus-jakarta font-extrabold text-3xl md:text-[38px] text-[#502D55] leading-[1.15] tracking-tight">
                Turn chatter <br className="hidden md:inline" /> into clarity.
              </h2>
              <p className="font-hanken text-sm md:text-[15px] text-[#502D55]/80 leading-relaxed font-semibold">
                Welcome to your intelligent workspace. Whether you are coordinating a major organization event or organizing project milestones, Minutes.ai is designed to keep your team aligned.
              </p>
            </div>
          </div>

          {/* Rounded Image */}
          <div className="w-full relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
            <img
              src="/Authentication pic.jpg"
              alt="Coordinating notes in notebook"
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
            />
          </div>

        </div>

        {/* Right Side: Form Panel */}
        <div className="w-full md:w-[54%] p-8 md:p-12 flex flex-col justify-center">

          {/* Return Button */}
          <button
            onClick={() => onViewChange('home')}
            className="flex items-center gap-2 text-xs font-bold font-plus-jakarta text-[#502D55]/60 hover:text-[#502D55] transition-colors mb-6 self-start group cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Return to Home
          </button>

          {/* Header Block */}
          <div className="mb-6">
            <h1 className="font-plus-jakarta font-extrabold text-3xl md:text-[35px] text-[#502D55] tracking-tight">
              Create an account
            </h1>
            <p className="font-hanken text-sm text-[#502D55]/60 mt-1 font-semibold">
              Start transforming your raw notes into structured minutes today.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="flex flex-col gap-4">

            {error && (
              <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl font-hanken font-semibold border border-red-100">
                {error}
              </div>
            )}

            {/* Full Name Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="font-hanken text-[11px] font-extrabold text-[#502D55]/75 tracking-wider uppercase">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan dela Cruz"
                className="w-full bg-[#FAF5F0] border border-[#502D55]/20 rounded-xl px-4 py-3 text-sm text-[#502D55] placeholder-[#B6B6B6] font-hanken focus:outline-none focus:border-[#502D55] focus:ring-4 focus:ring-[#935073]/8 transition-all duration-200"
              />
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="font-hanken text-[11px] font-extrabold text-[#502D55]/75 tracking-wider uppercase">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan.delacruz@mail.com"
                className="w-full bg-[#FAF5F0] border border-[#502D55]/20 rounded-xl px-4 py-3 text-sm text-[#502D55] placeholder-[#B6B6B6] font-hanken focus:outline-none focus:border-[#502D55] focus:ring-4 focus:ring-[#935073]/8 transition-all duration-200"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-baseline">
                <label htmlFor="password" className="font-hanken text-[11px] font-extrabold text-[#502D55]/75 tracking-wider uppercase">
                  Password
                </label>
                <button
                  type="button"
                  className="font-hanken text-[11px] font-bold text-[#502D55]/65 hover:text-[#502D55] transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="*************"
                className="w-full bg-[#FAF5F0] border border-[#502D55]/20 rounded-xl px-4 py-3 text-sm text-[#502D55] placeholder-[#B6B6B6] font-hanken focus:outline-none focus:border-[#502D55] focus:ring-4 focus:ring-[#935073]/8 transition-all duration-200"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#502D55] hover:bg-[#502D55]/95 text-white font-plus-jakarta font-bold text-sm py-4 rounded-xl transition-all duration-200 mt-4 shadow-lg shadow-[#502D55]/10 active:scale-[0.99] cursor-pointer disabled:opacity-70"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

          </form>

          {/* Separator line */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-[1px] bg-[#502D55]/10"></div>
            <span className="text-[10px] font-extrabold tracking-widest text-[#502D55]/40 uppercase font-plus-jakarta">
              OR CONTINUE WITH
            </span>
            <div className="flex-1 h-[1px] bg-[#502D55]/10"></div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full bg-transparent hover:bg-[#502D55]/5 border border-[#502D55]/30 hover:border-[#502D55] rounded-xl py-3.5 flex items-center justify-center gap-3 transition-all duration-200 font-plus-jakarta font-bold text-sm text-[#502D55] active:scale-[0.99] cursor-pointer"
          >
            <GoogleIcon />
            Sign up with Google
          </button>

          {/* Footer prompt */}
          <p className="font-hanken text-xs text-[#502D55]/70 text-center mt-7 font-semibold">
            Already have an account?{" "}
            <button
              onClick={() => onViewChange('login')}
              className="font-bold text-[#502D55] hover:underline cursor-pointer"
            >
              Log in
            </button>
          </p>

        </div>

      </div>

    </main>
  );
}
