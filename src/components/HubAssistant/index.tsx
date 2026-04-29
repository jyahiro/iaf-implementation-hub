import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/core/lib/client/exports/useDocusaurusContext';
import useIsBrowser from '@docusaurus/core/lib/client/exports/useIsBrowser';
import {useLocation} from '@docusaurus/core/lib/client/exports/router';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {STORAGE_KEY as JURISDICTION_STORAGE_KEY} from '@site/src/context/hubJurisdictionTypes';

type Role = 'user' | 'assistant';

type ChatMessage = {
  id: string;
  role: Role;
  content: string;
};

type SiteCustomFields = {
  hubAssistantApiBase?: string;
  hubPublicFeedbackSecret?: string;
  hubAppVersion?: string;
};

function readPrimaryJurisdiction(): string {
  if (typeof window === 'undefined') {
    return 'unknown';
  }
  try {
    return window.localStorage.getItem(JURISDICTION_STORAGE_KEY) ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

function shouldSuggestFeedback(userText: string, assistantText: string): boolean {
  const u = userText.toLowerCase();
  const a = assistantText.toLowerCase();
  if (/bug|broken link|typo|incorrect|fix needed|does not work|doesn't work|error on page/i.test(u)) {
    return true;
  }
  if (/\bfile (an |a )?issue\b|\bgithub issue\b|\bopen a ticket\b/i.test(a)) {
    return true;
  }
  return false;
}

function buildGitHubNewIssueUrl(org: string, project: string, title: string, body: string): string {
  const base = `https://github.com/${org}/${project}/issues/new`;
  const params = new URLSearchParams();
  params.set('title', title.slice(0, 200));
  params.set('body', body.slice(0, 60000));
  params.set('labels', 'hub-assistant');
  return `${base}?${params.toString()}`;
}

function formatAssistantFetchError(message: string, apiBase: string): string {
  if (!/Failed to fetch|NetworkError|Load failed|Network request failed/i.test(message)) {
    return message;
  }
  const runApi = 'Run `npm run platform:api` (port 4100) in another terminal, then retry.';
  if (apiBase.startsWith('/')) {
    return `${message} ${runApi} Local dev proxies Hub calls through this site to avoid CORS.`;
  }
  return `${message} ${runApi} For a custom API URL, ensure the server sends Access-Control-Allow-Origin for this origin.`;
}

/** Dev proxy / gateways may return HTML or plain text (e.g. "Error occurred while proxying…") instead of JSON. */
async function readApiJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  const trimmed = text.trim();
  if (!trimmed) {
    return {} as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    const preview = trimmed.replace(/\s+/g, ' ').slice(0, 280);
    if (trimmed.startsWith('<')) {
      throw new Error(
        `Hub API returned HTML instead of JSON (HTTP ${response.status}). Check the assistant URL and dev proxy.`,
      );
    }
    if (/Error occurred while proxying|ECONNREFUSED|\[HPM\]/i.test(preview)) {
      throw new Error(
        `Dev proxy could not reach the platform API (HTTP ${response.status}): ${preview} Run \`npm run platform:api\` (port 4100) and retry.`,
      );
    }
    throw new Error(`Hub API returned non-JSON (HTTP ${response.status}): ${preview}`);
  }
}

function ChatGlyph(): React.ReactElement {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h2v2H7V9zm4 0h6v2h-6V9zm-4 4h8v2H7v-2z"
      />
    </svg>
  );
}

type HubAssistantPanelProps = {
  /** Tighter layout when shown inside the floating dock */
  variant: 'dock' | 'page';
};

