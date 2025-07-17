import { useState } from 'react';
import { loginUser } from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await loginUser({ email, password });
      
      const userData = { ...data.user, token: data.token };
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', data.token);
      onLoginSuccess(userData);
    } catch (err) {
      console.error('Login failed:', err);
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ icon, type, name, placeholder, required, value, onChange, autoComplete }) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-gray-400 text-lg">{icon}</span>
      </div>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={onChange}
        required={required}
        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
      />
    </div>
  );

  const PasswordField = ({ name, placeholder, required, value, onChange, autoComplete }) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-gray-400 text-lg">🔒</span>
      </div>
      <input
        type={showPassword ? 'text' : 'password'}
        name={name}
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={onChange}
        required={required}
        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
      >
        {showPassword ? '👁' : '🙈'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            <span className="text-white text-2xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-white shadow-xl rounded-2xl p-8 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-red-500 text-lg mr-2">⚠</span>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Input Fields */}
          <div className="space-y-4">
            <InputField
              icon="📧"
              type="email"
              name="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
            
            <PasswordField
              name="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              Forgot your password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gradient-to-r from-blue-600 to-purple-600 ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing In...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span className="text-lg mr-2">🚀</span>
                Sign In
              </div>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Secure property management platform</p>
        </div>
      </div>
    </div>
  );
}