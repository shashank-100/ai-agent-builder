# AI Agent Builder - Implementation Plan

## 🎯 Project Overview

Build a LangSmith-style Agent Builder that allows users to create AI agents using natural language descriptions. The system will:
- Accept natural language agent descriptions
- Use Claude AI to parse requirements and guide agent creation
- Provide pre-built templates for common use cases
- Support step-by-step agent configuration
- Enable agent execution and management

---

## 🏗️ Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **UI Library**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand or React Query
- **Build Tool**: Vite
- **Routing**: React Router v6

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js with TypeScript
- **AI Integration**: Anthropic Claude API (Sonnet 4.5)
- **Validation**: Zod
- **API Documentation**: OpenAPI/Swagger

### Database
- **Primary DB**: PostgreSQL 15+
- **ORM**: Prisma
- **Caching**: Redis (for agent execution state)

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Environment**: .env configuration
- **Version Control**: Git

---

## 📊 Architecture Design

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Agent Builder│  │   Templates  │  │  My Agents   │      │
│  │     UI       │  │   Gallery    │  │   Dashboard  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Express)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Agent      │  │   Claude AI  │  │   Template   │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  Execution   │  │     Auth     │                        │
│  │   Engine     │  │   Service    │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer (PostgreSQL)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Users     │  │    Agents    │  │  Templates   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  Workspaces  │  │  Executions  │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Workspaces
```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Agent Templates
```sql
CREATE TABLE agent_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  category VARCHAR(100),
  config JSONB NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Agents
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  model VARCHAR(100) NOT NULL,
  system_prompt TEXT,
  tools JSONB,
  configuration JSONB,
  template_id UUID REFERENCES agent_templates(id),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Agent Executions
```sql
CREATE TABLE agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  input JSONB NOT NULL,
  output JSONB,
  status VARCHAR(50) DEFAULT 'running',
  error TEXT,
  duration_ms INTEGER,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

---

## 🎨 Frontend Implementation

### 1. Agent Builder Interface (`/builder`)

**Components:**
- `AgentBuilderForm.tsx` - Main natural language input
- `ModelSelector.tsx` - Model selection dropdown
- `StepWizard.tsx` - Step-by-step configuration
- `TemplateGallery.tsx` - Template selection grid

**Flow:**
```
1. User enters description → "I want an agent that..."
2. Click next/submit → Send to Claude for parsing
3. Claude extracts:
   - Agent purpose
   - Required tools/capabilities
   - Suggested configuration
   - Step-by-step questions
4. Present step wizard with:
   - Suggested name
   - Tool selection
   - Configuration options
   - Review & create
```

### 2. Template Gallery (`/templates`)

**Templates to implement:**
- LinkedIn Recruiter
- Email Assistant
- Daily Calendar Brief
- Social Media AI Monitor
- Code Review Assistant
- Customer Support Agent
- Data Analysis Agent
- Content Generator

### 3. Agent Dashboard (`/agents`)

**Features:**
- List all created agents
- Quick actions (run, edit, delete)
- Execution history
- Performance metrics

---

## ⚙️ Backend Implementation

### API Endpoints

#### Agent Management
```
POST   /api/agents/parse          # Parse natural language description
POST   /api/agents                # Create new agent
GET    /api/agents                # List agents
GET    /api/agents/:id            # Get agent details
PUT    /api/agents/:id            # Update agent
DELETE /api/agents/:id            # Delete agent
POST   /api/agents/:id/execute    # Execute agent
GET    /api/agents/:id/executions # Get execution history
```

#### Templates
```
GET    /api/templates              # List all templates
GET    /api/templates/:id          # Get template details
POST   /api/templates/:id/create   # Create agent from template
```

#### Workspaces
```
GET    /api/workspaces             # List workspaces
POST   /api/workspaces             # Create workspace
GET    /api/workspaces/:id/agents  # Get workspace agents
```

### Claude AI Integration Service

**Purpose:** Parse natural language agent descriptions and guide creation

```typescript
interface AgentParseRequest {
  description: string;
  model: string;
}

interface AgentParseResponse {
  suggestedName: string;
  purpose: string;
  recommendedTools: string[];
  systemPrompt: string;
  configuration: AgentConfig;
  questions: StepQuestion[];
}

interface StepQuestion {
  step: number;
  question: string;
  type: 'text' | 'select' | 'multiselect';
  options?: string[];
  required: boolean;
}
```

**Implementation:**
```typescript
async function parseAgentDescription(description: string) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `You are an AI agent configuration expert.

      User wants to create an agent with this description:
      "${description}"

      Extract and suggest:
      1. A concise agent name
      2. Clear purpose statement
      3. Recommended tools/capabilities
      4. System prompt
      5. Step-by-step configuration questions

      Return as JSON.`
    }]
  });

  return JSON.parse(response.content[0].text);
}
```

### Agent Execution Engine

**Purpose:** Run agents with proper context and tool execution

```typescript
interface AgentExecutionRequest {
  agentId: string;
  input: {
    prompt: string;
    context?: Record<string, any>;
  };
}

