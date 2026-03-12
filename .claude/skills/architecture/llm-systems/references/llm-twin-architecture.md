# LLM-Twin Architecture Pattern

> **Purpose**: Production RAG system coupled with persona learning for personalized AI content generation
> **Load when**: Designing learning AI systems with user-specific voice profiles

## Overview

**LLM-Twin** combines two systems:
1. **Production RAG**: Retrieval-Augmented Generation for factual accuracy
2. **Persona Learning**: User voice profile that improves from feedback

**Goal**: Generate content that is both factually accurate (RAG) AND in the user's voice (Persona).

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        User Input                             │
│                  "Write LinkedIn post about AI trends"        │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────┐
│              Persona Retrieval                                 │
│  SELECT * FROM personas WHERE user_id = auth.uid()            │
│  → tone: "professional", vocabulary: "technical"              │
└────────────────┬───────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────┐
│              RAG Retrieval                                     │
│  1. Semantic search: Vector similarity (top_k=20)             │
│  2. Keyword search: BM25 exact matches (top_k=20)             │
│  3. Hybrid fusion: Combine results                            │
│  4. Reranking: Cohere reranker (narrow to top_k=5)           │
│  → Retrieved context: [relevant documents]                    │
└────────────────┬───────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────┐
│              LLM Generation                                    │
│  Prompt:                                                       │
│    Context: {retrieved_documents}                             │
│    Voice: {persona.tone}, {persona.vocabulary}                │
│    Task: {user_input}                                         │
│  → Generated content in user's voice                          │
└────────────────┬───────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────┐
│              User Feedback                                     │
│  [Approve] [Edit] [Reject]                                    │
│  → Store: INSERT INTO feedback (persona_id, action, content) │
└────────────────┬───────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────┐
│              Preference Learning                               │
│  1. Collect preference pairs: (original, edited)              │
│  2. Update persona: Incorporate approved samples              │
│  3. Train reward model: Predict user preferences              │
│  4. Optimize policy: Generate content users prefer            │
│  → Improved persona over time                                 │
└────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Persona Storage (Supabase)

```sql
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,

  -- Voice attributes (learned from user feedback)
  voice_attributes JSONB NOT NULL DEFAULT '{
    "tone": "professional",
    "vocabulary": "technical",
    "sentence_structure": "medium",
    "formality_level": 7,
    "humor_usage": "minimal"
  }'::jsonb,

  -- Training data (approved/edited/rejected samples)
  training_data JSONB NOT NULL DEFAULT '{
    "approved_samples": [],
    "edited_samples": [],
    "rejected_samples": []
  }'::jsonb,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own personas"
  ON personas FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_personas_user_id ON personas(user_id);
```

### 2. RAG Knowledge Base

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,

  -- Embeddings for semantic search (pgvector)
  embedding vector(1536),  -- OpenAI ada-002 dimensions

  -- Metadata for filtering
  source TEXT,  -- "linkedin_post", "blog_article", "email"
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access their own documents"
  ON documents FOR ALL
  USING (auth.uid() = user_id);

-- Vector similarity index (pgvector)
CREATE INDEX idx_documents_embedding ON documents
  USING ivfflat (embedding vector_cosine_ops);

-- Keyword search index
CREATE INDEX idx_documents_content_fts ON documents
  USING gin(to_tsvector('english', content));
```

### 3. Feedback Collection

```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID REFERENCES personas(id) NOT NULL,

  -- Generated content
  original_content TEXT NOT NULL,

  -- User action
  action TEXT CHECK (action IN ('approve', 'edit', 'reject')) NOT NULL,

  -- If edited, store user's version
  edited_content TEXT,

  -- Context for learning
  prompt TEXT,  -- Original user request
  platform TEXT,  -- "linkedin", "twitter", "email"

  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access their own feedback"
  ON feedback FOR ALL
  USING (auth.uid() = (SELECT user_id FROM personas WHERE id = persona_id));

CREATE INDEX idx_feedback_persona_id ON feedback(persona_id);
CREATE INDEX idx_feedback_action ON feedback(action);
```

## API Design (Supabase Edge Functions)

### 1. Generate Content (RAG + Persona)

```typescript
// supabase/functions/generate-content/index.ts
import { createClient } from '@supabase/supabase-js@2.50.2';

