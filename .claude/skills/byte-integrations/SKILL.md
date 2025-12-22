---
name: byte-integrations
description: Third-party integration patterns for Byte Integration Hub. Use when implementing OAuth flows, connecting external services (Asana, Google, Slack, Linear, Microsoft 365), managing API tokens, or working with the Virtual File System (VFS). Provides integration schemas, OAuth patterns, and VFS structure.
---

# Byte Integrations

Standardizes OAuth flows, API connections, and data access patterns for third-party integrations.

## Integration Data Structure

```javascript
const IntegrationSchema = {
  id: String,              // Unique identifier (e.g., 'asana')
  name: String,            // Display name
  description: String,     // What it provides
  category: String,        // 'Productivity' | 'Communication' | 'Development' | 'Analytics'
  icon: Component,         // Lucide icon component
  gradient: String,        // TailwindCSS gradient classes

  // Connection
  connected: Boolean,
  connectionDate: Date,
  lastSync: Date,

  // OAuth Config
  oauth: {
    authUrl: String,
    tokenUrl: String,
    clientId: String,      // Stored in env
    scopes: Array<String>,
    redirectUri: String,
  },

  // VFS Mapping
  vfsPath: String,         // e.g., '/context/tools/asana'

  // Capabilities
  capabilities: {
    read: Array<String>,   // What data can be read
    write: Array<String>,  // What actions can be taken
    webhooks: Boolean,     // Supports real-time updates
  }
};
```

## Supported Integrations

```javascript
const INTEGRATIONS = {
  asana: {
    id: 'asana',
    name: 'Asana',
    category: 'Productivity',
    vfsPath: '/context/tools/asana',
    oauth: {
      authUrl: 'https://app.asana.com/-/oauth_authorize',
      tokenUrl: 'https://app.asana.com/-/oauth_token',
      scopes: ['default'],
    },
    capabilities: {
      read: ['workspaces', 'projects', 'tasks', 'users'],
      write: ['tasks', 'comments', 'attachments'],
      webhooks: true
    }
  },

  'google-workspace': {
    id: 'google-workspace',
    name: 'Google Workspace',
    category: 'Productivity',
    vfsPath: '/context/tools/google',
    oauth: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/gmail.readonly'
      ],
    },
    capabilities: {
      read: ['drive', 'calendar', 'gmail', 'docs'],
      write: ['calendar', 'docs'],
      webhooks: true
    }
  },

  slack: {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    vfsPath: '/context/tools/slack',
    oauth: {
      authUrl: 'https://slack.com/oauth/v2/authorize',
      tokenUrl: 'https://slack.com/api/oauth.v2.access',
      scopes: ['channels:read', 'chat:write', 'users:read'],
    },
    capabilities: {
      read: ['channels', 'messages', 'users'],
      write: ['messages', 'reactions'],
      webhooks: true
    }
  },

  linear: {
    id: 'linear',
    name: 'Linear',
    category: 'Development',
    vfsPath: '/context/tools/linear',
    oauth: {
      authUrl: 'https://linear.app/oauth/authorize',
      tokenUrl: 'https://api.linear.app/oauth/token',
      scopes: ['read', 'write'],
    },
    capabilities: {
      read: ['issues', 'projects', 'teams', 'cycles'],
      write: ['issues', 'comments'],
      webhooks: true
    }
  },

  'microsoft-365': {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    category: 'Productivity',
    vfsPath: '/context/tools/ms365',
    oauth: {
      authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      scopes: ['Mail.Read', 'Calendars.Read', 'Files.Read'],
    },
    capabilities: {
      read: ['mail', 'calendar', 'files', 'contacts'],
      write: ['mail', 'calendar'],
      webhooks: true
    }
  }
};
```

## OAuth Flow Pattern

```javascript
// 1. Initiate OAuth
const initiateOAuth = (integrationId) => {
  const integration = INTEGRATIONS[integrationId];
  const state = generateSecureState();

  sessionStorage.setItem('oauth_state', state);
  sessionStorage.setItem('oauth_integration', integrationId);

  const params = new URLSearchParams({
    client_id: process.env[`${integrationId.toUpperCase()}_CLIENT_ID`],
    redirect_uri: `${window.location.origin}/oauth/callback`,
    response_type: 'code',
    scope: integration.oauth.scopes.join(' '),
    state: state
  });

  window.location.href = `${integration.oauth.authUrl}?${params}`;
};

// 2. Handle Callback (in Cloudflare Worker)
const handleOAuthCallback = async (request) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  // Verify state, exchange code for token
  // Store token securely in D1 or KV
  // Return success page that closes and notifies parent
};

// 3. Use Integration
const fetchFromIntegration = async (integrationId, endpoint, options = {}) => {
  const token = await getStoredToken(integrationId);

  if (!token) throw new Error(`${integrationId} not connected`);

  if (isTokenExpired(token)) {
    token = await refreshToken(integrationId, token.refresh_token);
  }

  return fetch(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token.access_token}`,
      ...options.headers
    }
  });
};
```

## VFS (Virtual File System) Pattern

```javascript
// All integrations are accessed via VFS paths
const VFS_STRUCTURE = {
  '/context': {
    '/tools': {
      '/asana': { /* Asana data */ },
      '/slack': { /* Slack data */ },
      '/google': { /* Google data */ },
      '/linear': { /* Linear data */ },
      '/ms365': { /* Microsoft data */ },
    },
    '/memory': {
      '/scratchpad': { /* 24-72h memory */ },
      '/episodic': { /* 30-90d memory */ },
      '/facts': { /* Permanent facts */ },
      '/experiential': { /* Patterns */ },
    },
    '/user': {
      '/preferences': { /* User settings */ },
      '/history': { /* Conversation history */ },
    }
  }
};

// Read from VFS
const vfsRead = async (path) => {
  const parts = path.split('/').filter(Boolean);
  // Route to appropriate integration or storage
};

// Write to VFS
const vfsWrite = async (path, data) => {
  // Route write to appropriate destination
};
```

## Instructions

When building integrations:

1. Always use OAuth 2.0 with PKCE for browser-based auth
2. Store tokens server-side (Cloudflare KV or D1), never in localStorage
3. Implement automatic token refresh
4. Use VFS paths consistently for all data access
5. Handle rate limits gracefully with exponential backoff
6. Log all API calls for debugging
7. Provide clear connection status in UI
