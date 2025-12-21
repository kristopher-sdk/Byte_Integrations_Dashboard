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
// BYTE COMMAND CENTER
// Unified platform for rapid prototyping + multi-agent orchestration
// Brand: byteable.ai colors - Cyan/Teal primary, Indigo accents
// ============================================================================

const App = () => {
  const [activeView, setActiveView] = useState('command');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'system',
      content: 'Welcome to Byte. I can help you prototype applications, delegate to your dev team, or orchestrate your 57-agent system. What would you like to build today?',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState(null);
  
  const [outboxItems, setOutboxItems] = useState(INITIAL_OUTBOX);
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);
  
  const [memoryStats] = useState({
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
    
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        role: 'assistant',
        content: aiResponse.content,
        artifacts: aiResponse.artifacts,
        timestamp: new Date(),
      }]);
      setIsProcessing(false);
    }, 1500);
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
        <TopBar activeView={activeView} />

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
// SIDEBAR
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
              <p className="text-xs text-slate-500">57-Agent System</p>
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
// TOP BAR
// ============================================================================

const TopBar = ({ activeView }) => {
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
  agents, memoryStats 
}) => {
  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col">
        <div className="px-6 py-4 border-b border-slate-800/50">
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
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isProcessing && <ProcessingIndicator />}
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

