import React, { useState } from 'react';
import { api, setToken } from '../api.js';
import { User, Lock, LogIn, UserPlus } from 'lucide-react';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('pass123');
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'register') await api.post('/auth/register', { email, password });
      const { data } = await api.post('/auth/login', { email, password });
      setToken(data.token);
      onLogin?.(data.token);
      alert(mode === 'register' ? 'Account created and logged in!' : 'Successfully logged in!');
    } catch (e) {
      alert('Auth failed: ' + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className=" flex items-center justify-center  px-4">
      <div className="w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 max-w-lg bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl rounded-3xl p-8 sm:p-10 animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-white/30 rounded-2xl shadow-inner">
            {mode === 'login' 
              ? <LogIn className="w-7 h-7 text-white" /> 
              : <UserPlus className="w-7 h-7 text-white" />}
          </div>
          <h2 className="text-3xl font-extrabold text-white drop-shadow-lg tracking-wide animate-pulse">
            {mode === 'login' ? 'Welcome Back!' : 'Join Us Today'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white/90">Email</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-11 pr-3 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-md transition"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-white/90">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-3 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-md transition"
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="flex-1 px-5 py-3 rounded-xl border border-white/40 text-white/90 font-medium hover:bg-white/20 shadow-md transition"
              disabled={loading}
            >
              {mode === 'login' ? 'Need an account?' : 'Already have one?'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
