---
name: byte-memory
description: 4-tier memory system for Byte Integration Hub. Use when implementing persistent knowledge storage, building memory context for AI calls, promoting memories between tiers, or visualizing the Memory System view. Provides scratchpad (24-72h), episodic (30-90d), fact store (permanent), and experiential (patterns) tier schemas and operations.
---

# Byte Memory System

Implements the 4-tier memory system for persistent knowledge across conversations and agent runs.

## Memory Tiers

```javascript
const MEMORY_TIERS = {
  scratchpad: {
    name: 'Scratchpad',
    ttl: '24-72 hours',
    purpose: 'Working memory during active tasks',
    storage: 'Cloudflare KV with TTL',
    schema: {
      id: String,
      content: String,
      context: String,      // What task created this
      createdAt: Date,
      expiresAt: Date,
    }
  },

  episodic: {
    name: 'Episodic Memory',
    ttl: '30-90 days',
    purpose: 'Daily record of agent outputs and conversations',
    storage: 'Cloudflare D1',
    schema: {
      id: String,
      date: Date,
      agentId: Number,      // Which agent created this
      type: String,         // 'output' | 'conversation' | 'action'
      summary: String,
      fullContent: Text,
      tags: Array<String>,
      importance: Number,   // 1-10
    }
  },

  fact: {
    name: 'Fact Store',
    ttl: 'Permanent',
    purpose: 'Validated knowledge about user/business',
    storage: 'Cloudflare D1',
    schema: {
      id: String,
      fact: String,         // The actual fact
      category: String,     // 'user' | 'business' | 'preference' | 'process'
      source: String,       // Where this came from
      confidence: Number,   // 0-1
      validatedAt: Date,
      validatedBy: String,  // 'user' | 'agent' | 'system'
    }
  },

  experiential: {
    name: 'Experiential Memory',
    ttl: 'Permanent',
    purpose: 'Patterns and learnings abstracted from experience',
    storage: 'Cloudflare D1 + Vectorize',
    schema: {
      id: String,
      pattern: String,      // The learned pattern
      context: String,      // When this applies
      examples: Array,      // Supporting examples
      effectiveness: Number,// How well it works
      embedding: Vector,    // For semantic search
    }
  }
};
```

## Memory Operations

```javascript
// Write to memory
const remember = async (tier, content, metadata = {}) => {
  switch(tier) {
    case 'scratchpad':
      return await kv.put(
        `scratchpad:${generateId()}`,
        JSON.stringify({ content, ...metadata }),
        { expirationTtl: 72 * 60 * 60 } // 72 hours
      );

    case 'episodic':
      return await db.prepare(
        `INSERT INTO episodic (id, date, content, ...) VALUES (?, ?, ?, ...)`
      ).bind(generateId(), new Date(), content).run();

    case 'fact':
      // Facts require validation before storage
      const validated = await validateFact(content);
      if (validated.confidence > 0.8) {
        return await db.prepare(
          `INSERT INTO facts (id, fact, confidence, ...) VALUES (?, ?, ?, ...)`
        ).bind(generateId(), content, validated.confidence).run();
      }
      break;

    case 'experiential':
      // Generate embedding for semantic search
      const embedding = await generateEmbedding(content);
      return await vectorize.insert({
        id: generateId(),
        values: embedding,
        metadata: { pattern: content, ...metadata }
      });
  }
};

// Read from memory
const recall = async (query, tiers = ['fact', 'experiential']) => {
  const results = [];

  for (const tier of tiers) {
    switch(tier) {
      case 'scratchpad':
        const keys = await kv.list({ prefix: 'scratchpad:' });
        // Return all active scratchpad items
        break;

      case 'episodic':
        const episodes = await db.prepare(
          `SELECT * FROM episodic WHERE summary LIKE ? ORDER BY date DESC LIMIT 10`
        ).bind(`%${query}%`).all();
        results.push(...episodes);
        break;

      case 'fact':
        const facts = await db.prepare(
          `SELECT * FROM facts WHERE fact LIKE ? AND confidence > 0.7`
        ).bind(`%${query}%`).all();
        results.push(...facts);
        break;

      case 'experiential':
        const embedding = await generateEmbedding(query);
        const similar = await vectorize.query(embedding, { topK: 5 });
        results.push(...similar.matches);
        break;
    }
  }

  return results;
};

// Promote memory between tiers
const promoteMemory = async (fromTier, toTier, memoryId) => {
  // e.g., promote validated scratchpad item to fact
  const memory = await readFromTier(fromTier, memoryId);
  await remember(toTier, memory.content, memory.metadata);
  await deleteFromTier(fromTier, memoryId);
};
```

## Memory Injection for AI Calls

```javascript
const buildContextWithMemory = async (userMessage) => {
  // 1. Recall relevant facts
  const facts = await recall(userMessage, ['fact']);

  // 2. Get recent episodic context
  const recent = await db.prepare(
    `SELECT * FROM episodic ORDER BY date DESC LIMIT 5`
  ).all();

  // 3. Find relevant patterns
  const patterns = await recall(userMessage, ['experiential']);

  // 4. Get active scratchpad
  const scratchpad = await recall('', ['scratchpad']);

  // 5. Build context string
  return `
## Known Facts
${facts.map(f => `- ${f.fact}`).join('\n')}

## Recent Context
${recent.map(r => `- ${r.date}: ${r.summary}`).join('\n')}

## Relevant Patterns
${patterns.map(p => `- ${p.pattern}`).join('\n')}

## Current Working Memory
${scratchpad.map(s => `- ${s.content}`).join('\n')}
`;
};
```

## Instructions

When working with memory:

1. Always write to scratchpad first, promote to permanent tiers after validation
2. Include source attribution for all facts
3. Use semantic search (embeddings) for experiential memory
4. Respect TTLs - don't manually delete scratchpad items
5. Build memory context for every AI call
6. Let users view and edit their fact store
7. Log memory operations for debugging