const PrototypeView = ({ messages, inputValue, setInputValue, handleSend, isProcessing, chatEndRef }) => {
  const [activeTab, setActiveTab] = useState('preview');

  return (
    <div className="h-full flex">
      <div className="w-1/2 flex flex-col bg-slate-900/50 border-r border-slate-800/50">
        <div className="p-4 border-b border-slate-800/50">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium">Start from template</span>
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
          {isProcessing && <ProcessingIndicator />}
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

      <div className="flex-1 flex flex-col bg-slate-950">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/50">
          <div className="flex items-center gap-1">
            {['preview', 'code', 'files'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
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
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl flex items-center justify-center">
                <Globe className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-400 mb-2">No preview available</p>
              <p className="text-sm text-slate-500">Start building to see your app here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// AGENTS VIEW
// ============================================================================

const AgentsView = ({ agents, setAgents, selectedAgent, setSelectedAgent }) => {
  const agentCategories = [
    { id: 'morning', label: 'Morning Ops', color: 'cyan' },
    { id: 'evening', label: 'Evening Intel', color: 'indigo' },
    { id: 'improvement', label: 'Improvement', color: 'teal' },
    { id: 'productivity', label: 'Productivity', color: 'sky' },
    { id: 'review', label: 'Review', color: 'rose' },
  ];

  return (
    <div className="h-full flex">
      <div className="w-96 border-r border-slate-800/50 flex flex-col">
        <div className="p-4 border-b border-slate-800/50">
          <div className="flex flex-wrap gap-2">
            {agentCategories.map(cat => (
              <button
                key={cat.id}
                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white"
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
          <AgentDetail agent={selectedAgent} />
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

const AgentDetail = ({ agent }) => {
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
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-slate-400">Quality Score</span>
            </div>
            <p className="text-2xl font-bold">{agent.qualityScore}%</p>
          </div>
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-teal-400" />
              <span className="text-sm text-slate-400">Executions</span>
            </div>
            <p className="text-2xl font-bold">{agent.executions}</p>
          </div>
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-slate-400">Avg Runtime</span>
            </div>
            <p className="text-2xl font-bold">{agent.avgRuntime}</p>
          </div>
        </div>

        <div className="bg-slate-800/30 rounded-xl p-4 mb-6">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Latest Output
          </h3>
          <div className="bg-slate-900/50 rounded-lg p-4 font-mono text-sm text-slate-300 max-h-64 overflow-y-auto whitespace-pre-wrap">
            {agent.lastOutput || 'No recent output available'}
          </div>
        </div>

        <div className="bg-slate-800/30 rounded-xl p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            Configuration
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
              <span className="text-sm text-slate-400">Tools Access</span>
              <span className="text-sm font-mono text-slate-300">{agent.tools?.join(', ') || 'None'}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-400">Auto-Approval</span>
              <span className="text-sm font-mono text-slate-300">{agent.autoApproval ? 'Enabled' : 'Disabled'}</span>
            </div>
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
  const [activeFilter, setActiveFilter] = useState('pending');

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

  const filteredItems = activeFilter === 'all'
    ? outboxItems
    : outboxItems.filter(item => item.status === activeFilter);

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {['all', 'pending', 'approved', 'rejected'].map(filter => (
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
  const StatusIcon = config.icon;

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            config.color === 'cyan' ? 'bg-cyan-500/20' : 
            config.color === 'teal' ? 'bg-teal-500/20' : 'bg-red-500/20'
          }`}>
            <StatusIcon className={`w-5 h-5 ${
              config.color === 'cyan' ? 'text-cyan-400' : 
              config.color === 'teal' ? 'text-teal-400' : 'text-red-400'
            }`} />
          </div>
          <div>
            <h4 className="font-medium">{item.action}</h4>
            <p className="text-sm text-slate-400">Agent #{item.agentId} • {item.category}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          config.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-400' : 
          config.color === 'teal' ? 'bg-teal-500/20 text-teal-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {config.label}
        </span>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
        <p className="text-sm text-slate-300">{item.description}</p>
      </div>

      {item.status === 'pending' && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Risk Level: <span className={`${
              item.risk === 'low' ? 'text-teal-400' : item.risk === 'medium' ? 'text-cyan-400' : 'text-red-400'
            }`}>
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

const IntegrationsView = ({ integrations }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Productivity', 'Communication', 'Development', 'Analytics'];

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

      <div className="grid grid-cols-3 gap-4">
        {integrations.map(integration => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>
    </div>
  );
};

const IntegrationCard = ({ integration }) => {
  const IntegrationIcon = integration.icon;
  
  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${integration.gradient} flex items-center justify-center shadow-lg`}>
            <IntegrationIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-medium">{integration.name}</h4>
            <p className="text-xs text-slate-500">{integration.category}</p>
          </div>
        </div>
        <div className={`w-2.5 h-2.5 rounded-full ${integration.connected ? 'bg-teal-400' : 'bg-slate-600'}`} />
      </div>
      <p className="text-sm text-slate-400 mb-4">{integration.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">VFS: {integration.vfsPath}</span>
        <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          integration.connected
            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            : 'bg-cyan-500 text-slate-900 hover:bg-cyan-400'
        }`}>
          {integration.connected ? 'Configure' : 'Connect'}
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
    { id: 'scratchpad', name: 'Scratchpad', icon: FileText, color: 'sky', ttl: '24-72 hours', description: 'Short-term working memory for agent-to-agent communication', items: memoryStats.scratchpad.items },
    { id: 'episodic', name: 'Episodic', icon: Calendar, color: 'indigo', ttl: '30-90 days', description: 'Daily record of all agent outputs and events', items: memoryStats.episodic.items },
    { id: 'fact', name: 'Fact Store', icon: Database, color: 'teal', ttl: 'Permanent', description: 'Validated, canonical knowledge extracted from episodic memory', items: memoryStats.fact.items },
    { id: 'experiential', name: 'Experiential', icon: Lightbulb, color: 'cyan', ttl: 'Permanent', description: 'Abstracted patterns, lessons, and meta-insights', items: memoryStats.experiential.items },
  ];

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Memory Pipeline</h3>
        <div className="flex items-center justify-between bg-slate-800/30 rounded-xl p-6">
          {memoryTiers.map((tier, i) => {
            const TierIcon = tier.icon;
            return (
              <React.Fragment key={tier.id}>
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center ${
                    tier.color === 'sky' ? 'bg-sky-500/20' :
                    tier.color === 'indigo' ? 'bg-indigo-500/20' :
                    tier.color === 'teal' ? 'bg-teal-500/20' : 'bg-cyan-500/20'
                  }`}>
                    <TierIcon className={`w-8 h-8 ${
                      tier.color === 'sky' ? 'text-sky-400' :
                      tier.color === 'indigo' ? 'text-indigo-400' :
                      tier.color === 'teal' ? 'text-teal-400' : 'text-cyan-400'
                    }`} />
                  </div>
                  <p className="font-medium">{tier.name}</p>
                  <p className="text-xs text-slate-500">{tier.ttl}</p>
                </div>
                {i < memoryTiers.length - 1 && (
                  <ChevronRight className="w-6 h-6 text-slate-600" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {memoryTiers.map(tier => {
          const TierIcon = tier.icon;
          return (
            <div key={tier.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  tier.color === 'sky' ? 'bg-sky-500/20' :
                  tier.color === 'indigo' ? 'bg-indigo-500/20' :
                  tier.color === 'teal' ? 'bg-teal-500/20' : 'bg-cyan-500/20'
                }`}>
                  <TierIcon className={`w-5 h-5 ${
                    tier.color === 'sky' ? 'text-sky-400' :
                    tier.color === 'indigo' ? 'text-indigo-400' :
                    tier.color === 'teal' ? 'text-teal-400' : 'text-cyan-400'
                  }`} />
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
          );
        })}
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
        <p className="text-xs text-slate-500 mt-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

const ArtifactCard = ({ artifact }) => {
  const icons = { component: Code2, document: FileText, image: Image, project: Folder };
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

const ProcessingIndicator = () => (
  <div className="flex items-center gap-3 text-slate-400">
    <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-teal-600 rounded-lg flex items-center justify-center animate-pulse">
      <Brain className="w-4 h-4 text-white" />
    </div>
    <span className="text-sm">Processing request...</span>
    <div className="flex gap-1">
      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
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
  { id: 2, name: 'Team Unblocker', category: 'Morning Ops', schedule: '06:15', status: 'idle', progress: 0, qualityScore: 91, executions: 634, avgRuntime: '1.8m', lastOutput: null, tools: ['Slack', 'Linear'], autoApproval: true },
  { id: 3, name: 'Operational Excellence', category: 'Morning Ops', schedule: '06:30', status: 'scheduled', progress: 0, qualityScore: 89, executions: 512, avgRuntime: '3.1m', lastOutput: null, tools: ['Asana'], autoApproval: false },
  { id: 6, name: 'Competitor Intelligence', category: 'Evening Intel', schedule: '20:00', status: 'idle', progress: 0, qualityScore: 96, executions: 423, avgRuntime: '4.2m', lastOutput: null, tools: ['Web Search'], autoApproval: true },
  { id: 7, name: 'Market Trends', category: 'Evening Intel', schedule: '20:15', status: 'running', progress: 72, qualityScore: 93, executions: 398, avgRuntime: '3.8m', lastOutput: '## Market Analysis\n\nKey trends identified:\n- AI adoption accelerating in enterprise\n- Shift to hybrid work models continuing\n- Sustainability becoming key differentiator', tools: ['Web Search', 'Supermemory'], autoApproval: true },
  { id: 16, name: 'Review Synthesis', category: 'Improvement', schedule: '21:45', status: 'idle', progress: 0, qualityScore: 97, executions: 289, avgRuntime: '5.1m', lastOutput: null, tools: ['Memory'], autoApproval: false },
  { id: 24, name: 'Project Manager', category: 'Productivity', schedule: 'Hourly', status: 'running', progress: 23, qualityScore: 92, executions: 2341, avgRuntime: '1.2m', lastOutput: null, tools: ['Asana', 'Linear', 'Slack'], autoApproval: true },
  { id: 99, name: 'Heartbeat Agent', category: 'System', schedule: 'Hourly', status: 'idle', progress: 0, qualityScore: 99, executions: 8760, avgRuntime: '0.5m', lastOutput: null, tools: ['All'], autoApproval: true },
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
  { id: 6, name: 'Google Workspace', icon: Globe, category: 'Productivity', description: 'Google Drive, Docs, and Sheets', vfsPath: '/context/tools/google', connected: true, gradient: 'from-teal-400 to-emerald-600' },
];

const generateAIResponse = (input) => {
  const lowered = input.toLowerCase();
  
  if (lowered.includes('dashboard') || lowered.includes('component')) {
    return {
      content: "I'll create that dashboard component for you. Here's what I'm building:\n\n• Modern analytics dashboard with real-time metrics\n• Responsive layout with card-based design\n• Interactive charts using Recharts\n• Dark theme with Byte brand colors\n\nI've generated the component and you can preview it in the sidebar. Should I also create the API integration for live data?",
      artifacts: [{ type: 'component', name: 'AnalyticsDashboard.jsx', size: '4.2 KB' }]
    };
  }
  
  if (lowered.includes('agent') || lowered.includes('status')) {
    return {
      content: "Here's the current status of your agent fleet:\n\n**Active Agents (3)**\n• #1 Revenue Priority - 45% complete\n• #7 Market Trends - 72% complete  \n• #24 Project Manager - 23% complete\n\n**Pending Actions (3)**\nThere are 3 items in your outbox awaiting approval. Would you like me to summarize them?",
      artifacts: []
    };
  }
  
  if (lowered.includes('team') || lowered.includes('delegate')) {
    return {
      content: "I can help delegate this to your dev team. I'll:\n\n1. Create detailed task specs in Asana\n2. Generate a technical brief document\n3. Notify the relevant team members via Slack\n4. Set up a follow-up reminder for review\n\nWould you like me to proceed with this delegation workflow?",
      artifacts: [{ type: 'document', name: 'Task Specification.md', size: '2.1 KB' }]
    };
  }
  
  return {
    content: "I understand. I can help you with that through our multi-agent system. Here are some ways I can assist:\n\n• **Rapid Prototype**: Generate code, components, or full applications\n• **Agent Orchestration**: Monitor and control your 57-agent fleet\n• **Tool Integration**: Connect and automate your productivity tools\n• **Memory Access**: Query historical data and insights\n\nWhat would you like to focus on?",
    artifacts: []
  };
};

export default App;
