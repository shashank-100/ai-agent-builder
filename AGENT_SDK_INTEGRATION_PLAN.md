# Claude Agent SDK Integration Plan

## 🎯 Overview

Integrate the Claude Agent SDK as the **core execution engine** for our AI Agent Builder, enabling users to create production-ready agents through visual workflows that compile to SDK-based code.

---

## 🏗️ Architecture Integration

### Before (Original Plan)
```
User Input → Claude Parsing → Custom Execution Engine → Results
```

### After (With Agent SDK)
```
User Input (Visual/NL) → Agent Configuration → Claude Agent SDK → Autonomous Execution
```

**Key Benefit**: We get autonomous tool invocation, session management, and hooks for free from the SDK!

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Frontend (React + Visual Builder)              │
│  ┌────────────────┐   ┌──────────────┐  ┌────────────┐ │
│  │ Visual Workflow│   │ Tool Library │  │NL→Workflow │ │
│  │   Builder      │   │   Browser    │  │  Generator │ │
│  └────────────────┘   └──────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼ REST API
┌─────────────────────────────────────────────────────────┐
│              Backend (Express + TypeScript)              │
│  ┌────────────────┐   ┌──────────────┐  ┌────────────┐ │
│  │Agent Config    │   │ Tool Registry│  │Code Export │ │
│  │   Service      │   │   Manager    │  │  Service   │ │
│  └────────────────┘   └──────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│          Claude Agent SDK (Python Runtime)               │
│  ┌────────────────┐   ┌──────────────┐  ┌────────────┐ │
│  │ClaudeSDKClient │   │  Tool System │  │   Hooks    │ │
│  │  (Execution)   │   │(MCP + Custom)│  │ (Monitor)  │ │
│  └────────────────┘   └──────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementation Plan

### Phase 1: SDK Integration Foundation (Week 1-2)

#### 1.1 Add Python SDK Runtime
```bash
# Backend will spawn Python processes for execution
cd backend
npm install python-shell  # Node.js → Python bridge
```

**Directory Structure:**
```
backend/
├── src/
│   ├── agents/          # Node.js agent management
│   └── python/          # Python SDK runtime
│       ├── agent_runner.py        # SDK execution wrapper
│       ├── tool_registry.py       # Dynamic tool registration
│       └── execution_monitor.py   # Real-time monitoring
```

#### 1.2 Create Agent SDK Wrapper

**`backend/src/python/agent_runner.py`**:
```python
import asyncio
import json
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions, tool, create_sdk_mcp_server
from typing import Any

class AgentRunner:
    def __init__(self, agent_config: dict):
        self.config = agent_config
        self.tools = []
        self.mcp_servers = {}

    async def register_tools(self, tool_definitions: list):
        """Dynamically register custom tools from JSON config."""
        for tool_def in tool_definitions:
            @tool(
                tool_def['name'],
                tool_def['description'],
                tool_def['input_schema']
            )
            async def dynamic_tool(args: dict[str, Any]) -> dict[str, Any]:
                # Execute tool logic
                # In production: call external APIs, run code, etc.
                return {"content": [{"type": "text", "text": "Tool executed"}]}

            self.tools.append(dynamic_tool)

        # Create MCP server
        if self.tools:
            server = create_sdk_mcp_server(
                name=self.config['agent_id'],
                version="1.0.0",
                tools=self.tools
            )
            self.mcp_servers = {self.config['agent_id']: server}

    async def execute(self, prompt: str):
        """Execute agent with given prompt."""
        allowed_tools = self.config.get('allowed_tools', [])

        # Add MCP tool names
        if self.tools:
            agent_id = self.config['agent_id']
            for tool in self.tools:
                allowed_tools.append(f"mcp__{agent_id}__{tool.__name__}")

        options = ClaudeAgentOptions(
            system_prompt=self.config.get('system_prompt', ''),
            allowed_tools=allowed_tools,
            mcp_servers=self.mcp_servers,
            permission_mode=self.config.get('permission_mode', 'default'),
            model=self.config.get('model', 'claude-sonnet-4-5')
        )

        results = []
        async with ClaudeSDKClient(options=options) as client:
            await client.query(prompt)
            async for message in client.receive_response():
                results.append(str(message))

        return results

async def main():
    # Read agent config from stdin
    config_json = input()
    config = json.loads(config_json)

    runner = AgentRunner(config['agent'])

    # Register custom tools
    if 'tools' in config:
        await runner.register_tools(config['tools'])

    # Execute agent
    results = await runner.execute(config['prompt'])

    # Output results as JSON
    print(json.dumps({'results': results}))

if __name__ == "__main__":
    asyncio.run(main())
```

