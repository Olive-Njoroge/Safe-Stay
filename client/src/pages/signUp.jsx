import { useState } from 'react';
import { registerUser } from '../services/api';

export default function SignUp({ onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Tenant',
    nationalID: '',
    primaryPhoneNumber: '',
    secondaryPhoneNumber: '',
    buildingName: '',
    dateMovedIn: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await registerUser(formData);
      const userData = { ...data.user, token: data.token };
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', data.token);
      onRegisterSuccess(userData);
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    return role === 'Tenant' ? 'from-blue-600 to-purple-600' : 'from-green-600 to-teal-600';
  };

  const getRoleIcon = (role) => {
    return role === 'Tenant' ? '👤' : '🏢';
  };

  const InputField = ({ icon, type, name, placeholder, required, value, autoComplete }) => (
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
        onChange={handleChange}
        required={required}
        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
      />
    </div>
  );

  const PasswordField = ({ name, placeholder, required, value, autoComplete }) => (
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
        onChange={handleChange}
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
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${getRoleColor(formData.role)} mb-4`}>
            <span className="text-white text-2xl">{getRoleIcon(formData.role)}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join our property management platform</p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="bg-white shadow-xl rounded-2xl p-8 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-red-500 text-lg mr-2">⚠</span>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              {['Tenant', 'Landlord'].map((role) => {
                const icon = getRoleIcon(role);
                const isSelected = formData.role === role;
                const colorClass = role === 'Tenant' ? 'blue' : 'green';
                
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role }))}
                    className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? `border-${colorClass}-500 bg-${colorClass}-50`
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span className={`text-xl mr-2 ${
                      isSelected 
                        ? `text-${colorClass}-600` 
                        : 'text-gray-600'
                    }`}>
                      {icon}
                    </span>
                    <span className={`font-medium ${
                      isSelected 
                        ? `text-${colorClass}-600` 
                        : 'text-gray-600'
                    }`}>
                      {role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <InputField
              icon="👤"
              type="text"
              name="name"
              placeholder="Full Name"
              required
              value={formData.name}
              autoComplete="name"
            />
            
            <InputField
              icon="📧"
              type="email"
              name="email"
              placeholder="Email Address"
              required
              value={formData.email}
              autoComplete="email"
            />
            
            <PasswordField
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              autoComplete="new-password"
            />
            
            <InputField
              icon="🆔"
              type="text"
              name="nationalID"
              placeholder="National ID"
              required
              value={formData.nationalID}
              autoComplete="off"
            />
            
            <InputField
              icon="📱"
              type="tel"
              name="primaryPhoneNumber"
              placeholder="Primary Phone Number"
              required
              value={formData.primaryPhoneNumber}
              autoComplete="tel"
            />
            
            <InputField
              icon="📞"
              type="tel"
              name="secondaryPhoneNumber"
              placeholder="Secondary Phone Number (optional)"
              value={formData.secondaryPhoneNumber}
              autoComplete="tel"
            />

            {/* Role-specific fields */}
            {formData.role === 'Tenant' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Date Moved In</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-lg">📅</span>
                  </div>
                  <input
                    type="date"
                    name="dateMovedIn"
                    value={formData.dateMovedIn}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  />
                </div>
              </div>
            )}

            {formData.role === 'Landlord' && (
              <InputField
                icon="🏢"
                type="text"
                name="buildingName"
                placeholder="Building Name"
                value={formData.buildingName}
                autoComplete="organization"
              />
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gradient-to-r ${getRoleColor(formData.role)} ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Account...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span className="text-lg mr-2">✓</span>
                Create Account
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