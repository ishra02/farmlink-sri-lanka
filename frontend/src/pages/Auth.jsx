
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';

function Auth() {
  const location = useLocation();
  const navigate = useNavigate();

  const isRegister = location.pathname === '/register';

  const [role, setRole] = useState(
    new URLSearchParams(location.search).get('role') || 'customer'
  );

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    const userData = isRegister
      ? { fullName, email, password, role }
      : { email, password };

    try {
      const response = await fetch(
  `http://localhost:8080/api/auth/${isRegister ? 'register' : 'login'}`,
  {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  }
);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong.');
      }

      if (isRegister) {
        setMessage('Account created successfully! Please login.');
        setTimeout(() => navigate('/login'), 1000);
      } else {
        localStorage.setItem('farmlinkUser', JSON.stringify(data));
        window.dispatchEvent(new Event('farmlink-auth-change'));
        alert(`Welcome to FarmLink, ${data.fullName}!`);
        navigate('/');
      }
    } catch (error) {
      setMessage(error.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <span className="brand-symbol">🌿</span>
        <span className="section-kicker">FARMLINK SRI LANKA</span>

        <h1>{isRegister ? 'Create Your Account' : 'Welcome Back'}</h1>

        <p>
          {isRegister
            ? 'Join our growing farm community.'
            : 'Login to your FarmLink account.'}
        </p>

        {isRegister && (
          <div className="auth-role">
            <label htmlFor="role">I want to join as</label>
            <select
              id="role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="customer">Customer</option>
              <option value="farmer">Farmer</option>
            </select>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <label>
              Full Name
              <input
                type="text"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter your full name"
              />
            </label>
          )}

          <label>
            Email Address
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
          </label>

          {message && <p role="alert">{message}</p>}

          <button
            type="submit"
            className="signup-button auth-submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isRegister
                ? 'Create Account'
                : 'Login'}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? 'Already registered?' : 'New to FarmLink?'}{' '}
          <Link to={isRegister ? '/login' : '/register'}>
            {isRegister ? 'Login' : 'Create an account'}
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Auth;