#### 1.3 Node.js → Python Bridge

**`backend/src/services/agentExecutor.ts`**:
```typescript
import { PythonShell } from 'python-shell';
import path from 'path';

interface AgentConfig {
  agent_id: string;
  system_prompt: string;
  model: string;
  allowed_tools: string[];
  permission_mode: string;
}

interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, any>;
}

export class AgentExecutor {
  async execute(
    agentConfig: AgentConfig,
    prompt: string,
    tools?: ToolDefinition[]
  ): Promise<any> {
    const pythonScript = path.join(__dirname, '../python/agent_runner.py');

    const input = JSON.stringify({
      agent: agentConfig,
      prompt,
      tools: tools || [],
    });

    return new Promise((resolve, reject) => {
      const pyshell = new PythonShell(pythonScript, {
        mode: 'text',
        pythonOptions: ['-u'],
      });

      pyshell.send(input);

      pyshell.on('message', (message) => {
        try {
          const result = JSON.parse(message);
          resolve(result);
        } catch (error) {
          console.error('Failed to parse Python output:', message);
        }
      });

      pyshell.on('error', reject);
      pyshell.end();
    });
  }
}
```

---

### Phase 2: Tool System (Week 2-3)

#### 2.1 Built-in Tool Library

Create pre-configured tools that users can enable with one click:

**Communication Tools:**
```typescript
const BUILTIN_TOOLS = {
  gmail: {
    name: 'gmail_send',
    description: 'Send emails via Gmail',
    input_schema: {
      to: 'string',
      subject: 'string',
      body: 'string',
    },
    implementation: async (args) => {
      // Gmail API integration
    },
  },
  slack: {
    name: 'slack_send',
    description: 'Send Slack messages',
    input_schema: {
      channel: 'string',
      message: 'string',
    },
    implementation: async (args) => {
      // Slack API integration
    },
  },
  // ... 100+ more tools
};
```

**Tool Categories:**
1. **Communication**: Gmail, Slack, Discord, Teams, WhatsApp
2. **Data**: Google Sheets, Airtable, PostgreSQL, MongoDB
3. **Productivity**: Calendar, Notion, Asana, Trello
4. **Social**: Twitter, LinkedIn, Instagram
5. **Development**: GitHub, GitLab, Linear, Sentry
6. **AI/ML**: OpenAI, Replicate, Hugging Face
7. **Web**: HTTP Request, Web Scraper, SEO Tools
8. **File**: CSV, JSON, PDF processors

#### 2.2 Tool Registry Database Schema

**Update Prisma schema:**
```prisma
model Tool {
  id              String   @id @default(uuid())
  name            String   @unique
  description     String
  category        String
  inputSchema     Json
  implementation  String?  @db.Text  // Python code
  isBuiltin       Boolean  @default(false)
  isPublic        Boolean  @default(false)
  createdBy       String?
  createdAt       DateTime @default(now())

  agents          AgentTool[]

  @@map("tools")
}

model AgentTool {
  id              String  @id @default(uuid())
  agentId         String  @map("agent_id")
  toolId          String  @map("tool_id")
  configuration   Json?   // Tool-specific config

  agent           Agent   @relation(fields: [agentId], references: [id])
  tool            Tool    @relation(fields: [toolId], references: [id])

  @@unique([agentId, toolId])
  @@map("agent_tools")
}
```

