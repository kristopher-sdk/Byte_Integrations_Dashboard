---
name: byte-agents
description: Agent system patterns for Byte Integration Hub. Use when creating, managing, or executing automated agents, implementing the Heartbeat+Outbox pattern, defining agent workflows, or building the Agent Monitor view. Provides agent schemas, categories, execution flows, and example definitions.
---

# Byte Agent System

Defines patterns for creating, managing, and executing automated agents within the Byte platform.

## Agent Data Structure

```javascript
const AgentSchema = {
  id: Number,              // Unique identifier
  name: String,            // Display name
  description: String,     // What the agent does
  category: String,        // 'Morning Ops' | 'Evening Intel' | 'Productivity' | 'Review' | 'System'
  schedule: String,        // Cron expression or 'Manual' or 'Hourly'
  status: String,          // 'idle' | 'running' | 'error' | 'disabled'
  progress: Number,        // 0-100 when running

  // Configuration
  model: String,           // Which AI model to use (key from AI_MODELS)
  systemPrompt: String,    // Custom instructions for this agent
  tools: Array<String>,    // Which integrations it can access
  autoApproval: Boolean,   // Can it auto-execute low-risk actions?
  riskThreshold: String,   // 'low' | 'medium' | 'high'

  // Stats
  qualityScore: Number,    // 0-100 historical performance
  executions: Number,      // Total runs
  avgRuntime: String,      // Average execution time
  lastRun: Date,           // Last execution timestamp
  lastOutput: String,      // Most recent output

  // Workflow
  inputs: Array<{          // What data the agent needs
    source: String,        // Integration or VFS path
    query: String,         // How to fetch the data
  }>,
  outputs: Array<{         // What the agent produces
    type: String,          // 'report' | 'tasks' | 'email' | 'slack' | 'data'
    destination: String,   // Where to send output
  }>,
};
```

## Agent Categories

```javascript
const AGENT_CATEGORIES = {
  'Morning Ops': {
    description: 'Agents that run early to prepare your day',
    defaultSchedule: '0 6 * * *', // 6am daily
    icon: 'Sunrise',
    color: 'orange'
  },
  'Evening Intel': {
    description: 'Agents that gather intelligence overnight',
    defaultSchedule: '0 20 * * *', // 8pm daily
    icon: 'Moon',
    color: 'indigo'
  },
  'Productivity': {
    description: 'Agents that run continuously to keep work flowing',
    defaultSchedule: '0 * * * *', // Every hour
    icon: 'Zap',
    color: 'cyan'
  },
  'Review': {
    description: 'Agents that analyze and improve other agents',
    defaultSchedule: '0 0 * * 0', // Weekly
    icon: 'Search',
    color: 'purple'
  },
  'System': {
    description: 'Infrastructure agents that keep Byte running',
    defaultSchedule: '*/15 * * * *', // Every 15 min
    icon: 'Settings',
    color: 'slate'
  }
};
```

## Heartbeat + Outbox Pattern

```javascript
// Agent execution flow
const executeAgent = async (agent) => {
  // 1. Gather inputs
  const inputs = await gatherInputs(agent.inputs);

  // 2. Run AI model
  const result = await callOpenRouter([
    { role: 'system', content: agent.systemPrompt },
    { role: 'user', content: formatInputsAsPrompt(inputs) }
  ], agent.model);

  // 3. Parse proposed actions
  const actions = parseActions(result.content);

  // 4. Route to Outbox (not direct execution)
  for (const action of actions) {
    await addToOutbox({
      agentId: agent.id,
      action: action.description,
      category: action.category,
      payload: action.payload,
      risk: assessRisk(action),
      status: agent.autoApproval && assessRisk(action) === 'low'
        ? 'auto-approved'
        : 'pending'
    });
  }

  // 5. Return output for display
  return {
    summary: result.content,
    actionsProposed: actions.length,
    model: result.model
  };
};
```

## Example Agent Definitions

```javascript
const EXAMPLE_AGENTS = [
  {
    id: 1,
    name: 'Revenue Priority Agent',
    description: 'Analyzes CRM and tasks to identify top revenue opportunities',
    category: 'Morning Ops',
    schedule: '0 6 * * 1-5',
    model: 'orchestration',
    tools: ['asana', 'google-workspace'],
    autoApproval: false,
    systemPrompt: `You are a revenue analyst. Given the current tasks and calendar:
1. Identify the top 3 revenue-impacting items for today
2. Suggest specific actions for each
3. Flag any risks or blockers
Output as structured JSON with priorities array.`
  },
  {
    id: 99,
    name: 'Heartbeat Agent',
    description: 'System health check that monitors all other agents',
    category: 'System',
    schedule: '*/15 * * * *',
    model: 'general',
    tools: ['all'],
    autoApproval: true,
    systemPrompt: `Check system health:
1. Verify all integrations are connected
2. Check for stuck agents
3. Monitor memory usage
4. Report any anomalies
Output as JSON with status and any alerts.`
  }
];
```

## Instructions

When building agents:

1. Always use the Heartbeat + Outbox pattern - agents propose, humans approve
2. Include risk assessment for every action
3. Store outputs in the episodic memory tier
4. Log all executions for quality tracking
5. Handle failures gracefully with retry logic
6. Never let agents execute high-risk actions automatically
7. Agents should be composable - one agent can trigger another