async function executeAgent(request: AgentExecutionRequest) {
  // 1. Load agent configuration
  // 2. Prepare tools
  // 3. Execute with Claude
  // 4. Store execution record
  // 5. Return results
}
```

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up project structure
- [ ] Configure Docker + Docker Compose
- [ ] Set up PostgreSQL + Prisma
- [ ] Create basic Express API
- [ ] Set up React + Vite frontend
- [ ] Configure Tailwind + shadcn/ui

### Phase 2: Core Backend (Week 2)
- [ ] Implement database schema
- [ ] Create agent CRUD API
- [ ] Integrate Claude API client
- [ ] Build agent parsing service
- [ ] Implement basic execution engine

### Phase 3: Agent Builder UI (Week 3)
- [ ] Build agent builder form
- [ ] Create model selector
- [ ] Implement step wizard
- [ ] Add real-time parsing with Claude
- [ ] Create agent preview

### Phase 4: Templates (Week 4)
- [ ] Design template schema
- [ ] Create template gallery UI
- [ ] Build 8 starter templates
- [ ] Implement template → agent creation
- [ ] Add template customization

### Phase 5: Agent Dashboard (Week 5)
- [ ] Build agent list view
- [ ] Create agent detail page
- [ ] Implement execution interface
- [ ] Add execution history
- [ ] Build analytics/metrics

### Phase 6: Polish & Deploy (Week 6)
- [ ] Add authentication (JWT or OAuth)
- [ ] Implement workspace management
- [ ] Add error handling
- [ ] Write API documentation
- [ ] Create user guide
- [ ] Deploy to production

---

## 🔑 Key Features Breakdown

### Natural Language Agent Parsing

**Input:**
```
"I want an agent that checks my LinkedIn daily, finds relevant job
candidates based on my criteria, and sends me a digest email"
```

**Claude Processing:**
```json
{
  "name": "LinkedIn Recruiter",
  "purpose": "Automated candidate sourcing and daily digest",
  "tools": [
    "linkedin_search",
    "email_sender",
    "candidate_scorer"
  ],
  "systemPrompt": "You are a recruitment assistant...",
  "steps": [
    {
      "question": "What job criteria should I use?",
      "type": "text"
    },
    {
      "question": "How often should I check LinkedIn?",
      "type": "select",
      "options": ["Daily", "Twice daily", "Weekly"]
    }
  ]
}
```

### Step-by-Step Configuration

1. **Step 1: Basic Info**
   - Agent name
   - Description
   - Model selection

2. **Step 2: Tools & Capabilities**
   - Select from available tools
   - Configure tool parameters
   - Add custom tools

3. **Step 3: System Prompt**
   - AI-generated base prompt
   - User customization
   - Template variables

4. **Step 4: Triggers & Schedule**
   - Manual trigger
   - Time-based schedule
   - Event-based triggers

5. **Step 5: Review & Create**
   - Summary of configuration
   - Test execution
   - Save agent

---

## 🛠️ Tech Stack Setup Commands

### Initial Project Setup
```bash
# Create directory structure
mkdir -p backend frontend docker

# Backend setup
cd backend
npm init -y
npm install express typescript @types/express @anthropic-ai/sdk prisma dotenv zod
npm install -D ts-node nodemon @types/node

# Frontend setup
cd ../frontend
npm create vite@latest . -- --template react-ts
npm install react-router-dom zustand @tanstack/react-query axios
npm install -D tailwindcss postcss autoprefixer
```

### Docker Compose Setup
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: agent_builder
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: agent_builder
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgresql://agent_builder:dev_password@postgres:5432/agent_builder
      REDIS_URL: redis://redis:6379
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## 📝 Environment Variables

```env
# Backend (.env)
DATABASE_URL=postgresql://agent_builder:dev_password@localhost:5432/agent_builder
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=sk-ant-xxxxx
JWT_SECRET=your-secret-key
PORT=3001
NODE_ENV=development

# Frontend (.env)
VITE_API_URL=http://localhost:3001/api
```

---

## 🎯 Success Metrics

- [ ] User can describe agent in natural language
- [ ] System generates appropriate configuration
- [ ] Step-by-step wizard completes successfully
- [ ] Agents can be created from templates
- [ ] Agents execute successfully
- [ ] Execution history is recorded
- [ ] UI is responsive and intuitive

---

## 🔄 Next Steps

1. Review and approve this plan
2. Set up development environment
3. Begin Phase 1 implementation
4. Iterate based on testing and feedback

---

## 📚 Additional Resources

- [Anthropic Claude API Docs](https://docs.anthropic.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [React Query](https://tanstack.com/query/latest)

---

**Plan Created:** 2026-01-09
**Estimated Timeline:** 6 weeks for MVP
**Target Launch:** Q1 2026
