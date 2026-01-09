# AI Agent Builder

> Build AI agents with natural language - no coding required

A LangSmith-inspired platform that allows anyone to create, configure, and deploy AI agents using simple natural language descriptions.

## Features

- **Natural Language Agent Creation** - Describe your agent, and Claude AI will configure it for you
- **Step-by-Step Wizard** - Guided agent setup with intelligent suggestions
- **Template Gallery** - Start from pre-built templates for common use cases
- **Multi-Model Support** - Choose from Claude Sonnet, Opus, and Haiku
- **Agent Dashboard** - Manage, monitor, and execute your agents
- **Execution History** - Track performance and debug issues

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Anthropic API key

### Installation

```bash
# Clone the repository
git clone https://github.com/shashank-100/ai-agent-builder.git
cd ai-agent-builder

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Add your Anthropic API key to backend/.env
echo "ANTHROPIC_API_KEY=sk-ant-xxxxx" >> backend/.env

# Start all services
docker-compose up -d

# Run database migrations
cd backend && npx prisma migrate dev

# Access the app
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001
```

## Usage

### Creating an Agent

1. Navigate to the Agent Builder
2. Describe your agent in natural language:
   ```
   "I want an agent that monitors my GitHub repos for new issues,
   categorizes them by urgency, and sends me a daily summary email"
   ```
3. Select your preferred model (Sonnet 4.5 recommended)
4. Follow the step-by-step wizard
5. Review and create your agent

### Using Templates

Browse the template gallery and select from:
- LinkedIn Recruiter
- Email Assistant
- Daily Calendar Brief
- Social Media Monitor
- Code Review Assistant
- Customer Support Agent
- And more...

## Architecture

```
Frontend (React + TypeScript + Tailwind)
    ↓
Backend API (Express + TypeScript)
    ↓
Claude AI Service + PostgreSQL + Redis
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **AI**: Anthropic Claude API (Sonnet 4.5)
- **Database**: PostgreSQL 15, Prisma ORM
- **Cache**: Redis
- **Container**: Docker, Docker Compose

## Project Structure

```
ai-agent-builder/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── package.json
├── backend/            # Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   └── utils/
│   ├── prisma/
│   └── package.json
├── docker/             # Docker configurations
└── docker-compose.yml
```

## Development

### Backend Development

```bash
cd backend
npm install
npm run dev        # Start with hot reload
npm run test       # Run tests
npm run lint       # Lint code
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev        # Start dev server
npm run build      # Production build
npm run preview    # Preview production build
```

### Database Management

```bash
cd backend
npx prisma studio          # Open database GUI
npx prisma migrate dev     # Create new migration
npx prisma generate        # Generate Prisma client
```

## API Documentation

API documentation is available at `http://localhost:3001/api-docs` when running in development mode.

### Key Endpoints

- `POST /api/agents/parse` - Parse natural language description
- `POST /api/agents` - Create new agent
- `GET /api/agents` - List all agents
- `POST /api/agents/:id/execute` - Execute agent
- `GET /api/templates` - List agent templates

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation
- Join our Discord community

## Roadmap

- [x] Phase 1: Project foundation
- [ ] Phase 2: Core backend implementation
- [ ] Phase 3: Agent builder UI
- [ ] Phase 4: Template system
- [ ] Phase 5: Agent dashboard
- [ ] Phase 6: Production deployment

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed roadmap.

---

Built with Claude AI
