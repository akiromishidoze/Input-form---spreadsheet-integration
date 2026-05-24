import { useState, FormEvent } from 'react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<void>;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError('Enter username and password'); return; }
    setBusy(true);
    setError('');
    try {
      await onLogin(username, password);
    } catch {
      setError('Invalid credentials');
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-box" onSubmit={handleSubmit}>
        <h1>Dashboard Login</h1>
        <div className="form-group">
          <label htmlFor="login-user">Username</label>
          <input id="login-user" type="text" value={username} onChange={e => setUsername(e.target.value)} autoFocus />
        </div>
        <div className="form-group">
          <label htmlFor="login-pass">Password</label>
          <input id="login-pass" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        {error && <p className="field-error">{error}</p>}
        <button type="submit" disabled={busy} style={{ width: '100%' }}>{busy ? 'Logging in...' : 'Login'}</button>
      </form>
    </div>
  );
}
