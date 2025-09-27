import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { AuthContextValue } from '../context/AuthContext';

const features = [
  {
    icon: '👥',
    title: 'Employee Management',
    description: 'Complete HR solution with profiles, timesheets, payroll, and organizational structure.',
    highlights: ['Profile Management', 'Timesheet Tracking', 'Payslip Generation', 'Org Structure']
  },
  {
    icon: '�',
    title: 'Work Management',
    description: 'Agile project tracking with Kanban boards, work items, and timeline visualization.',
    highlights: ['Project Boards', 'Kanban Workflow', 'Task Tracking', 'Timeline Views']
  },
  {
    icon: '�',
    title: 'Secure & Self-Hosted',
    description: '100% open-source technology stack with Docker deployment for complete control.',
    highlights: ['JWT Authentication', 'Role-Based Access', 'Docker Ready', 'PostgreSQL']
  }
];

const techStack = [
  { name: 'React.js', purpose: 'Modern UI Framework', icon: '⚛️' },
  { name: 'Node.js', purpose: 'Backend API Server', icon: '🟢' },
  { name: 'PostgreSQL', purpose: 'Relational Database', icon: '🐘' },
  { name: 'Docker', purpose: 'Containerization', icon: '�' },
  { name: 'Tailwind CSS', purpose: 'Styling Framework', icon: '🎨' },
  { name: 'Prisma', purpose: 'Database ORM', icon: '🔧' }
];

const stats = [
  { label: 'Open Source', value: '100%', description: 'Fully transparent codebase' },
  { label: 'Self-Hostable', value: 'Yes', description: 'Complete data ownership' },
  { label: 'Docker Ready', value: 'Ready', description: 'One-command deployment' }
];

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth() as AuthContextValue;

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" />
      </div>
      
      {/* Navigation Header */}
      <header className="glass-effect border-b border-white/20 sticky top-0 z-50 animate-slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 group">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 rounded-2xl text-white font-bold text-lg shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105 animate-pulse-glow">
                HT
              </div>
              <div className="group-hover:translate-x-1 transition-transform duration-300">
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">HT Connect</h1>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">R&D Labs Internal Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 group relative overflow-hidden"
              >
                <span className="relative z-10">Sign In</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-12 animate-slide-up">
            <div className="space-y-8">
              <div className="inline-flex items-center px-6 py-3 glass-effect border border-white/30 text-blue-800 rounded-full text-sm font-semibold animate-scale-in hover:scale-105 transition-transform duration-300 cursor-default">
                <span className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-3 animate-pulse"></span>
                100% Open Source • Self-Hosted • Secure
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-tight animate-slide-in-left">
                The Complete
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 animate-pulse-glow"> Internal Portal</span>
                <span className="block text-4xl lg:text-5xl mt-2 animate-slide-in-right">for R&D Teams</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-slate-700 max-w-4xl mx-auto leading-relaxed font-medium animate-slide-up" style={{ animationDelay: '0.3s' }}>
                HT Connect combines powerful <span className="text-blue-600 font-semibold">HR management</span> with agile <span className="text-cyan-600 font-semibold">work tracking</span> in a single, 
                self-hosted platform built entirely with <span className="text-indigo-600 font-semibold">open-source technologies</span>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-scale-in" style={{ animationDelay: '0.6s' }}>
              <button
                onClick={() => navigate('/login')}
                className="group bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 hover:from-blue-700 hover:via-cyan-600 hover:to-indigo-700 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 shadow-2xl hover:shadow-3xl shadow-blue-500/25 hover:shadow-blue-500/40 relative overflow-hidden animate-pulse-glow"
              >
                <span className="relative z-10 flex items-center">
                  Get Started
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              
              <button className="group glass-effect border border-white/30 hover:border-blue-400/50 text-slate-700 hover:text-blue-700 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 shadow-lg hover:shadow-xl relative overflow-hidden">
                <span className="relative z-10 flex items-center">
                  <svg className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View Demo
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 animate-slide-up" style={{ animationDelay: '0.9s' }}>
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="group glass-effect rounded-3xl p-8 border border-white/30 hover:border-blue-400/50 transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-default relative overflow-hidden"
                  style={{ animationDelay: `${1.1 + index * 0.2}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 text-center">
                    <div className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                      {stat.value}
                    </div>
                    <div className="text-lg font-bold text-slate-700 mb-2 group-hover:text-slate-800 transition-colors duration-300">
                      {stat.label}
                    </div>
                    <div className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                      {stat.description}
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-white/80 to-cyan-50/50 backdrop-blur-sm" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-20 animate-slide-up">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
              Two Powerful Modules,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">One Platform</span>
            </h2>
            <p className="text-xl lg:text-2xl text-slate-700 max-w-4xl mx-auto font-medium">
              Everything your R&D team needs to manage people and projects efficiently
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group glass-effect rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/30 hover:border-blue-400/50 hover:scale-105 hover:-translate-y-4 relative overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Floating icon background */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative z-10">
                  <div className="text-6xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">{feature.icon}</div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-slate-700 mb-8 leading-relaxed font-medium group-hover:text-slate-800 transition-colors duration-300">{feature.description}</p>
                  
                  <ul className="space-y-3">
                    {feature.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center text-sm font-medium text-slate-700 group-hover:text-slate-800 transition-colors duration-300">
                        <div className="w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Built with Modern Open Source Stack
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every component is carefully selected for performance, security, and maintainability
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {techStack.map((tech, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 hover:bg-white/80 transition-colors duration-200">
                <div className="text-3xl mb-3">{tech.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">{tech.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{tech.purpose}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deployment Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Deploy in Minutes with Docker
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                Get your complete HR and work management platform running with a single command. 
                Full control over your data with self-hosted deployment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  Start Now
                </button>
                <button className="border border-white/30 hover:border-white/50 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
                  View Documentation
                </button>
              </div>
            </div>
            <div className="bg-black/20 rounded-xl p-6 backdrop-blur-sm">
              <div className="text-sm text-blue-100 mb-2">Deploy with Docker Compose:</div>
              <code className="text-green-300 block font-mono text-sm">
                $ git clone https://github.com/Hemakotibonthada/HT_HRMS.git<br />
                $ cd HT_HRMS<br />
                $ docker compose up --build<br />
                <span className="text-yellow-300"># Access at http://localhost:8080</span>
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-bold text-lg">
                  HT
                </div>
                <div>
                  <h3 className="text-xl font-bold">HT Connect</h3>
                  <p className="text-sm text-gray-400">R&D Labs Internal Portal</p>
                </div>
              </div>
              <p className="text-gray-400 max-w-md">
                Open-source internal portal combining HR management and work tracking 
                for modern R&D teams. Self-hosted, secure, and fully customizable.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Employee Portal</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Work Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GitHub Repository</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Docker Hub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} HT R&D Labs. Open source under MIT License.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
