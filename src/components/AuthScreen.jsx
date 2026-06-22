import { useState } from 'react';
import { signUp, logIn, resetPassword } from '../lib/auth';

const ERR = {
  'auth/email-already-in-use':    'An account with this email already exists.',
  'auth/invalid-email':           'Please enter a valid email address.',
  'auth/weak-password':           'Password must be at least 6 characters.',
  'auth/user-not-found':          'No account found with this email.',
  'auth/wrong-password':          'Incorrect password.',
  'auth/invalid-credential':      'Incorrect email or password.',
  'auth/too-many-requests':       'Too many attempts — please try again later.',
};

export default function AuthScreen() {
  const [mode,     setMode]     = useState('login'); // 'login' | 'signup' | 'reset'
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [resetSent,setResetSent]= useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (mode === 'reset') {
      setLoading(true);
      try {
        await resetPassword(email);
        setResetSent(true);
      } catch (err) {
        setError(ERR[err.code] || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'signup' && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') await signUp(email, password);
      else                   await logIn(email, password);
    } catch (err) {
      setError(ERR[err.code] || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = 'w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-100 placeholder-gray-600 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500';

  return (
    <div className="min-h-screen overflow-y-auto bg-gray-950 px-5" style={{minHeight:'100dvh'}}>
      <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center py-12" style={{minHeight:'100dvh'}}>

        {/* Logo */}
        <div className="mb-8 flex items-center gap-2.5">
          <span className="text-2xl font-bold tracking-tight text-white">PT Ops</span>
          <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">Pro</span>
        </div>

        {mode === 'reset' ? (
          <>
            <h1 className="mb-1 text-xl font-bold text-white">Reset password</h1>
            <p className="mb-6 text-sm text-gray-500">We'll send a reset link to your email.</p>

            {resetSent ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
                Reset email sent — check your inbox.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" required className={inputClass} />
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50">
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            )}

            <button onClick={() => { setMode('login'); setError(''); setResetSent(false); }}
              className="mt-5 text-sm text-gray-500 hover:text-gray-300 transition">
              ← Back to log in
            </button>
          </>
        ) : (
          <>
            <h1 className="mb-1 text-xl font-bold text-white">
              {mode === 'signup' ? 'Create your account' : 'Log in'}
            </h1>
            <p className="mb-6 text-sm text-gray-500">
              {mode === 'signup' ? 'One account per trainer.' : 'Welcome back.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" required className={inputClass} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Password" required minLength={6} className={inputClass} />
              {mode === 'signup' && (
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Confirm password" required className={inputClass} />
              )}

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50">
                {loading ? '…' : mode === 'signup' ? 'Create account' : 'Log in'}
              </button>
            </form>

            <div className="mt-5 flex flex-col gap-2 text-center text-sm">
              {mode === 'login' && (
                <button onClick={() => { setMode('reset'); setError(''); }}
                  className="text-gray-600 hover:text-gray-400 transition">
                  Forgot password?
                </button>
              )}
              <button onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); }}
                className="text-indigo-400 hover:text-indigo-300 transition font-medium">
                {mode === 'signup' ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