export function HubAssistantPanel({variant}: HubAssistantPanelProps): React.ReactElement {
  const {siteConfig} = useDocusaurusContext();
  const location = useLocation();
  const custom = (siteConfig.customFields ?? {}) as SiteCustomFields;
  const apiBase = (custom.hubAssistantApiBase ?? '').replace(/\/$/, '');
  const feedbackSecret = custom.hubPublicFeedbackSecret ?? '';
  const org = String(siteConfig.organizationName ?? '');
  const project = String(siteConfig.projectName ?? '');
  const dock = variant === 'dock';

  const [storedJurisdiction, setStoredJurisdiction] = useState('unknown');
  useEffect(() => {
    setStoredJurisdiction(readPrimaryJurisdiction());
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSuggestion, setLastSuggestion] = useState(false);
  const [issueHint, setIssueHint] = useState<string | null>(null);

  const transcriptForIssue = useMemo(() => {
    return messages.map((m) => `**${m.role}:** ${m.content}`).join('\n\n');
  }, [messages]);

  const defaultIssueTitle = useMemo(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    const t = lastUser?.content?.trim() ?? 'Hub assistant feedback';
    return t.length > 120 ? `${t.slice(0, 117)}…` : t;
  }, [messages]);

  const issueBody = useMemo(() => {
    return [
      `## Context`,
      `- **Page:** ${location.pathname}`,
      `- **Primary jurisdiction (local profile):** ${storedJurisdiction}`,
      `- **Hub version:** ${custom.hubAppVersion ?? 'unknown'}`,
      '',
      '## Conversation',
      transcriptForIssue || '_No messages yet._',
    ].join('\n');
  }, [location.pathname, storedJurisdiction, transcriptForIssue, custom.hubAppVersion]);

  const send = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || busy) {
      return;
    }
    setError(null);
    setIssueHint(null);
    const userMessage: ChatMessage = {id: `u-${Date.now()}`, role: 'user', content: trimmed};
    setInput('');
    setMessages((prev) => [...prev, userMessage]);
    if (!apiBase) {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content:
            'The Hub Assistant API base URL is not configured for this deployment. Set `HUB_ASSISTANT_API_BASE_URL` at **build time** (see [Hub Assistant configuration](/docs/start-here/hub-assistant/)) and redeploy, or run the local platform API with `OPENAI_API_KEY` for development. You can still use **Open GitHub issue** below to file feedback manually.',
        },
      ]);
      return;
    }
    setBusy(true);
    try {
      const nextThread = [...messages, userMessage].map((m) => ({role: m.role, content: m.content}));
      const res = await fetch(`${apiBase}/assistant/chat`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          messages: nextThread,
          meta: {
            pagePath: location.pathname,
            primaryJurisdiction: readPrimaryJurisdiction(),
            hubVersion: custom.hubAppVersion,
          },
        }),
      });
      const payload = await readApiJson<{reply?: string; error?: string; detail?: string; hint?: string}>(res);
      if (!res.ok) {
        throw new Error(payload.error ?? payload.detail ?? `HTTP ${res.status}`);
      }
      const reply = String(payload.reply ?? '');
      const assistantMessage: ChatMessage = {id: `a-${Date.now()}`, role: 'assistant', content: reply};
      setMessages((prev) => [...prev, assistantMessage]);
      if (shouldSuggestFeedback(trimmed, reply)) {
        setLastSuggestion(true);
        setIssueHint('Heuristic match: this exchange may warrant a GitHub issue. Review and submit below.');
      } else {
        setLastSuggestion(false);
      }
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Request failed';
      setError(formatAssistantFetchError(raw, apiBase));
    } finally {
      setBusy(false);
    }
  }, [apiBase, busy, custom.hubAppVersion, input, location.pathname, messages]);

  const openPrefilledIssue = useCallback(() => {
    if (!org || !project) {
      setError('GitHub org/repo are not set in siteConfig (organizationName / projectName).');
      return;
    }
    const url = buildGitHubNewIssueUrl(org, project, defaultIssueTitle, issueBody);
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [defaultIssueTitle, issueBody, org, project]);

  const createIssueViaApi = useCallback(async () => {
    if (!apiBase) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const headers: Record<string, string> = {'Content-Type': 'application/json'};
      if (feedbackSecret) {
        headers['X-Hub-Feedback-Secret'] = feedbackSecret;
      }
      const res = await fetch(`${apiBase}/feedback/github-issue`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: defaultIssueTitle,
          body: issueBody,
          labels: ['hub-assistant'],
        }),
      });
      const payload = await readApiJson<{html_url?: string; error?: string; detail?: unknown}>(res);
      if (!res.ok) {
        throw new Error(payload.error ?? JSON.stringify(payload.detail ?? payload));
      }
      if (payload.html_url) {
        window.open(payload.html_url, '_blank', 'noopener,noreferrer');
      }
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'GitHub API filing failed';
      setError(formatAssistantFetchError(raw, apiBase));
    } finally {
      setBusy(false);
    }
  }, [apiBase, defaultIssueTitle, feedbackSecret, issueBody]);

  const pad = dock ? '0.75rem' : '1rem';
  const msgMinH = dock ? '160px' : '220px';
  const msgMaxH = dock ? 'min(38vh, 320px)' : '420px';

  return (
    <div>
      <div
        style={{
          border: dock ? 'none' : '1px solid var(--ifm-color-emphasis-300)',
          borderRadius: dock ? 0 : '8px',
          padding: pad,
          minHeight: msgMinH,
          maxHeight: msgMaxH,
          overflowY: 'auto',
          background: dock ? 'transparent' : 'var(--ifm-background-surface-color)',
          marginBottom: dock ? '0.5rem' : '0.75rem',
        }}>
        {messages.length === 0 ? (
          <p style={{color: 'var(--ifm-color-content-secondary)', margin: 0, fontSize: dock ? '0.88rem' : undefined}}>
            Ask about IAF domains, governance, templates, or the Hub. Your current path and primary jurisdiction are sent as
            context when chat is enabled.
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="margin-bottom--md">
              <div style={{fontSize: '0.75rem', fontWeight: 700, color: 'var(--ifm-color-secondary)'}}>
                {m.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <div style={{whiteSpace: 'pre-wrap', fontSize: '0.9rem'}}>{m.content}</div>
            </div>
          ))
        )}
      </div>

      {error ? (
        <p className="alert alert--danger" role="alert" style={{fontSize: '0.85rem', padding: '0.5rem 0.65rem'}}>
          {error}
        </p>
      ) : null}
      {issueHint ? (
        <p className="alert alert--info margin-bottom--sm" role="status" style={{fontSize: '0.82rem', padding: '0.45rem 0.6rem'}}>
          {issueHint}
        </p>
      ) : null}

      <textarea
        className="margin-bottom--sm"
        style={{width: '100%', minHeight: dock ? '72px' : '88px', padding: '0.5rem', fontSize: '0.9rem'}}
        placeholder="Describe your question or feedback…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={busy}
      />
      <div
        className="margin-bottom--sm"
        style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center'}}>
        <button type="button" className="button button--primary button--sm" disabled={busy} onClick={() => void send()}>
          {busy ? 'Working…' : 'Send'}
        </button>
        <button type="button" className="button button--secondary button--sm" disabled={busy || messages.length === 0} onClick={openPrefilledIssue}>
          Open GitHub issue
        </button>
        {apiBase ? (
          <button
            type="button"
            className="button button--secondary button--sm"
            disabled={busy || messages.length === 0}
            onClick={() => void createIssueViaApi()}
            title="Requires GITHUB_TOKEN and GITHUB_ISSUES_REPO on the API server">
            Create issue (API)
          </button>
        ) : null}
      </div>

      {lastSuggestion && !dock ? (
        <p style={{fontSize: '0.85rem', color: 'var(--ifm-color-content-secondary)'}}>
          Tip: when you describe defects or doc problems, the Hub highlights issue filing. Tune heuristics in{' '}
          <code>src/components/HubAssistant/index.tsx</code>.
        </p>
      ) : null}

      <p style={{fontSize: '0.78rem', color: 'var(--ifm-color-content-secondary)', marginBottom: 0}}>
        API: <code>{apiBase || 'not set'}</code> · Jurisdiction: <code>{storedJurisdiction}</code> ·{' '}
        <Link to="/docs/">Docs home</Link>
      </p>
    </div>
  );
}

