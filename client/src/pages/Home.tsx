import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Shield, Lock, UserCheck, Key, ShieldCheck, ArrowRight, Github } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">SecureAuth</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-slate-400 hidden sm:inline">Logged in as <span className="text-white font-medium">{user?.name || user?.email}</span></span>
                { (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                  <Button variant="outline" onClick={() => navigate("/admin")} className="border-slate-700 hover:bg-slate-800">Admin</Button>
                )}
                <Button variant="destructive" onClick={logout} className="bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800/50">Logout</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/login")} className="hover:bg-slate-800">Sign In</Button>
                <Button onClick={() => navigate("/register")} className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <section className="relative py-24 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08),transparent_70%)] pointer-events-none" />
          <div className="max-w-7xl mx-auto text-center relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <ShieldCheck className="w-4 h-4" />
              <span>Production-Ready JWT Microservice</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
              Secure Authentication <br />Made Simple
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              A robust, enterprise-grade authentication microservice with JWT rotation, RBAC, and advanced security protections built-in.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={() => navigate("/register")} size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-lg group">
                Start Building
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 border-slate-700 hover:bg-slate-800 text-lg">
                <Github className="mr-2 w-5 h-5" />
                View on GitHub
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-6 bg-slate-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 transition-colors">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                  <Lock className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">JWT Security</h3>
                <p className="text-slate-400 leading-relaxed">
                  Industry-standard JWT implementation with access and refresh token rotation for maximum security.
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 transition-colors">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6">
                  <UserCheck className="w-6 h-6 text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">RBAC Control</h3>
                <p className="text-slate-400 leading-relaxed">
                  Fine-grained Role-Based Access Control to manage user permissions and protect sensitive endpoints.
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 transition-colors">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
                  <Key className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Brute Protection</h3>
                <p className="text-slate-400 leading-relaxed">
                  Built-in rate limiting and brute-force protection to keep your user accounts safe from automated attacks.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Shield className="w-5 h-5" />
            <span className="font-bold">SecureAuth</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 SecureAuth Microservice. All rights reserved.
          </p>
          <div className="flex gap-6 text-slate-500 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
