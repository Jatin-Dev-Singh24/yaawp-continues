// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React from 'react';
import { Link } from '@/yaawp/compat/router';
import { ArrowLeft } from 'lucide-react';
import { AuthCard } from '../../components/auth';

export const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[#09090b] text-[#f4f4f5] flex flex-col justify-center items-center p-4 relative selection:bg-zinc-200 selection:text-black">
      {/* Top Bar with back to preview */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase font-light text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-[420px] my-auto pt-8">
        <AuthCard initialMode="signup" />
      </div>
    </div>
  );
};

export default SignupPage;
