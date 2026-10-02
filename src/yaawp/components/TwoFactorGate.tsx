// @ts-nocheck -- blocks the app until a signed-in user with 2FA enters their code
import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function TwoFactorGate({ children }: { children: React.ReactNode }) {
  const [needs, setNeeds] = useState(false);
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const check = async () => {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    setNeeds(data?.currentLevel === 'aal1' && data?.nextLevel === 'aal2');
  };

  useEffect(() => {
    check();
    const { data } = supabase.auth.onAuthStateChange((e) => {
      if (e === 'SIGNED_IN' || e === 'SIGNED_OUT' || e === 'MFA_CHALLENGE_VERIFIED') setTimeout(check, 0);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const verify = async () => {
    setBusy(true); setErr('');
    const { data } = await supabase.auth.mfa.listFactors();
    const f = data?.totp?.find((x) => x.status === 'verified');
    if (!f) { setBusy(false); return setErr('No authenticator found.'); }
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: f.id, code: code.trim() });
    setBusy(false);
    if (error) return setErr('Wrong code. Try again.');
    setCode(''); setNeeds(false);
  };

  if (!needs) return <>{children}</>;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-sm space-y-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
        <h2 className="text-lg font-bold text-white">Enter your 2FA code</h2>
        <p className="text-xs text-zinc-400">Open your authenticator app and type the 6-digit code for Yaawp.</p>
        <input autoFocus value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyDown={(e) => e.key === 'Enter' && code.length === 6 && verify()} inputMode="numeric" placeholder="123456"
          className="w-full px-3 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-center tracking-[0.4em] font-mono text-lg" />
        {err && <p className="text-xs text-rose-400">{err}</p>}
        <button disabled={busy || code.length !== 6} onClick={verify} className="w-full py-2.5 rounded-lg font-bold bg-lime-400 text-zinc-950 disabled:opacity-50">Verify</button>
        <button onClick={() => supabase.auth.signOut()} className="w-full text-xs text-zinc-400">Sign out</button>
      </div>
    </div>
  );
}
