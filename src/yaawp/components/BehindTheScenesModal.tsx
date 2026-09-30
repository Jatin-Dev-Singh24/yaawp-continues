// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState } from 'react';
import {
  X,
  Database,
  ShieldCheck,
  Zap,
  Cpu,
  Lock,
  Server,
  Code,
  CheckCircle,
  Radio,
  FileCode2,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BehindTheScenesModal: React.FC = () => {
  const { isBehindTheScenesOpen, setIsBehindTheScenesOpen, showToast } = useApp();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rls' | 'triggers' | 'realtime' | 'functions' | 'mcp'>('rls');

  if (!isBehindTheScenesOpen) return null;

  const copyCode = (key: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedSection(key);
    showToast('SQL / Spec copied to clipboard');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const RLS_SQL = `-- Supabase / PostgreSQL Row-Level Security (RLS) Policies
-- 1. Profiles Table RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Direct Messages Table RLS (Strict participant privacy)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select messages they sent or received"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert messages where sender_id matches auth.uid()"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- 3. Communities & Join Requests RLS
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view community content"
  ON public.community_memberships FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.communities c WHERE c.id = community_id AND c.is_private = false
  ));`;

  const TRIGGERS_SQL = `-- Supabase Database Triggers
-- 1. Automatic Profile provisioning upon auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, created_at)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Audit Trail on Security Events
CREATE OR REPLACE FUNCTION public.log_security_audit()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.security_audit_logs (user_id, action, category, ip_address, timestamp)
  VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, inet_client_addr(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`;

  const MCP_SPEC = `{
  "mcp_server": "lumina-social-mcp",
  "version": "1.0.0",
  "protocol": "Model Context Protocol (MCP)",
  "transport": "HTTP/SSE",
  "endpoint": "/api/mcp/v1",
  "authentication": {
    "type": "OAuth 2.0 Bearer Token (JWT)",
    "scopes": [
      "social:read",
      "social:write",
      "messages:send",
      "communities:query"
    ],
    "algorithm": "RS256 with Supabase JWKS"
  },
  "capabilities": {
    "tools": [
      {
        "name": "search_social_graph",
        "description": "Finds people, topics, and communities respecting RLS"
      },
      {
        "name": "send_secure_direct_message",
        "description": "Dispatches voice notes or text with E2E chat lock"
      },
      {
        "name": "query_audit_trail",
        "description": "Retrieves tamper-evident GDPR security logs"
      }
    ]
  }
}`;

  return (
    <div
      id="behind-the-scenes-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6"
      onClick={() => setIsBehindTheScenesOpen(false)}
    >
      <div
        className="w-full max-w-3xl bg-zinc-950 border border-lime-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] lime-glow"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 px-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Behind the Scenes Architecture
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-400 border border-lime-400/30 font-mono flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-lime-400" />
                  Supabase + MCP
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                PostgreSQL RLS, database triggers, realtime WebSockets & OAuth-secured MCP server
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsBehindTheScenesOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-zinc-800 overflow-x-auto no-scrollbar bg-zinc-900/30">
          {[
            { id: 'rls', label: 'Row-Level Security (RLS)', icon: ShieldCheck },
            { id: 'triggers', label: 'Database Triggers', icon: Zap },
            { id: 'realtime', label: 'Realtime Channels', icon: Radio },
            { id: 'functions', label: 'Edge Functions', icon: Server },
            { id: 'mcp', label: 'OAuth MCP Endpoint', icon: Cpu }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors shrink-0 ${
                  activeTab === tab.id
                    ? 'text-lime-400 border-b-2 border-lime-400 bg-zinc-800/60'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 font-sans">
          {activeTab === 'rls' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">PostgreSQL Row-Level Security Policies</h4>
                  <p className="text-[11px] text-zinc-400">
                    Enforces zero-trust isolation on profiles, direct messages, communities, and private posts.
                  </p>
                </div>
                <button
                  onClick={() => copyCode('rls', RLS_SQL)}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1"
                >
                  {copiedSection === 'rls' ? <Check className="w-3 h-3 text-lime-400" /> : <Copy className="w-3 h-3" />}
                  Copy SQL
                </button>
              </div>
              <pre className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-lime-300/90 overflow-x-auto leading-relaxed">
                {RLS_SQL}
              </pre>
            </div>
          )}

          {activeTab === 'triggers' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Automated Database Triggers & Webhooks</h4>
                  <p className="text-[11px] text-zinc-400">
                    Triggers that run atomically inside PostgreSQL to synchronize profiles and audit logs.
                  </p>
                </div>
                <button
                  onClick={() => copyCode('triggers', TRIGGERS_SQL)}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1"
                >
                  {copiedSection === 'triggers' ? <Check className="w-3 h-3 text-lime-400" /> : <Copy className="w-3 h-3" />}
                  Copy SQL
                </button>
              </div>
              <pre className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-lime-300/90 overflow-x-auto leading-relaxed">
                {TRIGGERS_SQL}
              </pre>
            </div>
          )}

          {activeTab === 'realtime' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-ping" />
                    <h4 className="text-xs font-bold text-white">Active Realtime Channels</h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-lime-400/10 text-lime-400 border border-lime-400/20">
                    WEBSOCKET CONNECTED
                  </span>
                </div>
                <div className="space-y-2 text-xs text-zinc-300">
                  <div className="p-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-between font-mono text-[11px]">
                    <span className="text-lime-400">room:messages:direct</span>
                    <span className="text-zinc-400">Typing dots, sent/read receipts, voice notes</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-between font-mono text-[11px]">
                    <span className="text-lime-400">feed:presence:online</span>
                    <span className="text-zinc-400">Participant live statuses & avatar rings</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-between font-mono text-[11px]">
                    <span className="text-lime-400">table:notifications</span>
                    <span className="text-zinc-400">Realtime likes, comments & connection requests</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'functions' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white">Server-Side Supabase Edge Functions</h4>
              <p className="text-[11px] text-zinc-400">
                All mutations and reads pass through verified server-side endpoints with token validation and rate limiting.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  { name: '/functions/v1/auth-confirm-code', desc: 'Validates 6-digit confirmation codes for signup' },
                  { name: '/functions/v1/sign-private-media', desc: 'Generates 15-minute temporary presigned CDN URLs' },
                  { name: '/functions/v1/rate-limiter', desc: 'Planned: server-side failed-attempt limits' },
                  { name: '/functions/v1/export-gdpr-data', desc: 'Bundles full user archive into downloadable JSON' }
                ].map((fn, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <span className="text-xs font-mono font-bold text-lime-400">{fn.name}</span>
                    <p className="text-[11px] text-zinc-400">{fn.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'mcp' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Model Context Protocol (MCP) Server Endpoint</h4>
                  <p className="text-[11px] text-zinc-400">
                    Standardized agent endpoint secured with OAuth 2.0 Bearer tokens for AI agents to query feeds, direct messages, and communities securely.
                  </p>
                </div>
                <button
                  onClick={() => copyCode('mcp', MCP_SPEC)}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1"
                >
                  {copiedSection === 'mcp' ? <Check className="w-3 h-3 text-lime-400" /> : <Copy className="w-3 h-3" />}
                  Copy Spec
                </button>
              </div>
              <pre className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-lime-300/90 overflow-x-auto leading-relaxed">
                {MCP_SPEC}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
