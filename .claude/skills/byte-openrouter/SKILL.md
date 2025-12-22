---
name: byte-openrouter
description: OpenRouter AI model integration for Byte Integration Hub. Use when making AI model calls, selecting models by task type, handling API responses, implementing streaming, or managing errors. Provides API patterns, model registry, and system prompts for orchestration, coding, architecture, and general tasks.
---

# Byte OpenRouter Integration

Handles all AI model interactions through OpenRouter API with proper error handling, model selection, and response processing.

## API Configuration

```javascript
const OPENROUTER_API_KEY = 'sk-or-v1-...'; // Store securely
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
```

## Model Registry

```javascript
const AI_MODELS = {
  orchestration: {
    id: 'google/gemini-3-pro-preview',
    name: 'Gemini 3.0 Pro',
    label: 'Orchestration',
    description: 'Coordinates multi-step workflows and agent delegation'
  },
  architecture: {
    id: 'openai/chatgpt-4o-latest',
    name: 'ChatGPT 5.2',
    label: 'Architecture',
    description: 'System design, planning, and technical decisions'
  },
  coding: {
    id: 'anthropic/claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    label: 'Coding',
    description: 'Code generation, debugging, and implementation'
  },
  multiAgent: {
    id: 'anthropic/claude-opus-4.5',
    name: 'Claude Opus 4.5',
    label: 'Multi-Agentic',
    description: 'Complex reasoning and agent coordination'
  },
  webScraping: {
    id: 'openai/chatgpt-4o-latest',
    name: 'ChatGPT 5.2',
    label: 'Web Scraping',
    description: 'Data extraction and web research'
  },
  general: {
    id: 'anthropic/claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    label: 'General',
    description: 'Default for general queries'
  },
};
```

## API Call Pattern

```javascript
const callOpenRouter = async (messages, modelKey = 'general') => {
  const model = AI_MODELS[modelKey];

  const response = await fetch(OPENROUTER_BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Byte Integration Hub'
    },
    body: JSON.stringify({
      model: model.id,
      messages: messages,
      max_tokens: 4096,
      temperature: 0.7,
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0]?.message?.content || 'No response',
    model: model.name,
    usage: data.usage
  };
};
```

## Streaming Pattern

```javascript
const callOpenRouterStream = async (messages, modelKey, onChunk) => {
  const model = AI_MODELS[modelKey];

  const response = await fetch(OPENROUTER_BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Byte Integration Hub'
    },
    body: JSON.stringify({
      model: model.id,
      messages: messages,
      max_tokens: 4096,
      stream: true,
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

    for (const line of lines) {
      if (line === 'data: [DONE]') continue;
      const data = JSON.parse(line.slice(6));
      const content = data.choices[0]?.delta?.content || '';
      fullContent += content;
      onChunk(content, fullContent);
    }
  }

  return { content: fullContent, model: model.name };
};
```

## System Prompts by Task Type

```javascript
const SYSTEM_PROMPTS = {
  orchestration: `You are Byte's orchestration engine. You coordinate complex workflows, delegate to specialized agents, and manage multi-step processes. Be structured and systematic.`,

  architecture: `You are Byte's architecture advisor. You help design systems, plan implementations, and make technical decisions. Think in terms of scalability, maintainability, and best practices.`,

  coding: `You are Byte's coding assistant. Write clean, working code. Use modern patterns. Include error handling. Format code properly with syntax highlighting.`,

  multiAgent: `You are Byte's multi-agent coordinator. You manage complex reasoning tasks that require multiple perspectives or agents working together. Think step by step and show your reasoning.`,

  webScraping: `You are Byte's research assistant. You help extract data, summarize findings, and organize research. Be thorough and cite sources when available.`,

  general: `You are Byte, an AI command center assistant. Be helpful, concise, and professional. You can help with tasks, answer questions, and coordinate with other specialized AI models.`
};
```

## Error Handling

```javascript
const handleAPIError = (error) => {
  const errorMessages = {
    401: 'Invalid API key. Check your OpenRouter configuration.',
    402: 'Insufficient credits. Add funds to your OpenRouter account.',
    429: 'Rate limited. Please wait a moment and try again.',
    500: 'OpenRouter server error. Try again shortly.',
    503: 'Model temporarily unavailable. Try a different model.',
  };

  return errorMessages[error.status] || error.message || 'Unknown error occurred';
};
```

## Instructions

When working with OpenRouter:

1. Always use the callOpenRouter function pattern
2. Include proper error handling with user-friendly messages
3. Pass the correct modelKey based on task type
4. Include HTTP-Referer and X-Title headers
5. Handle streaming responses if implementing real-time output
6. Log usage stats for monitoring
7. Never expose the API key in client-facing error messages