Deno.serve(async (req) => {
  const { prompt, platform, persona_id } = await req.json();

  // 1. Retrieve persona
  const { data: persona } = await supabase
    .from('personas')
    .select('voice_attributes, training_data')
    .eq('id', persona_id)
    .single();

  // 2. RAG retrieval (hybrid search)
  const { data: documents } = await supabase.rpc('hybrid_search', {
    query_text: prompt,
    query_embedding: await getEmbedding(prompt),
    match_count: 5
  });

  // 3. Generate content with LLM
  const generated = await generateWithPersona({
    prompt,
    context: documents,
    voice: persona.voice_attributes,
    platform
  });

  return new Response(JSON.stringify({ content: generated }));
});
```

### 2. Collect Feedback

```typescript
// supabase/functions/collect-feedback/index.ts
Deno.serve(async (req) => {
  const { persona_id, original_content, action, edited_content, platform } = await req.json();

  // Store feedback
  const { data: feedback } = await supabase
    .from('feedback')
    .insert({
      persona_id,
      original_content,
      action,
      edited_content,
      platform
    })
    .select()
    .single();

  // If approved or edited, update persona training data
  if (action === 'approve' || action === 'edit') {
    await updatePersonaTrainingData(persona_id, {
      action,
      content: action === 'approve' ? original_content : edited_content,
      platform
    });
  }

  return new Response(JSON.stringify({ success: true }));
});
```

## Frontend Integration (React)

### 1. Content Generation UI

```typescript
// src/components/ContentGenerator/ContentGenerator.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function ContentGenerator({ personaId }: { personaId: string }) {
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState<'linkedin' | 'twitter' | 'email'>('linkedin');
  const [generated, setGenerated] = useState<string | null>(null);

  const handleGenerate = async () => {
    const { data } = await supabase.functions.invoke('generate-content', {
      body: { prompt, platform, persona_id: personaId }
    });

    setGenerated(data.content);
  };

  return (
    <div>
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
        <option value="linkedin">LinkedIn</option>
        <option value="twitter">Twitter</option>
        <option value="email">Email</option>
      </select>
      <button onClick={handleGenerate}>Generate</button>

      {generated && <ContentPreview content={generated} />}
    </div>
  );
}
```

### 2. Feedback Buttons

```typescript
// src/components/FeedbackButtons/FeedbackButtons.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function FeedbackButtons({
  personaId,
  originalContent,
  platform
}: {
  personaId: string;
  originalContent: string;
  platform: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(originalContent);

  const handleFeedback = async (action: 'approve' | 'edit' | 'reject') => {
    await supabase.functions.invoke('collect-feedback', {
      body: {
        persona_id: personaId,
        original_content: originalContent,
        action,
        edited_content: action === 'edit' ? editedContent : null,
        platform
      }
    });
  };

  return (
    <div>
      <button onClick={() => handleFeedback('approve')}>✓ Approve</button>
      <button onClick={() => setIsEditing(true)}>✎ Edit</button>
      <button onClick={() => handleFeedback('reject')}>✗ Reject</button>

      {isEditing && (
        <div>
          <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} />
          <button onClick={() => handleFeedback('edit')}>Save Edits</button>
        </div>
      )}
    </div>
  );
}
```

## Preference Learning Workflow

### Step 1: Collect Preference Pairs

For each feedback entry where `action = 'edit'`:
- **Original**: LLM-generated content
- **Preferred**: User-edited content

Store as training pairs: `(original, preferred)`

### Step 2: Update Persona (Heuristic Approach)

Analyze edits to detect patterns:

```typescript
// Analyze user edits
function analyzeEdits(original: string, edited: string) {
  const originalSentences = original.split('. ').length;
  const editedSentences = edited.split('. ').length;

  // Detect sentence length preference
  if (editedSentences < originalSentences * 0.7) {
    return { sentence_structure: 'short' };
  }

  // Detect formality changes (placeholder - use NLP library)
  // ...

  return {};
}

// Update persona voice attributes
async function updatePersonaFromFeedback(personaId: string, feedback: Feedback[]) {
  const patterns = feedback
    .filter(f => f.action === 'edit')
    .map(f => analyzeEdits(f.original_content, f.edited_content!));

  // Aggregate patterns and update persona
  const updates = aggregatePatterns(patterns);

  await supabase
    .from('personas')
    .update({ voice_attributes: updates })
    .eq('id', personaId);
}
```

### Step 3: Train Reward Model (Advanced)

For production-grade RLHF:

1. **Preference Dataset**: Export all (original, edited) pairs
2. **Reward Model**: Train binary classifier to predict which content user prefers
3. **RL Policy**: Fine-tune LLM to maximize reward (PPO or DPO)

**Tools**: OpenAI fine-tuning API, or open-source (trl library)

## Implementation Checklist

- [ ] Persona table with voice_attributes JSONB column
- [ ] Documents table with vector embeddings (pgvector)
- [ ] Feedback table with action (approve/edit/reject)
- [ ] Hybrid search function (vector + keyword)
- [ ] Generate content edge function (RAG + persona)
- [ ] Collect feedback edge function
- [ ] Update persona edge function (incorporate approved samples)
- [ ] Frontend: Content generator UI
- [ ] Frontend: Feedback buttons (approve/edit/reject)
- [ ] Analytics: Track approval rate, edit frequency

## Metrics & Monitoring

**Success Metrics**:
- **Approval Rate**: % of generated content approved without edits (target: >70%)
- **Edit Frequency**: Average edits per generated content (target: <30%)
- **Persona Convergence**: Decrease in edits over time (learning curve)

**Monitoring**:
```sql
-- Approval rate by persona
SELECT
  persona_id,
  COUNT(*) FILTER (WHERE action = 'approve') * 100.0 / COUNT(*) AS approval_rate
FROM feedback
GROUP BY persona_id;

-- Edit frequency trend (weekly)
SELECT
  DATE_TRUNC('week', created_at) AS week,
  COUNT(*) FILTER (WHERE action = 'edit') * 100.0 / COUNT(*) AS edit_rate
FROM feedback
GROUP BY week
ORDER BY week;
```

## Story Point Estimates

- **Persona schema + CRUD**: 2 SP
- **RAG setup (pgvector + hybrid search)**: 5 SP
- **Feedback collection API**: 2 SP
- **Frontend UI (generator + feedback buttons)**: 3 SP
- **Persona learning (heuristic)**: 3 SP
- **RLHF pipeline (reward model + RL policy)**: 8 SP

**Total (MVP without RLHF)**: 15 SP (~2 weeks)
**Total (Full RLHF)**: 23 SP (~3 weeks)