#### 2.3 Tool Management API

**`backend/src/routes/tools.ts`**:
```typescript
import { Router } from 'express';

const router = Router();

// List all available tools
router.get('/', async (req, res) => {
  const { category, search } = req.query;
  // TODO: Query from database
  res.json({
    tools: [
      {
        id: '1',
        name: 'gmail_send',
        description: 'Send emails via Gmail',
        category: 'communication',
        inputSchema: { to: 'string', subject: 'string', body: 'string' },
        isBuiltin: true,
      },
    ],
  });
});

// Get tool details
router.get('/:id', async (req, res) => {
  // TODO: Fetch tool
  res.json({ id: req.params.id });
});

// Create custom tool
router.post('/', async (req, res) => {
  const { name, description, category, inputSchema, implementation } = req.body;
  // TODO: Validate and save tool
  res.status(201).json({ id: 'new-tool-id' });
});

// Test tool execution
router.post('/:id/test', async (req, res) => {
  const { args } = req.body;
  // TODO: Execute tool with test args
  res.json({ result: 'Test execution result' });
});

export default router;
```

---

### Phase 3: Visual Workflow → SDK Config (Week 3-4)

#### 3.1 Workflow Definition Format

Visual workflows get compiled to SDK-compatible configuration:

```typescript
interface WorkflowNode {
  id: string;
  type: 'trigger' | 'llm' | 'tool' | 'condition' | 'output';
  position: { x: number; y: number };
  data: {
    // Node-specific data
    tool?: string;
    config?: Record<string, any>;
  };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

interface WorkflowDefinition {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
```

**Example Visual Workflow:**
```json
{
  "nodes": [
    {
      "id": "1",
      "type": "trigger",
      "data": { "type": "manual" }
    },
    {
      "id": "2",
      "type": "tool",
      "data": {
        "tool": "gmail_fetch",
        "config": { "query": "is:unread" }
      }
    },
    {
      "id": "3",
      "type": "llm",
      "data": {
        "model": "claude-sonnet-4-5",
        "prompt": "Categorize emails by urgency"
      }
    },
    {
      "id": "4",
      "type": "condition",
      "data": {
        "field": "urgency",
        "operator": "==",
        "value": "high"
      }
    },
    {
      "id": "5",
      "type": "tool",
      "data": {
        "tool": "slack_send",
        "config": { "channel": "#alerts" }
      }
    }
  ],
  "edges": [
    { "id": "e1", "source": "1", "target": "2" },
    { "id": "e2", "source": "2", "target": "3" },
    { "id": "e3", "source": "3", "target": "4" },
    { "id": "e4", "source": "4", "target": "5", "label": "if urgent" }
  ]
}
```

#### 3.2 Workflow → SDK Compiler

**`backend/src/services/workflowCompiler.ts`**:
```typescript
export class WorkflowCompiler {
  compile(workflow: WorkflowDefinition): AgentConfig {
    const tools = workflow.nodes
      .filter(n => n.type === 'tool')
      .map(n => n.data.tool);

    const systemPrompt = this.generateSystemPrompt(workflow);
    const allowedTools = ['Read', 'Write', ...tools];

    return {
      agent_id: 'agent-' + Date.now(),
      system_prompt: systemPrompt,
      model: 'claude-sonnet-4-5',
      allowed_tools: allowedTools,
      permission_mode: 'default',
    };
  }

  generateSystemPrompt(workflow: WorkflowDefinition): string {
    // Analyze workflow and generate detailed instructions
    let prompt = 'You are an AI agent. Follow these steps:\n\n';

    // Sort nodes by execution order (topological sort of graph)
    const executionOrder = this.topologicalSort(workflow);

    executionOrder.forEach((node, index) => {
      prompt += `${index + 1}. `;

      if (node.type === 'tool') {
        prompt += `Use tool "${node.data.tool}" with config: ${JSON.stringify(node.data.config)}\n`;
      } else if (node.type === 'llm') {
        prompt += `${node.data.prompt}\n`;
      } else if (node.type === 'condition') {
        prompt += `Check if ${node.data.field} ${node.data.operator} ${node.data.value}\n`;
      }
    });

    return prompt;
  }

  topologicalSort(workflow: WorkflowDefinition): WorkflowNode[] {
    // Implement topological sort algorithm
    // Returns nodes in execution order
    return workflow.nodes; // Simplified
  }
}
```