function HubAssistantDock(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {open ? (
        <>
          <div
            className="iaf-hub-assistant-backdrop"
            aria-hidden
            onClick={() => {
              setOpen(false);
              toggleRef.current?.focus();
            }}
          />
          <div
            id="iaf-hub-assistant-dialog"
            className="iaf-hub-assistant-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="iaf-hub-assistant-title">
            <div className="iaf-hub-assistant-sheet__header">
              <h2 id="iaf-hub-assistant-title" className="iaf-hub-assistant-sheet__title">
                Hub Assistant
              </h2>
              <button
                type="button"
                className="iaf-hub-assistant-sheet__close"
                onClick={() => {
                  setOpen(false);
                  toggleRef.current?.focus();
                }}
                aria-label="Close Hub Assistant">
                ×
              </button>
            </div>
            <div className="iaf-hub-assistant-sheet__body">
              <HubAssistantPanel variant="dock" />
            </div>
          </div>
        </>
      ) : null}
      <button
        ref={toggleRef}
        type="button"
        className="iaf-hub-assistant-fab"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={open ? 'iaf-hub-assistant-dialog' : undefined}
        aria-haspopup="dialog"
        title={open ? 'Close assistant' : 'Open Hub Assistant'}>
        <ChatGlyph />
        <span className="iaf-hub-assistant-fab__label">Assistant</span>
      </button>
    </>
  );
}

/**
 * Floating launcher (bottom-right). Mount once from `theme/Root`.
 * Renders nothing during SSR / pre-hydration to match Docusaurus browser context.
 */
export default function HubAssistantLauncher(): React.ReactElement | null {
  const isBrowser = useIsBrowser();
  if (!isBrowser) {
    return null;
  }
  return <HubAssistantDock />;
}
