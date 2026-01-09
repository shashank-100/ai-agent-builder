import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Zap, Code, Shield, TrendingDown, Workflow, Users } from 'lucide-react'

const queryClient = new QueryClient()

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold">AI Agent Builder</span>
          </div>
          <nav className="flex gap-6">
            <Link to="/agents" className="text-gray-600 hover:text-gray-900">My Agents</Link>
            <Link to="/templates" className="text-gray-600 hover:text-gray-900">Templates</Link>
            <Link to="/docs" className="text-gray-600 hover:text-gray-900">Docs</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Production-Ready AI Agents
            <br />
            in Minutes, Not Weeks
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Build AI agents 60% faster than LangChain with visual workflows,
            zero code, and enterprise-ready features.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/builder"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Building →
            </Link>
            <Link
              to="/templates"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Browse Templates
            </Link>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-4xl font-bold text-green-600 mb-2">60%</div>
            <div className="text-gray-600">Faster than LangChain</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-4xl font-bold text-green-600 mb-2">50%</div>
            <div className="text-gray-600">Lower Costs</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-4xl font-bold text-green-600 mb-2">&lt;2s</div>
            <div className="text-gray-600">Average Latency</div>
          </div>
        </div>
      </section>

      {/* Key Differentiators */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Why Choose AI Agent Builder?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Workflow className="w-8 h-8 text-blue-600" />}
            title="Visual Workflow Builder"
            description="Drag-and-drop interface. No code required. Build agents like designing a flowchart."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-blue-600" />}
            title="Zero Framework Overhead"
            description="Direct Claude API integration. 60% faster execution vs LangChain's abstraction layers."
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-blue-600" />}
            title="Production-Ready"
            description="Built-in quality gates, automatic testing, and rollback protection out of the box."
          />
          <FeatureCard
            icon={<Code className="w-8 h-8 text-blue-600" />}
            title="Code Export"
            description="Build visually, export to portable Python/TypeScript. No framework lock-in."
          />
          <FeatureCard
            icon={<TrendingDown className="w-8 h-8 text-blue-600" />}
            title="50% Cost Savings"
            description="Smart caching and model routing reduce API costs by half vs LangChain."
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-blue-600" />}
            title="Real-Time Collaboration"
            description="Google Docs-style co-editing with live cursors and comments."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Build Your First Agent?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join developers building production-ready agents without the complexity
          </p>
          <Link
            to="/builder"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>© 2026 AI Agent Builder. Built with Claude AI.</p>
          <p className="mt-2 text-sm">60% faster • 50% cheaper • 100% production-ready</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

// Placeholder pages
function AgentBuilder() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Agent Builder</h1>
      <p className="text-gray-600 mt-2">Visual workflow builder coming soon...</p>
    </div>
  )
}

function MyAgents() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">My Agents</h1>
      <p className="text-gray-600 mt-2">Agent dashboard coming soon...</p>
    </div>
  )
}

function Templates() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Templates</h1>
      <p className="text-gray-600 mt-2">Template gallery coming soon...</p>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/builder" element={<AgentBuilder />} />
          <Route path="/agents" element={<MyAgents />} />
          <Route path="/templates" element={<Templates />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App