---

### Phase 4: Code Export (Week 4)

#### 4.1 Export to Python (Agent SDK)

**`backend/src/services/codeExporter.ts`**:
```typescript
export class CodeExporter {
  exportToPython(agent: Agent, tools: Tool[]): string {
    return `
import asyncio
from claude_agent_sdk import (
    ClaudeSDKClient,
    ClaudeAgentOptions,
    tool,
    create_sdk_mcp_server
)
from typing import Any

# Custom tools
${tools.map(t => this.generateToolFunction(t)).join('\n\n')}

async def main():
    # Create MCP server with tools
    ${tools.length > 0 ? `
    custom_tools = create_sdk_mcp_server(
        name="${agent.id}",
        version="1.0.0",
        tools=[${tools.map(t => t.name).join(', ')}]
    )
    ` : ''}

    # Configure agent
    options = ClaudeAgentOptions(
        system_prompt="""${agent.systemPrompt}""",
        allowed_tools=${JSON.stringify(agent.tools)},
        ${tools.length > 0 ? `mcp_servers={"agent": custom_tools},` : ''}
        model="${agent.model}",
        permission_mode="${agent.configuration.permissionMode || 'default'}"
    )

    # Execute agent
    async with ClaudeSDKClient(options=options) as client:
        await client.query("Your prompt here")
        async for message in client.receive_response():
            print(message)

if __name__ == "__main__":
    asyncio.run(main())
`;
  }

  generateToolFunction(tool: Tool): string {
    return `
@tool("${tool.name}", "${tool.description}", ${JSON.stringify(tool.inputSchema)})
async def ${tool.name}(args: dict[str, Any]) -> dict[str, Any]:
    ${tool.implementation || '# TODO: Implement tool logic'}
    return {"content": [{"type": "text", "text": "Tool executed"}]}
`;
  }
}
```

**API Endpoint:**
```typescript
// backend/src/routes/agents.ts
router.post('/:id/export', async (req, res) => {
  const { id } = req.params;
  const { language } = req.body; // 'python' or 'typescript'

  // Fetch agent and tools
  const agent = await prisma.agent.findUnique({
    where: { id },
    include: { tools: true },
  });

  const exporter = new CodeExporter();
  const code = exporter.exportToPython(agent, agent.tools);

  res.json({ code, language });
});
```

---

### Phase 5: Enhanced Features (Week 5-6)

#### 5.1 Real-Time Execution Monitoring

Use SDK hooks to provide live execution updates:

```python
# backend/src/python/execution_monitor.py
import asyncio
import json
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions

class ExecutionMonitor:
    def __init__(self, websocket):
        self.ws = websocket

    async def on_tool_use_before(self, tool_name: str, input_data: dict):
        """Send event before tool execution."""
        await self.ws.send(json.dumps({
            'event': 'tool_use_before',
            'tool': tool_name,
            'input': input_data,
            'timestamp': time.time()
        }))

    async def on_tool_use_after(self, tool_name: str, result: dict):
        """Send event after tool execution."""
        await self.ws.send(json.dumps({
            'event': 'tool_use_after',
            'tool': tool_name,
            'result': result,
            'timestamp': time.time()
        }))
```

#### 5.2 Quality Scoring

Analyze agent execution to generate quality scores:

```typescript
export class QualityAnalyzer {
  async analyzeAgent(agentId: string): Promise<number> {
    const executions = await prisma.agentExecution.findMany({
      where: { agentId },
      orderBy: { startedAt: 'desc' },
      take: 100,
    });

    const metrics = {
      successRate: executions.filter(e => e.status === 'completed').length / executions.length,
      avgDuration: executions.reduce((sum, e) => sum + e.durationMs, 0) / executions.length,
      errorFrequency: executions.filter(e => e.error).length / executions.length,
    };

    // Calculate score 0-100
    let score = 100;
    score -= (1 - metrics.successRate) * 50; // Success rate worth 50 points
    score -= metrics.errorFrequency * 30;     // Error frequency worth 30 points
    score -= Math.min(metrics.avgDuration / 5000, 1) * 20; // Speed worth 20 points

    return Math.max(0, Math.min(100, score));
  }
}
```

---

## 📋 Updated Database Schema

```prisma
model Agent {
  // ... existing fields
  sdkVersion       String?  @map("sdk_version")  // Track SDK version used
  allowedTools     String[] @map("allowed_tools")
  permissionMode   String   @default("default") @map("permission_mode")
  hooks            Json?    // SDK hooks configuration

  tools            AgentTool[]
}

model Tool {
  id              String   @id @default(uuid())
  name            String   @unique
  description     String
  category        String
  inputSchema     Json     @map("input_schema")
  implementation  String?  @db.Text
  isBuiltin       Boolean  @default(false) @map("is_builtin")
  isPublic        Boolean  @default(false) @map("is_public")
  createdBy       String?  @map("created_by")
  createdAt       DateTime @default(now()) @map("created_at")

  agents          AgentTool[]

  @@map("tools")
}

model AgentTool {
  id              String  @id @default(uuid())
  agentId         String  @map("agent_id")
  toolId          String  @map("tool_id")
  configuration   Json?

  agent           Agent   @relation(fields: [agentId], references: [id])
  tool            Tool    @relation(fields: [toolId], references: [id])

  @@unique([agentId, toolId])
  @@map("agent_tools")
}
```

---

## 🚀 Deployment Checklist

- [ ] Install Python 3.10+ in production environment
- [ ] Install `claude-agent-sdk` via pip
- [ ] Configure `ANTHROPIC_API_KEY` environment variable
- [ ] Set up Node.js → Python bridge (python-shell)
- [ ] Deploy tool implementations (API keys for Gmail, Slack, etc.)
- [ ] Configure permission policies for production
- [ ] Set up monitoring for agent executions
- [ ] Create tool library with 100+ pre-built tools
- [ ] Build tool testing interface
- [ ] Document SDK integration for users

---

## 💡 Key Benefits of SDK Integration

1. **Autonomous Execution**: Claude decides which tools to use and when
2. **Built-in Tools**: File operations, web search, bash commands included
3. **Session Management**: Conversation history and context handled automatically
4. **Hooks System**: Monitor and control agent behavior at runtime
5. **Permission Control**: Fine-grained security policies
6. **Code Export**: Users can take generated code and run it anywhere
7. **Production Ready**: Mature, tested framework from Anthropic
8. **Performance**: Optimized for Claude models
9. **Extensibility**: Easy to add custom tools
10. **Community**: Access to growing ecosystem of MCP tools

---

## 🎯 User Experience Flow

1. **Create Agent Visually**
   - Drag nodes onto canvas
   - Configure tools with forms
   - Connect nodes to define flow

2. **Test in Browser**
   - Click "Run Test"
   - See real-time execution
   - View tool calls and results

3. **Export to Code**
   - Click "Export"
   - Choose Python/TypeScript
   - Get fully functional code

4. **Deploy Anywhere**
   - Copy exported code
   - Run on any machine
   - No platform lock-in

---

**Last Updated:** 2026-01-09
**Status:** Ready to implement
**Estimated Time:** 4-6 weeks for full integration
