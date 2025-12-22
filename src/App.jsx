import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, Zap, Brain, Settings, Activity, MessageSquare,
  GitBranch, Database, Clock, CheckCircle2, AlertCircle, XCircle,
  Send, Paperclip, Code2, FileText, Image, Layers, Grid3X3,
  ChevronRight, ChevronDown, MoreHorizontal, Plus, Search,
  Calendar, Mail, Users, BarChart3, Target, Lightbulb,
  Shield, Eye, RefreshCw, Download, Upload, ExternalLink,
  Terminal, Cpu, Network, HardDrive, Sparkles, Workflow,
  Box, Folder, FileCode, Monitor, Smartphone, Globe
} from 'lucide-react';

// ============================================================================
// OPENROUTER CONFIGURATION
// ============================================================================

const OPENROUTER_API_KEY = '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

const AI_MODELS = {
  orchestration: {
    id: 'google/gemini-3-pro-preview',
    name: 'Gemini 3.0 Pro',
    description: 'Orchestration & Planning',
    color: 'from-blue-400 to-indigo-500'
  },
  architecture: {
    id: 'openai/chatgpt-4o-latest',
    name: 'ChatGPT 5.2',
    description: 'Architecture & Design',
    color: 'from-green-400 to-emerald-500'
  },
  coding: {
    id: 'anthropic/claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    description: 'Code Generation',
    color: 'from-orange-400 to-amber-500'
  },
  multiAgent: {
    id: 'anthropic/claude-opus-4.5',
    name: 'Claude Opus 4.5',
    description: 'Multi-Agent Coordination',
    color: 'from-purple-400 to-violet-500'
  },
  webScraping: {
    id: 'openai/chatgpt-4o-latest',
    name: 'ChatGPT 5.2',
    description: 'Web Scraping & Data',
    color: 'from-cyan-400 to-teal-500'
  }
};

// OpenRouter API call function
const callOpenRouter = async (messages, modelKey = 'orchestration') => {
  const model = AI_MODELS[modelKey];

  try {
    const response = await fetch(OPENROUTER_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Byte Command Center'
      },
      body: JSON.stringify({
        model: model.id,
        messages: messages,
        max_tokens: 2048,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response generated.';
  } catch (error) {
    console.error('OpenRouter API error:', error);
    return `Error connecting to ${model.name}. Please check your connection and try again.`;
  }
};

// ============================================================================
// GOOGLE WORKSPACE CONFIGURATION (AutoAcquireai.com)
// ============================================================================

const GOOGLE_CONFIG = {
  clientId: '652450540938-9o6ui6nh5dum7lk6oc444sqet927c3oj.apps.googleusercontent.com',
  // Use root URL for SPA OAuth flow - simpler and works with Cloudflare Pages
  redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
  scopes: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/documents.readonly',
    'https://www.googleapis.com/auth/spreadsheets.readonly',
  ].join(' '),
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
};

// Google OAuth State Management
const useGoogleAuth = () => {
  const [googleToken, setGoogleToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('google_access_token');
    }
    return null;
  });
  const [googleUser, setGoogleUser] = useState(null);

  const initiateGoogleOAuth = () => {
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem('oauth_state', state);

    const params = new URLSearchParams({
      client_id: GOOGLE_CONFIG.clientId,
      redirect_uri: GOOGLE_CONFIG.redirectUri,
      response_type: 'token',
      scope: GOOGLE_CONFIG.scopes,
      state: state,
      access_type: 'online',
      prompt: 'consent'
    });

    window.location.href = `${GOOGLE_CONFIG.authUrl}?${params}`;
  };

  const handleOAuthCallback = () => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');

    if (accessToken) {
      localStorage.setItem('google_access_token', accessToken);
      setGoogleToken(accessToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const disconnectGoogle = () => {
    localStorage.removeItem('google_access_token');
    setGoogleToken(null);
    setGoogleUser(null);
  };

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  return { googleToken, googleUser, initiateGoogleOAuth, disconnectGoogle, isConnected: !!googleToken };
};

// Gmail API Functions
const GmailAPI = {
  baseUrl: 'https://gmail.googleapis.com/gmail/v1',

  async fetchEmails(token, maxResults = 20, query = '') {
    try {
      const params = new URLSearchParams({ maxResults, q: query });
      const response = await fetch(
        `${this.baseUrl}/users/me/messages?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Failed to fetch emails');
      const data = await response.json();

      // Fetch full details for each message
      const messages = await Promise.all(
        (data.messages || []).slice(0, 10).map(msg => this.getEmail(token, msg.id))
      );
      return messages;
    } catch (error) {
      console.error('Gmail API error:', error);
      return [];
    }
  },

  async getEmail(token, messageId) {
    const response = await fetch(
      `${this.baseUrl}/users/me/messages/${messageId}?format=full`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.ok) return null;
    const data = await response.json();

    const headers = data.payload?.headers || [];
    const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    return {
      id: data.id,
      threadId: data.threadId,
      snippet: data.snippet,
      subject: getHeader('Subject'),
      from: getHeader('From'),
      to: getHeader('To'),
      date: getHeader('Date'),
      labels: data.labelIds || [],
      isUnread: data.labelIds?.includes('UNREAD'),
    };
  },

  async getLabels(token) {
    const response = await fetch(
      `${this.baseUrl}/users/me/labels`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.labels || [];
  },

  async sendEmail(token, to, subject, body) {
    const email = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      body
    ].join('\r\n');

    const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const response = await fetch(
      `${this.baseUrl}/users/me/messages/send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encodedEmail })
      }
    );
    return response.ok;
  },

  async modifyLabels(token, messageId, addLabels = [], removeLabels = []) {
    const response = await fetch(
      `${this.baseUrl}/users/me/messages/${messageId}/modify`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ addLabelIds: addLabels, removeLabelIds: removeLabels })
      }
    );
    return response.ok;
  }
};

