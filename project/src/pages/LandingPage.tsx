import { Link } from 'react-router-dom';
import { Trophy, Swords, Users, Zap, ChevronRight, Gamepad2 } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gaming-dark-900 overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-gaming-electric-500/10 via-transparent to-gaming-dark-900" />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gaming-electric-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 -right-20 w-96 h-96 bg-gaming-neon-blue/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          {/* Header */}
          <nav className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-gaming-electric-500 to-gaming-neon-blue rounded-xl flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <span className="font-gaming text-xl font-bold text-white">GameArena</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-400 hover:text-white transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary px-6 py-2.5"
              >
                Get Started
              </Link>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gaming-dark-700/50 border border-gaming-dark-500 mb-8">
              <Zap className="w-4 h-4 text-gaming-neon-blue" />
              <span className="text-sm text-gray-300">The Future of Competitive Gaming</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Challenge Players.
              <br />
              <span className="bg-gradient-to-r from-gaming-electric-500 via-gaming-neon-blue to-gaming-neon-purple bg-clip-text text-transparent">
                Win Credits.
              </span>
              <br />
              Climb Rankings.
            </h1>

            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              The ultimate competitive gaming platform. Challenge friends and rivals across all your favorite games,
              earn virtual credits, and prove your skills on the global leaderboard.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="btn btn-neon px-8 py-4 text-lg w-full sm:w-auto"
              >
                Start Competing Now
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                to="/leaderboard"
                className="btn btn-secondary px-8 py-4 text-lg w-full sm:w-auto"
              >
                View Leaderboard
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-20">
            {[
              { label: 'Active Players', value: '50K+' },
              { label: 'Challenges Today', value: '2.5K+' },
              { label: 'Games Supported', value: '50+' },
              { label: 'Credits Won', value: '1M+' },
            ].map((stat, i) => (
              <div key={i} className="stat-card text-center">
                <div className="text-3xl font-bold text-white font-gaming">{stat.value}</div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-24 bg-gaming-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to Compete
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              From casual matches to intense rivalries, GameArena has all the tools for competitive gaming.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Swords className="w-8 h-8" />}
              title="Challenge System"
              description="Challenge any player across multiple games and platforms. Set your stakes, rules, and schedule."
            />
            <FeatureCard
              icon={<Trophy className="w-8 h-8" />}
              title="Rankings & Leagues"
              description="Climb the global and game-specific leaderboards. Earn ranks from Bronze to Grandmaster."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Social Gaming"
              description="Add friends, track rivals, and build your gaming community. Never play alone again."
            />
          </div>
        </div>
      </div>

      {/* Games Showcase */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Your Favorite Games
            </h2>
            <p className="text-gray-400">Challenge across the most popular titles</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['Fortnite', 'EA FC 24', 'Call of Duty', 'Valorant', 'Rocket League', 'League of Legends'].map((game, i) => (
              <div
                key={game}
                className="card-glow aspect-square flex items-center justify-center text-center p-4 hover:scale-105 transition-transform cursor-pointer"
              >
                <div>
                  <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-gaming-electric-500 to-gaming-neon-blue flex items-center justify-center mb-3">
                    <Gamepad2 className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white">{game}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-gaming-electric-500/10 via-gaming-neon-blue/10 to-gaming-neon-purple/10" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Prove Your Skills?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join thousands of players competing for glory and credits.
          </p>
          <Link
            to="/register"
            className="btn btn-neon px-10 py-4 text-lg inline-flex"
          >
            Create Free Account
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gaming-dark-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-gaming-electric-500 to-gaming-neon-blue rounded-lg flex items-center justify-center">
                <Gamepad2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-gaming text-lg font-bold text-white">GameArena</span>
            </div>
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} GameArena. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="card-glow group">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gaming-electric-500 to-gaming-neon-blue flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
