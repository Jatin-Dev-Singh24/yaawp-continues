// @ts-nocheck -- uses Supabase's free built-in authenticator-app (TOTP) 2FA
import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function TwoFactorPanel() {
  const [factors, setFactors] = useState<any[]>([]);
  const [enroll, setEnroll] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors((data?.totp || []).filter((f) => f.status === 'verified'));
  };
  useEffect(() => { load(); }, []);

  const start = async () => {
    setMsg(''); setBusy(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: `Yaawp ${Date.now()}` });
    setBusy(false);
    if (error) return setMsg(error.message);
    setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const confirm = async () => {
    if (!enroll) return;
    setBusy(true); setMsg('');
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: enroll.id, code: code.trim() });
    setBusy(false);
    if (error) return setMsg('That code did not work. Check your app and try again.');
    setEnroll(null); setCode(''); setMsg('2FA is on. You will be asked for a code when you sign in.');
    load();
  };

  const cancel = async () => {
    if (enroll) await supabase.auth.mfa.unenroll({ factorId: enroll.id });
    setEnroll(null); setCode('');
  };

  const disable = async (id: string) => {
    setBusy(true); setMsg('');
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    setBusy(false);
    if (error) return setMsg(error.message.includes('aal2') ? 'Sign out and back in with your code first, then try again.' : error.message);
    setMsg('2FA turned off.');
    load();
  };

  const box = 'p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3';
  const btn = 'w-full py-2 rounded-lg text-xs font-bold bg-lime-400 text-zinc-950 disabled:opacity-50';

  if (!isSupabaseConfigured) {
    return <div className={box}><p className="text-xs text-zinc-400">2FA becomes available once the app is connected to its account server.</p></div>;
  }

  const on = factors.length > 0;
  return (
    <div className="space-y-4">
      <div className={box}>
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-white">Two-factor authentication</h5>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${on ? 'bg-lime-400/20 text-lime-300' : 'bg-zinc-800 text-zinc-400'}`}>{on ? 'ON' : 'OFF'}</span>
        </div>
        <p className="text-[11px] text-zinc-400">Use a free authenticator app (Google Authenticator, Microsoft Authenticator, Authy, 2FAS) to get a 6-digit code each time you sign in.</p>
      </div>

      {enroll ? (
        <div className={box}>
          <p className="text-[11px] text-zinc-300">1. Scan this with your authenticator app:</p>
          <img src={enroll.qr} alt="2FA QR code" className="w-44 h-44 bg-white rounded-lg p-2 mx-auto" />
          <p className="text-[10px] text-zinc-500 break-all">Can't scan? Enter this key: <span className="text-zinc-300 font-mono">{enroll.secret}</span></p>
          <p className="text-[11px] text-zinc-300">2. Enter the 6-digit code it shows:</p>
          <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="123456"
            className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-center tracking-[0.4em] font-mono" />
          <button className={btn} disabled={busy || code.length !== 6} onClick={confirm}>Turn on 2FA</button>
          <button className="w-full text-[11px] text-zinc-400" onClick={cancel}>Cancel</button>
        </div>
      ) : on ? (
        <div className={box}>
          <button className="w-full py-2 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 disabled:opacity-50" disabled={busy} onClick={() => disable(factors[0].id)}>Turn off 2FA</button>
        </div>
      ) : (
        <div className={box}><button className={btn} disabled={busy} onClick={start}>Set up 2FA</button></div>
      )}
      {msg && <p className="text-[11px] text-zinc-300">{msg}</p>}
    </div>
  );
}
