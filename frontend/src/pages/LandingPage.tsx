import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-[#e8eaf0]">
      <nav className="flex items-center justify-between px-12 py-5 border-b border-[rgba(255,255,255,0.07)] sticky top-0 bg-[#0a0b0e]/85 backdrop-blur-md z-50">
        <div className="flex items-center gap-2 font-display font-bold text-lg">
          <span className="w-2 h-2 rounded-full bg-[#4f8ef7]" />
          DevAssist AI
        </div>
        <div className="flex items-center gap-8">
          {['Features', 'How it works', 'Docs'].map((label) => (
            <a key={label} className="text-sm text-[#8a90a0] hover:text-[#e8eaf0] cursor-pointer transition-colors">{label}</a>
          ))}
          <button onClick={() => nav('/login')} className="px-3 py-1.5 text-sm text-[#8a90a0] border border-[rgba(255,255,255,0.12)] rounded-md hover:border-[#4f8ef7] hover:text-[#4f8ef7] transition-all">Sign In</button>
          <button onClick={() => nav('/register')} className="px-3 py-1.5 text-sm bg-[#4f8ef7] text-white rounded-md hover:bg-[#3a7ef0] transition-all">Get Started</button>
        </div>
      </nav>

      <section className="px-12 py-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-[#4f8ef7]/10 border border-[#4f8ef7]/25 text-[#4f8ef7] px-4 py-1.5 rounded-full text-xs font-medium mb-6">
          ⚡ AI-powered code review & analysis
        </div>
        <h1 className="font-display text-5xl font-bold leading-tight mb-6">
          Your <span className="bg-gradient-to-r from-[#4f8ef7] to-[#7c5cf7] bg-clip-text text-transparent">AI Junior Developer</span><br />that never sleeps
        </h1>
        <p className="text-[#8a90a0] text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Upload your code and get instant bug analysis, smart test generation, fix suggestions, and clear explanations — powered by Claude AI.
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => nav('/register')} className="px-6 py-3 bg-[#4f8ef7] text-white rounded-md font-medium hover:bg-[#3a7ef0] transition-all">Start for free →</button>
          <button onClick={() => nav('/login')} className="px-6 py-3 border border-[rgba(255,255,255,0.12)] text-[#8a90a0] rounded-md hover:border-[#4f8ef7] hover:text-[#4f8ef7] transition-all">View demo</button>
        </div>
      </section>

      <section className="px-12 py-20 max-w-6xl mx-auto">
        <p className="text-center text-xs font-semibold tracking-widest uppercase text-[#4f8ef7] mb-3">Capabilities</p>
        <h2 className="text-center font-display text-3xl font-bold mb-4">Everything a junior dev does, instantly</h2>
        <p className="text-center text-[#8a90a0] max-w-md mx-auto mb-12">Stop spending hours on code review. Let your AI handle the groundwork.</p>
        <div className="grid grid-cols-3 gap-5">
          {[
            { icon: '🔍', title: 'Code Explanation', desc: 'Understand unfamiliar codebases. Get plain-English explanations of any function or class.' },
            { icon: '🐛', title: 'Bug Detection', desc: 'Surface potential bugs, edge cases, and risky assumptions with severity ratings.' },
            { icon: '🧪', title: 'Test Generation', desc: 'Generate comprehensive unit tests covering happy paths, edge cases, and failure scenarios.' },
            { icon: '🔧', title: 'Fix Suggestions', desc: 'Get targeted improvements with before/after diffs and explanations for each change.' },
            { icon: '📋', title: 'Run History', desc: 'Full history of all AI runs. Revisit previous analyses and compare results over time.' },
            { icon: '🚀', title: 'Multi-Language', desc: 'TypeScript, JavaScript, Python, Go, Rust. Upload files or paste code directly.' },
          ].map((feature, index) => (
            <div key={index} className="bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-xl p-6 hover:border-[rgba(255,255,255,0.12)] transition-colors">
              <div className="text-2xl mb-3">{feature.icon}</div>
              <h3 className="font-display font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-[#8a90a0] leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-[#111318] border-y border-[rgba(255,255,255,0.07)]">
        <div className="max-w-4xl mx-auto px-12">
          <p className="text-center text-xs font-semibold tracking-widest uppercase text-[#4f8ef7] mb-3">How it works</p>
          <h2 className="text-center font-display text-3xl font-bold mb-12">From code to insights in seconds</h2>
          <div className="grid grid-cols-4 gap-8">
            {[
              { n: '01', title: 'Create a project', desc: 'Name your project and select the primary language.' },
              { n: '02', title: 'Upload your code', desc: 'Paste code or upload files directly into the workspace.' },
              { n: '03', title: 'Run AI analysis', desc: 'Click Explain, Analyze, Test, or Fix — get results instantly.' },
              { n: '04', title: 'Review & iterate', desc: 'Accept suggestions, view diffs, and save generated tests.' },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#181c24] border border-[rgba(255,255,255,0.12)] flex items-center justify-center mx-auto mb-4 font-mono text-sm font-semibold text-[#4f8ef7]">{step.n}</div>
                <h4 className="font-display font-semibold text-sm mb-2">{step.title}</h4>
                <p className="text-xs text-[#8a90a0] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 text-center px-12">
        <h2 className="font-display text-3xl font-bold mb-4">Start shipping better code today</h2>
        <p className="text-[#8a90a0] mb-8">Free to start. No credit card required.</p>
        <button onClick={() => nav('/register')} className="px-8 py-3.5 bg-[#4f8ef7] text-white rounded-md font-medium text-base hover:bg-[#3a7ef0] transition-all">Create free account →</button>
      </section>
    </div>
  );
}
