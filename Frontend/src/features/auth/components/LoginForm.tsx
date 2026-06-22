import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { handleLogin, error, isLoading } = useLogin();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  return (
    <form className="auth-form" onSubmit={onSubmit} noValidate>
      <h1 className="auth-title">Sign In</h1>
      <p className="auth-subtitle">Welcome back to iClinic</p>

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          autoFocus
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
      </div>

      <button type="submit" className="auth-btn" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </button>

      <p className="auth-footer">
        Don't have an account? <Link to="/register">Sign up</Link>
      </p>
    </form>
  );
}
