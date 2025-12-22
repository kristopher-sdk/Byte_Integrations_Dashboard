---
name: byte-ui
description: Reusable UI component patterns for Byte Integration Hub. Use when building new UI components, views, or layouts. Provides Card, Badge, Button, Input, Modal, EmptyState, StatusIndicator, ProgressBar, Spinner, SplitView, SidebarLayout, and FilterBar patterns matching Byte's cyan/teal design system.
---

# Byte UI Components

Provides reusable UI component patterns that match Byte's design system.

## Core Component Patterns

```jsx
// Card Component
const Card = ({ children, className = '' }) => (
  <div className={`bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 ${className}`}>
    {children}
  </div>
);

// Badge Component
const Badge = ({ children, color = 'cyan' }) => {
  const colors = {
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    teal: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${colors[color]}`}>
      {children}
    </span>
  );
};

// Button Component
const Button = ({ children, variant = 'primary', size = 'md', ...props }) => {
  const variants = {
    primary: 'bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-medium',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-white',
    ghost: 'hover:bg-slate-800 text-slate-400 hover:text-white',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button
      className={`rounded-lg transition-all flex items-center gap-2 ${variants[variant]} ${sizes[size]}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Input Component
const Input = ({ icon: Icon, ...props }) => (
  <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus-within:border-cyan-500/50 transition-all">
    {Icon && <Icon className="w-4 h-4 text-slate-500" />}
    <input
      className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none"
      {...props}
    />
  </div>
);

// Status Indicator
const StatusIndicator = ({ status }) => {
  const colors = {
    online: 'bg-teal-400',
    running: 'bg-cyan-400 animate-pulse',
    idle: 'bg-slate-500',
    error: 'bg-red-400',
  };
  return <div className={`w-2 h-2 rounded-full ${colors[status]}`} />;
};

// Progress Bar
const ProgressBar = ({ value, color = 'cyan' }) => (
  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
    <div
      className={`h-full bg-gradient-to-r from-${color}-400 to-${color}-500 rounded-full transition-all`}
      style={{ width: `${value}%` }}
    />
  </div>
);

// Modal/Overlay
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

// Empty State
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-slate-500" />
    </div>
    <h3 className="text-lg font-medium text-slate-300 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 mb-4 max-w-sm">{description}</p>
    {action}
  </div>
);

// Loading Spinner
const Spinner = ({ size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return <Loader2 className={`${sizes[size]} animate-spin text-cyan-400`} />;
};
```

## Layout Patterns

```jsx
// Split View (used in Prototype)
const SplitView = ({ left, right, ratio = 50 }) => (
  <div className="h-full flex">
    <div style={{ width: `${ratio}%` }} className="border-r border-slate-800/50">
      {left}
    </div>
    <div style={{ width: `${100 - ratio}%` }}>
      {right}
    </div>
  </div>
);

// Sidebar Layout (used in Agents)
const SidebarLayout = ({ sidebar, main, sidebarWidth = 384 }) => (
  <div className="h-full flex">
    <div style={{ width: sidebarWidth }} className="border-r border-slate-800/50 flex flex-col">
      {sidebar}
    </div>
    <div className="flex-1">
      {main}
    </div>
  </div>
);

// Filter Bar
const FilterBar = ({ filters, active, onChange }) => (
  <div className="flex items-center gap-2">
    {filters.map(filter => (
      <button
        key={filter.id}
        onClick={() => onChange(filter.id)}
        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
          active === filter.id
            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
      >
        {filter.label}
        {filter.count !== undefined && (
          <span className="ml-2 px-1.5 py-0.5 bg-slate-700 text-xs rounded-full">
            {filter.count}
          </span>
        )}
      </button>
    ))}
  </div>
);
```

## Color System

```javascript
const BYTE_COLORS = {
  // Primary
  cyan: { 400: '#22d3ee', 500: '#06b6d4' },
  teal: { 400: '#2dd4bf', 500: '#14b8a6' },

  // Accent
  indigo: { 400: '#818cf8', 500: '#6366f1' },

  // Background
  slate: {
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },

  // Status
  success: 'teal-400',
  warning: 'orange-400',
  error: 'red-400',
  info: 'cyan-400'
};
```

## Instructions

When building UI:

1. Use existing component patterns - don't reinvent
2. Maintain consistent spacing (p-4, p-6, gap-3, gap-4)
3. Use slate-800/30 for card backgrounds, slate-900/30 for surfaces
4. Always include hover states and transitions
5. Use backdrop-blur-xl for overlays
6. Icons should be 4-5 px for inline, 8 px for standalone
7. Test responsive behavior - use hidden lg:block for sidebars