// Google Docs API Functions
const DocsAPI = {
  baseUrl: 'https://docs.googleapis.com/v1',

  async getDocument(token, documentId) {
    const response = await fetch(
      `${this.baseUrl}/documents/${documentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.ok) return null;
    return response.json();
  }
};

// Google Sheets API Functions
const SheetsAPI = {
  baseUrl: 'https://sheets.googleapis.com/v4',

  async getSpreadsheet(token, spreadsheetId) {
    const response = await fetch(
      `${this.baseUrl}/spreadsheets/${spreadsheetId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.ok) return null;
    return response.json();
  },

  async getValues(token, spreadsheetId, range) {
    const response = await fetch(
      `${this.baseUrl}/spreadsheets/${spreadsheetId}/values/${range}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.ok) return null;
    return response.json();
  }
};

// Google Drive API Functions
const DriveAPI = {
  baseUrl: 'https://www.googleapis.com/drive/v3',

  async listFiles(token, query = '', maxResults = 20) {
    const params = new URLSearchParams({
      pageSize: maxResults,
      fields: 'files(id,name,mimeType,modifiedTime,webViewLink)',
      q: query || "trashed=false"
    });
    const response = await fetch(
      `${this.baseUrl}/files?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.files || [];
  }
};

// Inbox Automation Agent Definitions
const INBOX_AUTOMATION_AGENTS = [
  {
    id: 101,
    name: 'Email Triage Agent',
    category: 'Morning Ops',
    schedule: '0 6 * * 1-5',
    status: 'idle',
    progress: 0,
    qualityScore: 95,
    executions: 0,
    avgRuntime: '1.5m',
    model: 'orchestration',
    tools: ['gmail'],
    autoApproval: false,
    systemPrompt: `You are an email triage assistant for AutoAcquireai.com. Analyze incoming emails and:
1. Categorize by priority: Urgent, Important, Normal, Low
2. Identify action items and deadlines
3. Flag emails requiring immediate response
4. Summarize key points for each email
Output as structured JSON with priority, actionItems, and summary fields.`,
    lastOutput: null
  },
  {
    id: 102,
    name: 'Lead Response Agent',
    category: 'Productivity',
    schedule: 'Hourly',
    status: 'idle',
    progress: 0,
    qualityScore: 92,
    executions: 0,
    avgRuntime: '2.0m',
    model: 'coding',
    tools: ['gmail', 'sheets'],
    autoApproval: false,
    systemPrompt: `You are a lead response assistant for AutoAcquireai.com. When new leads come in:
1. Draft personalized response emails
2. Log lead details to tracking spreadsheet
3. Set follow-up reminders
4. Identify high-value opportunities
Always maintain professional tone matching AutoAcquireai.com brand.`,
    lastOutput: null
  },
  {
    id: 103,
    name: 'Invoice & Document Agent',
    category: 'Productivity',
    schedule: 'Daily',
    status: 'idle',
    progress: 0,
    qualityScore: 94,
    executions: 0,
    avgRuntime: '3.0m',
    model: 'architecture',
    tools: ['gmail', 'drive', 'sheets'],
    autoApproval: true,
    systemPrompt: `You are a document processing assistant. Scan emails for:
1. Invoices and receipts - extract amounts, dates, vendors
2. Contracts and agreements - flag for review
3. Reports and documents - categorize and file
4. Update expense tracking spreadsheet
Output extracted data in structured format.`,
    lastOutput: null
  },
  {
    id: 104,
    name: 'Meeting Scheduler Agent',
    category: 'Productivity',
    schedule: 'Continuous',
    status: 'idle',
    progress: 0,
    qualityScore: 91,
    executions: 0,
    avgRuntime: '1.0m',
    model: 'orchestration',
    tools: ['gmail', 'calendar'],
    autoApproval: false,
    systemPrompt: `You are a scheduling assistant. When meeting requests arrive:
1. Check calendar availability
2. Propose optimal meeting times
3. Draft confirmation emails
4. Create calendar events with proper details
Prioritize client meetings and revenue-generating activities.`,
    lastOutput: null
  }
];

// ============================================================================
// MODEL SELECTOR COMPONENT
// ============================================================================

const ModelSelector = ({ selectedModel, onModelChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const model = AI_MODELS[selectedModel];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${model.color} bg-opacity-20 border border-slate-600 rounded-lg text-sm hover:border-cyan-500/50 transition-all`}
      >
        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${model.color}`} />
        <span className="text-white font-medium">{model.name}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-slate-700">
            <p className="text-xs text-slate-500 px-2">Select AI Model</p>
          </div>
          <div className="p-2 space-y-1">
            {Object.entries(AI_MODELS).map(([key, m]) => (
              <button
                key={key}
                onClick={() => {
                  onModelChange(key);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  selectedModel === key
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${m.color}`} />
                <div className="text-left">
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.description}</p>
                </div>
                {selectedModel === key && (
                  <CheckCircle2 className="w-4 h-4 ml-auto text-cyan-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// BYTE COMMAND CENTER
// ============================================================================

const ByteCommandCenter = () => {
  const [activeView, setActiveView] = useState('command');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedModel, setSelectedModel] = useState('orchestration');

  // Google Workspace Auth
  const googleAuth = useGoogleAuth();

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'system',
      content: 'Welcome to Byte. I can help you prototype applications, delegate to your dev team, or orchestrate your multi-agent system. What would you like to build today?',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [outboxItems, setOutboxItems] = useState(INITIAL_OUTBOX);
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);
  const [memoryStats, setMemoryStats] = useState({
    scratchpad: { items: 47, ttl: '24-72h' },
    episodic: { items: 1243, ttl: '30-90d' },
    fact: { items: 892, ttl: 'Permanent' },
    experiential: { items: 156, ttl: 'Permanent' }
  });

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        lastRun: agent.status === 'running' ? new Date() : agent.lastRun,
        progress: agent.status === 'running'
          ? Math.min(100, agent.progress + Math.random() * 15)
          : agent.progress
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    const apiMessages = [
      { role: 'system', content: 'You are Byte, an AI assistant for a multi-agent orchestration platform. Help users build applications, manage agents, and automate workflows. Be concise and helpful.' },
      ...messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: inputValue }
    ];

    try {
      const response = await callOpenRouter(apiMessages, selectedModel);
      const artifacts = detectArtifacts(inputValue, response);

      setMessages(prev => [...prev, {
        id: prev.length + 1,
        role: 'assistant',
        content: response,
        artifacts: artifacts,
        timestamp: new Date(),
        model: AI_MODELS[selectedModel].name
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        role: 'assistant',
        content: 'I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      }]);
    }

    setIsProcessing(false);
  };

  const detectArtifacts = (input, response) => {
    const artifacts = [];
    const lowered = input.toLowerCase();

    if (lowered.includes('component') || lowered.includes('dashboard')) {
      artifacts.push({ type: 'component', name: 'GeneratedComponent.jsx', size: '3.2 KB' });
    }
    if (lowered.includes('document') || lowered.includes('spec')) {
      artifacts.push({ type: 'document', name: 'Specification.md', size: '1.8 KB' });
    }
    if (response.includes('```')) {
      artifacts.push({ type: 'component', name: 'CodeOutput.jsx', size: '2.1 KB' });
    }

    return artifacts;
  };

  return (
    <div className="h-screen w-full bg-slate-950 text-white font-sans overflow-hidden flex">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[128px]" />
      </div>

      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        agents={agents}
        outboxItems={outboxItems}
      />

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <TopBar activeView={activeView} selectedModel={selectedModel} />

        <div className="flex-1 overflow-hidden">
          {activeView === 'command' && (
            <CommandCenterView
              messages={messages}
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleSend={handleSend}
              isProcessing={isProcessing}
              chatEndRef={chatEndRef}
              agents={agents}
              memoryStats={memoryStats}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
            />
          )}
          {activeView === 'prototype' && (
            <PrototypeView
              messages={messages}
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleSend={handleSend}
              isProcessing={isProcessing}
              chatEndRef={chatEndRef}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
            />
          )}
          {activeView === 'agents' && (
            <AgentsView
              agents={agents}
              setAgents={setAgents}
              selectedAgent={selectedAgent}
              setSelectedAgent={setSelectedAgent}
            />
          )}
          {activeView === 'outbox' && (
            <OutboxView
              outboxItems={outboxItems}
              setOutboxItems={setOutboxItems}
            />
          )}
          {activeView === 'integrations' && (
            <IntegrationsView
              integrations={integrations}
              setIntegrations={setIntegrations}
              googleAuth={googleAuth}
            />
          )}
          {activeView === 'memory' && (
            <MemoryView memoryStats={memoryStats} />
          )}
        </div>
      </main>
    </div>
  );
};

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

const Sidebar = ({ activeView, setActiveView, collapsed, setCollapsed, agents, outboxItems }) => {
  const navItems = [
    { id: 'command', icon: Cpu, label: 'Command Center', badge: null },
    { id: 'prototype', icon: Sparkles, label: 'Rapid Prototype', badge: null },
    { id: 'agents', icon: Brain, label: 'Agent Monitor', badge: agents.filter(a => a.status === 'running').length },
    { id: 'outbox', icon: Send, label: 'Outbox', badge: outboxItems.filter(i => i.status === 'pending').length },
    { id: 'integrations', icon: Network, label: 'Integrations', badge: null },
    { id: 'memory', icon: Database, label: 'Memory System', badge: null },
  ];

  return (
    <aside className={`relative z-20 flex flex-col bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg tracking-tight">Byte</h1>
              <p className="text-xs text-slate-500">Multi-Model Platform</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
              activeView === item.id
                ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 text-cyan-400 shadow-lg shadow-cyan-500/5'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeView === item.id ? 'text-cyan-400' : ''}`} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                {item.badge !== null && item.badge > 0 && (
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    activeView === item.id ? 'bg-cyan-500 text-slate-900' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-800">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
          {!collapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

// ============================================================================
// TOP BAR COMPONENT
// ============================================================================

const TopBar = ({ activeView, selectedModel }) => {
  const titles = {
    command: 'Command Center',
    prototype: 'Rapid Prototype',
    agents: 'Agent Monitor',
    outbox: 'Action Outbox',
    integrations: 'Tool Integrations',
    memory: 'Memory System'
  };

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">{titles[activeView]}</h2>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-full">
          <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
          <span className="text-xs text-teal-400 font-medium">System Online</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search agents, projects..."
            className="bg-transparent text-sm text-white placeholder-slate-500 outline-none w-48"
          />
          <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-400">⌘K</kbd>
        </div>
        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

// ============================================================================
// COMMAND CENTER VIEW
// ============================================================================

const CommandCenterView = ({
  messages, inputValue, setInputValue, handleSend, isProcessing, chatEndRef,
  agents, memoryStats, selectedModel, setSelectedModel
}) => {
  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col">
        <div className="px-6 py-4 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Quick Actions:</span>
              {QUICK_ACTIONS.map((action, i) => (
                <button
                  key={i}
                  onClick={() => setInputValue(action.prompt)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-all"
                >
                  <action.icon className="w-4 h-4 text-cyan-400" />
                  {action.label}
                </button>
              ))}
            </div>
            <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isProcessing && (
            <div className="flex items-center gap-3 text-slate-400">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-teal-600 rounded-lg flex items-center justify-center animate-pulse">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm">Processing with {AI_MODELS[selectedModel].name}...</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <ChatInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSend={handleSend}
          isProcessing={isProcessing}
        />
      </div>

      <div className="w-80 border-l border-slate-800/50 bg-slate-900/30 overflow-y-auto">
        <div className="p-4 border-b border-slate-800/50">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Active Agents
          </h3>
          <div className="space-y-2">
            {agents.filter(a => a.status === 'running').slice(0, 4).map(agent => (
              <div key={agent.id} className="flex items-center gap-3 p-2 bg-slate-800/30 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-lg flex items-center justify-center text-xs font-bold">
                  #{agent.id}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{agent.name}</p>
                  <div className="w-full h-1 bg-slate-700 rounded-full mt-1">
                    <div
                      className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full transition-all"
                      style={{ width: `${agent.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-b border-slate-800/50">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            Memory Tiers
          </h3>
          <div className="space-y-3">
            {Object.entries(memoryStats).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-slate-400 capitalize">{key}</span>
                <span className="text-sm font-mono text-slate-300">{value.items}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            Recent Outputs
          </h3>
          <div className="space-y-2">
            {RECENT_OUTPUTS.map((output, i) => (
              <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-800/30 rounded-lg cursor-pointer transition-all">
                <output.icon className={`w-4 h-4 ${output.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{output.title}</p>
                  <p className="text-xs text-slate-500">{output.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PROTOTYPE VIEW
// ============================================================================

const PrototypeView = ({ messages, inputValue, setInputValue, handleSend, isProcessing, chatEndRef, selectedModel, setSelectedModel }) => {
  const [previewMode, setPreviewMode] = useState('split');
  const [activeTab, setActiveTab] = useState('preview');

  return (
    <div className="h-full flex">
      <div className={`flex flex-col bg-slate-900/50 border-r border-slate-800/50 ${previewMode === 'split' ? 'w-1/2' : previewMode === 'chat' ? 'flex-1' : 'w-80'}`}>
        <div className="p-4 border-b border-slate-800/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium">Start from template</span>
            </div>
            <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
          </div>
          <div className="flex flex-wrap gap-2">
            {PROJECT_TEMPLATES.map((template, i) => (
              <button
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-cyan-500/10 border border-slate-700 hover:border-cyan-500/50 rounded-lg text-xs transition-all"
              >
                <template.icon className="w-3.5 h-3.5 text-cyan-400" />
                {template.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} compact />
          ))}
          {isProcessing && <ProcessingIndicator model={AI_MODELS[selectedModel].name} />}
          <div ref={chatEndRef} />
        </div>

        <ChatInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSend={handleSend}
          isProcessing={isProcessing}
          placeholder="Describe what you want to build..."
        />
      </div>

      {previewMode !== 'chat' && (
        <div className="flex-1 flex flex-col bg-slate-950">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/50">
            <div className="flex items-center gap-1">
              {['preview', 'code', 'files'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                <Monitor className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                <Smartphone className="w-4 h-4" />
              </button>
              <button className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-medium text-sm rounded-lg transition-all flex items-center gap-2">
                <Play className="w-3.5 h-3.5" />
                Deploy
              </button>
            </div>
          </div>

          <div className="flex-1 relative">
            {activeTab === 'preview' && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl flex items-center justify-center">
                    <Globe className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="text-slate-400 mb-2">No preview available</p>
                  <p className="text-sm text-slate-500">Start building to see your app here</p>
                </div>
              </div>
            )}
            {activeTab === 'code' && <CodeEditor />}
            {activeTab === 'files' && <FileExplorer />}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// AGENTS VIEW
// ============================================================================

const AgentsView = ({ agents, setAgents, selectedAgent, setSelectedAgent }) => {
  const agentCategories = [
    { id: 'morning', label: 'Morning Ops', time: '06:00-07:30', color: 'cyan' },
    { id: 'evening', label: 'Evening Intel', time: '20:00-21:00', color: 'indigo' },
    { id: 'improvement', label: 'Improvement', time: '21:45', color: 'teal' },
    { id: 'productivity', label: 'Productivity', time: 'Continuous', color: 'sky' },
    { id: 'review', label: 'Review', time: 'On-demand', color: 'rose' },
  ];

  return (
    <div className="h-full flex">
      <div className="w-96 border-r border-slate-800/50 flex flex-col">
        <div className="p-4 border-b border-slate-800/50">
          <div className="flex flex-wrap gap-2">
            {agentCategories.map(cat => (
              <button
                key={cat.id}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all bg-${cat.color}-500/10 border-${cat.color}-500/30 text-${cat.color}-400 hover:bg-${cat.color}-500/20`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {agents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              selected={selectedAgent?.id === agent.id}
              onClick={() => setSelectedAgent(agent)}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 bg-slate-900/30">
        {selectedAgent ? (
          <AgentDetail agent={selectedAgent} setAgents={setAgents} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Brain className="w-16 h-16 mx-auto mb-4 text-slate-700" />
              <p className="text-slate-400">Select an agent to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AgentCard = ({ agent, selected, onClick }) => {
  const statusColors = {
    running: 'bg-teal-400',
    idle: 'bg-slate-500',
    scheduled: 'bg-cyan-400',
    error: 'bg-red-400'
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border cursor-pointer transition-all ${
        selected
          ? 'bg-slate-800/50 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
          : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
          agent.status === 'running'
            ? 'bg-gradient-to-br from-teal-400 to-cyan-600 text-white'
            : 'bg-slate-700 text-slate-300'
        }`}>
          #{agent.id}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium truncate">{agent.name}</h4>
            <div className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{agent.category}</p>
          {agent.status === 'running' && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Progress</span>
                <span>{Math.round(agent.progress)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-700 rounded-full">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full transition-all"
                  style={{ width: `${agent.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AgentDetail = ({ agent, setAgents }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold ${
              agent.status === 'running'
                ? 'bg-gradient-to-br from-teal-400 to-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                : 'bg-slate-700 text-slate-300'
            }`}>
              #{agent.id}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{agent.name}</h2>
              <p className="text-sm text-slate-400">{agent.category} • {agent.schedule}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-all flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Trigger Now
            </button>
            <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-medium rounded-lg text-sm transition-all flex items-center gap-2">
              <Play className="w-4 h-4" />
              Run
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="Quality Score" value={`${agent.qualityScore}%`} icon={Target} color="cyan" />
          <StatCard label="Executions" value={agent.executions} icon={Activity} color="teal" />
          <StatCard label="Avg Runtime" value={agent.avgRuntime} icon={Clock} color="indigo" />
        </div>

        <div className="bg-slate-800/30 rounded-xl p-4 mb-6">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Latest Output
          </h3>
          <div className="bg-slate-900/50 rounded-lg p-4 font-mono text-sm text-slate-300 max-h-64 overflow-y-auto">
            {agent.lastOutput || 'No recent output available'}
          </div>
        </div>

        <div className="bg-slate-800/30 rounded-xl p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            Configuration
          </h3>
          <div className="space-y-3">
            <ConfigRow label="Prompt Template" value={agent.promptTemplate || 'default'} />
            <ConfigRow label="Tools Access" value={agent.tools?.join(', ') || 'None'} />
            <ConfigRow label="Auto-Approval" value={agent.autoApproval ? 'Enabled' : 'Disabled'} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// OUTBOX VIEW
// ============================================================================

const OutboxView = ({ outboxItems, setOutboxItems }) => {
  const handleApprove = (id) => {
    setOutboxItems(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'approved' } : item
    ));
  };

  const handleReject = (id) => {
    setOutboxItems(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'rejected' } : item
    ));
  };

  const statusFilters = ['all', 'pending', 'approved', 'rejected'];
  const [activeFilter, setActiveFilter] = useState('pending');

  const filteredItems = activeFilter === 'all'
    ? outboxItems
    : outboxItems.filter(item => item.status === activeFilter);

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {statusFilters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              {filter === 'pending' && (
                <span className="ml-2 px-1.5 py-0.5 bg-cyan-500 text-slate-900 text-xs rounded-full">
                  {outboxItems.filter(i => i.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Shield className="w-4 h-4" />
          Common Sense Protocol: 76% Auto-Approval
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {filteredItems.map(item => (
            <OutboxCard
              key={item.id}
              item={item}
              onApprove={() => handleApprove(item.id)}
              onReject={() => handleReject(item.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const OutboxCard = ({ item, onApprove, onReject }) => {
  const statusConfig = {
    pending: { icon: AlertCircle, color: 'cyan', label: 'Pending Review' },
    approved: { icon: CheckCircle2, color: 'teal', label: 'Approved' },
    rejected: { icon: XCircle, color: 'red', label: 'Rejected' }
  };

  const config = statusConfig[item.status];

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-${config.color}-500/20 flex items-center justify-center`}>
            <config.icon className={`w-5 h-5 text-${config.color}-400`} />
          </div>
          <div>
            <h4 className="font-medium">{item.action}</h4>
            <p className="text-sm text-slate-400">Agent #{item.agentId} • {item.category}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${config.color}-500/20 text-${config.color}-400`}>
          {config.label}
        </span>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
        <p className="text-sm text-slate-300">{item.description}</p>
      </div>

      {item.status === 'pending' && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Risk Level: <span className={`text-${item.risk === 'low' ? 'teal' : item.risk === 'medium' ? 'cyan' : 'red'}-400`}>
              {item.risk.charAt(0).toUpperCase() + item.risk.slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onReject}
              className="px-4 py-2 bg-slate-700 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-sm transition-all"
            >
              Reject
            </button>
            <button
              onClick={onApprove}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-medium rounded-lg text-sm transition-all"
            >
              Approve
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// INTEGRATIONS VIEW
// ============================================================================

const IntegrationsView = ({ integrations, setIntegrations, googleAuth }) => {
  const categories = ['All', 'Productivity', 'Communication', 'Development', 'Analytics'];
  const [activeCategory, setActiveCategory] = useState('All');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [emails, setEmails] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState(false);

  const handleGoogleConnect = () => {
    if (GOOGLE_CONFIG.clientId) {
      googleAuth.initiateGoogleOAuth();
    } else {
      setShowGoogleModal(true);
    }
  };

  const fetchRecentEmails = async () => {
    if (!googleAuth.googleToken) return;
    setLoadingEmails(true);
    const fetchedEmails = await GmailAPI.fetchEmails(googleAuth.googleToken, 10, 'is:unread');
    setEmails(fetchedEmails.filter(Boolean));
    setLoadingEmails(false);
  };

  useEffect(() => {
    if (googleAuth.isConnected) {
      fetchRecentEmails();
    }
  }, [googleAuth.isConnected]);

  const filteredIntegrations = activeCategory === 'All'
    ? integrations
    : integrations.filter(i => i.category === activeCategory);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-medium rounded-lg text-sm transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Integration
        </button>
      </div>

      {/* Google Workspace Connected Panel */}
      {googleAuth.isConnected && (
        <div className="mb-6 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-teal-400">Google Workspace Connected</h3>
                <p className="text-sm text-slate-400">AutoAcquireai.com • Gmail, Docs, Sheets active</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchRecentEmails}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loadingEmails ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={googleAuth.disconnectGoogle}
                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm"
              >
                Disconnect
              </button>
            </div>
          </div>

          {/* Recent Emails Preview */}
          {emails.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                Unread Emails ({emails.length})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {emails.map(email => (
                  <div key={email.id} className="bg-slate-800/50 rounded-lg p-3 hover:bg-slate-800 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{email.subject || '(No Subject)'}</p>
                        <p className="text-xs text-slate-500 truncate">{email.from}</p>
                      </div>
                      <span className="text-xs text-slate-600 ml-2">{new Date(email.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{email.snippet}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {filteredIntegrations.map(integration => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onConnect={integration.name === 'Google Workspace' ? handleGoogleConnect : undefined}
            isGoogleConnected={integration.name === 'Google Workspace' && googleAuth.isConnected}
          />
        ))}
      </div>

      {/* Google Setup Modal */}
      {showGoogleModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowGoogleModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl max-w-lg w-full">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Connect Google Workspace</h3>
                <button onClick={() => setShowGoogleModal(false)} className="p-1 hover:bg-slate-800 rounded-lg">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-slate-400 mb-4">To connect Google Workspace for AutoAcquireai.com:</p>
                <ol className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google Cloud Console</a></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span>Create OAuth 2.0 credentials (Web application)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span>Add redirect URI: <code className="bg-slate-800 px-2 py-0.5 rounded text-xs">{GOOGLE_CONFIG.redirectUri || window.location.origin}</code></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <span>Enable Gmail, Drive, Docs, and Sheets APIs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                    <span>Copy Client ID and add to GOOGLE_CONFIG.clientId</span>
                  </li>
                </ol>
                <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-2">Required OAuth Scopes:</p>
                  <code className="text-xs text-cyan-400 break-all">{GOOGLE_CONFIG.scopes}</code>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const IntegrationCard = ({ integration, onConnect, isGoogleConnected }) => {
  const isConnected = isGoogleConnected !== undefined ? isGoogleConnected : integration.connected;

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${integration.gradient} flex items-center justify-center shadow-lg`}>
            <integration.icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-medium">{integration.name}</h4>
            <p className="text-xs text-slate-500">{integration.category}</p>
          </div>
        </div>
        <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-teal-400' : 'bg-slate-600'}`} />
      </div>
      <p className="text-sm text-slate-400 mb-4">{integration.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">VFS: {integration.vfsPath}</span>
        <button
          onClick={onConnect}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            isConnected
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              : 'bg-cyan-500 text-slate-900 hover:bg-cyan-400'
          }`}
        >
          {isConnected ? 'Configure' : 'Connect'}
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MEMORY VIEW
// ============================================================================

const MemoryView = ({ memoryStats }) => {
  const memoryTiers = [
    {
      id: 'scratchpad',
      name: 'Scratchpad',
      icon: FileText,
      color: 'sky',
      ttl: '24-72 hours',
      description: 'Short-term working memory for agent-to-agent communication',
      items: memoryStats.scratchpad.items
    },
    {
      id: 'episodic',
      name: 'Episodic',
      icon: Calendar,
      color: 'indigo',
      ttl: '30-90 days',
      description: 'Daily record of all agent outputs and events',
      items: memoryStats.episodic.items
    },
    {
      id: 'fact',
      name: 'Fact Store',
      icon: Database,
      color: 'teal',
      ttl: 'Permanent',
      description: 'Validated, canonical knowledge extracted from episodic memory',
      items: memoryStats.fact.items
    },
    {
      id: 'experiential',
      name: 'Experiential',
      icon: Lightbulb,
      color: 'cyan',
      ttl: 'Permanent',
      description: 'Abstracted patterns, lessons, and meta-insights',
      items: memoryStats.experiential.items
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Memory Pipeline</h3>
        <div className="flex items-center justify-between bg-slate-800/30 rounded-xl p-6">
          {memoryTiers.map((tier, i) => (
            <React.Fragment key={tier.id}>
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-${tier.color}-500/20 flex items-center justify-center`}>
                  <tier.icon className={`w-8 h-8 text-${tier.color}-400`} />
                </div>
                <p className="font-medium">{tier.name}</p>
                <p className="text-xs text-slate-500">{tier.ttl}</p>
              </div>
              {i < memoryTiers.length - 1 && (
                <ChevronRight className="w-6 h-6 text-slate-600" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {memoryTiers.map(tier => (
          <div key={tier.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg bg-${tier.color}-500/20 flex items-center justify-center`}>
                <tier.icon className={`w-5 h-5 text-${tier.color}-400`} />
              </div>
              <div>
                <h4 className="font-medium">{tier.name}</h4>
                <p className="text-xs text-slate-500">TTL: {tier.ttl}</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4">{tier.description}</p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
              <span className="text-2xl font-bold">{tier.items.toLocaleString()}</span>
              <span className="text-sm text-slate-500">items</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

const MessageBubble = ({ message, compact }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
          isSystem ? 'bg-slate-700' : 'bg-gradient-to-br from-cyan-400 to-teal-600'
        }`}>
          {isSystem ? <Code2 className="w-4 h-4 text-cyan-400" /> : <Brain className="w-4 h-4 text-white" />}
        </div>
      )}
      <div className={`max-w-2xl ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-cyan-500 text-slate-900'
            : isSystem
              ? 'bg-slate-800/50 text-slate-300'
              : 'bg-slate-800/50 text-slate-100'
        } ${compact ? 'text-sm' : ''}`}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        {message.artifacts && message.artifacts.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.artifacts.map((artifact, i) => (
              <ArtifactCard key={i} artifact={artifact} />
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-slate-500">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          {message.model && (
            <span className="text-xs text-slate-600">• {message.model}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const ArtifactCard = ({ artifact }) => {
  const icons = {
    component: Code2,
    document: FileText,
    image: Image,
    project: Folder
  };
  const Icon = icons[artifact.type] || FileCode;

  return (
    <div className="inline-flex items-center gap-3 px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl hover:border-cyan-500/50 transition-all cursor-pointer">
      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400/20 to-teal-500/20 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-cyan-400" />
      </div>
      <div className="text-left">
        <p className="text-sm font-medium text-white">{artifact.name}</p>
        <p className="text-xs text-slate-400">{artifact.type} • {artifact.size}</p>
      </div>
      <ExternalLink className="w-4 h-4 text-slate-500" />
    </div>
  );
};

const ChatInput = ({ inputValue, setInputValue, handleSend, isProcessing, placeholder }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-slate-800/50">
      <div className="flex items-end gap-3 bg-slate-800/50 rounded-xl p-3 border border-slate-700 focus-within:border-cyan-500/50 transition-all">
        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
          <Paperclip className="w-5 h-5" />
        </button>
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Ask anything, build anything..."}
          rows={1}
          className="flex-1 bg-transparent resize-none outline-none text-white placeholder-slate-500"
          style={{ minHeight: '24px', maxHeight: '120px' }}
        />
        <button
          onClick={handleSend}
          disabled={isProcessing || !inputValue.trim()}
          className="p-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 rounded-lg transition-all"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      <div className="flex items-center gap-4 mt-2 px-2">
        <span className="text-xs text-slate-500">Pro tip: Use @ to mention agents, / for commands</span>
      </div>
    </div>
  );
};

const ProcessingIndicator = ({ model }) => (
  <div className="flex items-center gap-3 text-slate-400">
    <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-teal-600 rounded-lg flex items-center justify-center animate-pulse">
      <Brain className="w-4 h-4 text-white" />
    </div>
    <span className="text-sm">Processing with {model || 'AI'}...</span>
    <div className="flex gap-1">
      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className={`bg-${color}-500/10 border border-${color}-500/20 rounded-xl p-4`}>
    <div className="flex items-center gap-2 mb-2">
      <Icon className={`w-4 h-4 text-${color}-400`} />
      <span className="text-sm text-slate-400">{label}</span>
    </div>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const ConfigRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
    <span className="text-sm text-slate-400">{label}</span>
    <span className="text-sm font-mono text-slate-300">{value}</span>
  </div>
);

const CodeEditor = () => (
  <div className="h-full bg-slate-900 p-4 font-mono text-sm">
    <div className="text-slate-500">// Your generated code will appear here</div>
    <div className="text-slate-600 mt-2">// Start building to see live code output</div>
  </div>
);

const FileExplorer = () => (
  <div className="h-full bg-slate-900/50 p-4">
    <div className="flex items-center gap-2 text-slate-400 mb-4">
      <Folder className="w-4 h-4" />
      <span className="text-sm">Project Files</span>
    </div>
    <div className="text-sm text-slate-500">No files yet. Start building to create project structure.</div>
  </div>
);

// ============================================================================
// DATA & CONSTANTS
// ============================================================================

const QUICK_ACTIONS = [
  { icon: Code2, label: 'New Component', prompt: 'Create a new React component for ' },
  { icon: FileText, label: 'Draft Spec', prompt: 'Draft a product specification for ' },
  { icon: Users, label: 'Assign Team', prompt: 'Delegate this task to the dev team: ' },
  { icon: BarChart3, label: 'Run Analysis', prompt: 'Analyze our current metrics for ' },
];

const PROJECT_TEMPLATES = [
  { icon: Monitor, label: 'Dashboard' },
  { icon: Globe, label: 'Landing Page' },
  { icon: Smartphone, label: 'Mobile App' },
  { icon: Database, label: 'API Service' },
  { icon: Box, label: 'Component Library' },
];

const RECENT_OUTPUTS = [
  { icon: FileText, title: 'Morning Revenue Report', time: '2 hours ago', color: 'text-cyan-400' },
  { icon: Code2, title: 'Dashboard Component', time: '4 hours ago', color: 'text-teal-400' },
  { icon: Mail, title: 'Weekly Digest Draft', time: '5 hours ago', color: 'text-indigo-400' },
];

const INITIAL_AGENTS = [
  { id: 1, name: 'Revenue Priority Agent', category: 'Morning Ops', schedule: '06:00', status: 'running', progress: 45, qualityScore: 94, executions: 847, avgRuntime: '2.3m', lastOutput: '## Revenue Analysis\n\nTop 3 revenue priorities for today:\n1. Close Q4 enterprise deal ($2.4M)\n2. Upsell opportunity with Client XYZ\n3. Review pricing strategy feedback', tools: ['Asana', 'MS365', 'Slack'], autoApproval: true },
  { id: 2, name: 'Team Unblocker', category: 'Morning Ops', schedule: '06:15', status: 'idle', progress: 0, qualityScore: 91, executions: 634, avgRuntime: '1.8m', lastOutput: null },
  { id: 3, name: 'Operational Excellence', category: 'Morning Ops', schedule: '06:30', status: 'scheduled', progress: 0, qualityScore: 89, executions: 512, avgRuntime: '3.1m', lastOutput: null },
  { id: 6, name: 'Competitor Intelligence', category: 'Evening Intel', schedule: '20:00', status: 'idle', progress: 0, qualityScore: 96, executions: 423, avgRuntime: '4.2m', lastOutput: null },
  { id: 7, name: 'Market Trends', category: 'Evening Intel', schedule: '20:15', status: 'running', progress: 72, qualityScore: 93, executions: 398, avgRuntime: '3.8m', lastOutput: '## Market Analysis\n\nKey trends identified:\n- AI adoption accelerating in enterprise\n- Shift to hybrid work models continuing\n- Sustainability becoming key differentiator' },
  { id: 16, name: 'Review Synthesis', category: 'Improvement', schedule: '21:45', status: 'idle', progress: 0, qualityScore: 97, executions: 289, avgRuntime: '5.1m', lastOutput: null },
  { id: 24, name: 'Project Manager', category: 'Productivity', schedule: 'Hourly', status: 'running', progress: 23, qualityScore: 92, executions: 2341, avgRuntime: '1.2m', lastOutput: null },
  { id: 99, name: 'Heartbeat Agent', category: 'System', schedule: 'Hourly', status: 'idle', progress: 0, qualityScore: 99, executions: 8760, avgRuntime: '0.5m', lastOutput: null },
  // Inbox Automation Agents for AutoAcquireai.com
  ...INBOX_AUTOMATION_AGENTS,
];

const INITIAL_OUTBOX = [
  { id: 1, agentId: 1, action: 'Send follow-up email to Client XYZ', category: 'Communication', description: 'Based on revenue analysis, sending a personalized follow-up to maintain momentum on the Q4 deal.', status: 'pending', risk: 'low' },
  { id: 2, agentId: 7, action: 'Update market research document', category: 'Documentation', description: 'Adding new competitive intelligence findings to the shared market research database.', status: 'pending', risk: 'low' },
  { id: 3, agentId: 24, action: 'Create Asana tasks for Sprint 47', category: 'Project Management', description: 'Generating 12 new tasks based on sprint planning meeting transcript.', status: 'pending', risk: 'medium' },
  { id: 4, agentId: 2, action: 'Escalate blocked PR review', category: 'Development', description: 'PR #1847 has been blocked for 3 days. Sending reminder to reviewers.', status: 'approved', risk: 'low' },
];

const INITIAL_INTEGRATIONS = [
  { id: 1, name: 'Asana', icon: Target, category: 'Productivity', description: 'Task management and project tracking', vfsPath: '/context/tools/asana', connected: true, gradient: 'from-rose-400 to-pink-600' },
  { id: 2, name: 'Microsoft 365', icon: Mail, category: 'Productivity', description: 'Email, calendar, and document management', vfsPath: '/context/tools/ms365', connected: true, gradient: 'from-blue-400 to-indigo-600' },
  { id: 3, name: 'Slack', icon: MessageSquare, category: 'Communication', description: 'Team messaging and notifications', vfsPath: '/context/tools/slack', connected: true, gradient: 'from-violet-400 to-purple-600' },
  { id: 4, name: 'Fireflies', icon: Users, category: 'Meetings', description: 'Meeting transcription and insights', vfsPath: '/context/tools/fireflies', connected: false, gradient: 'from-cyan-400 to-teal-600' },
  { id: 5, name: 'Linear', icon: GitBranch, category: 'Development', description: 'Issue tracking and sprint management', vfsPath: '/context/tools/linear', connected: false, gradient: 'from-indigo-400 to-blue-600' },
  { id: 6, name: 'Google Workspace', icon: Globe, category: 'Productivity', description: 'Gmail, Drive, Docs & Sheets for AutoAcquireai.com', vfsPath: '/context/tools/google', connected: false, gradient: 'from-teal-400 to-emerald-600' },
];

export default ByteCommandCenter;
