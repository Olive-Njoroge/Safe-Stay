import { useState } from 'react';

// Mock functions - replace with your actual API calls
const loginUser = async (userData) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { 
    data: { 
      user: { 
        role: userData.email.includes('landlord') ? 'Landlord' : 'Tenant',
        name: 'John Doe',
        email: userData.email 
      }, 
      token: 'mock-token-123' 
    } 
  };
};

const registerUser = async (userData) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { 
    data: { 
      user: { 
        role: userData.role,
        name: userData.name,
        email: userData.email 
      }, 
      token: 'mock-token-123' 
    } 
  };
};

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const payload = { ...formData };

      // Remove fields not needed during login
      if (isLogin) {
        delete payload.name;
        delete payload.role;
        delete payload.nationalID;
        delete payload.primaryPhoneNumber;
        delete payload.secondaryPhoneNumber;
        delete payload.buildingName;
        delete payload.dateMovedIn;
      }

      const res = isLogin ? await loginUser(payload) : await registerUser(payload);

      const { user, token } = res.data;
      
      // Store user data (in a real app, you'd use localStorage)
      console.log('User logged in:', { ...user, token });
      
      // Navigate based on role
      if (user.role === 'Tenant') {
        console.log('Navigating to tenant dashboard');
      } else if (user.role === 'Landlord') {
        console.log('Navigating to landlord dashboard');
      }
      
      alert(`${isLogin ? 'Login' : 'Registration'} successful!`);
    } catch (error) {
      console.error('Auth failed:', error.response?.data?.message || error.message);
      alert(error.response?.data?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
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
        {showPassword ? '👁️' : '🙈'}
      </button>
    </div>
  );

  const getRoleColor = (role) => {
    return role === 'Tenant' ? 'from-blue-600 to-purple-600' : 'from-green-600 to-teal-600';
  };

  const getRoleIcon = (role) => {
    return role === 'Tenant' ? '👤' : '🏢';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${getRoleColor(formData.role)} mb-4`}>
            <span className="text-white text-2xl">{getRoleIcon(formData.role)}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to your account' : 'Join our property management platform'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow-xl rounded-2xl p-8 space-y-6">
          {/* Role Selection (Registration only) */}
          {!isLogin && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {['Tenant', 'Landlord'].map((role) => {
                  const icon = getRoleIcon(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role }))}
                      className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.role === role
                          ? `border-${role === 'Tenant' ? 'blue' : 'green'}-500 bg-${role === 'Tenant' ? 'blue' : 'green'}-50`
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <span className={`text-xl mr-2 ${formData.role === role ? (role === 'Tenant' ? 'text-blue-600' : 'text-green-600') : 'text-gray-600'}`}>
                        {icon}
                      </span>
                      <span className={`font-medium ${formData.role === role ? (role === 'Tenant' ? 'text-blue-600' : 'text-green-600') : 'text-gray-600'}`}>
                        {role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Registration Fields */}
          {!isLogin && (
            <div className="space-y-4 ">
              <InputField
                icon="👤"
                type="text"
                name="name"
                placeholder="Full Name"
                required
                value={formData.name}
              />
              
              <InputField
                icon="🆔"
                type="text"
                name="nationalID"
                placeholder="National ID"
                required
                value={formData.nationalID}
              />
              
              <InputField
                icon="📱"
                type="tel"
                name="primaryPhoneNumber"
                placeholder="Primary Phone Number"
                required
                value={formData.primaryPhoneNumber}
              />
              
              <InputField
                icon="📞"
                type="tel"
                name="secondaryPhoneNumber"
                placeholder="Secondary Phone Number (optional)"
                value={formData.secondaryPhoneNumber}
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
                />
              )}
            </div>
          )}

          {/* Email and Password */}
          <div className="space-y-4">
            <InputField
              icon="📧"
              type="email"
              name="email"
              placeholder="Email Address"
              required
              value={formData.email}
              autoComplete={isLogin ? 'username' : 'email'}
            />
            
            <PasswordField
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gradient-to-r ${getRoleColor(formData.role)} ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span className="text-lg mr-2">✓</span>
                {isLogin ? 'Sign In' : 'Create Account'}
              </div>
            )}
          </button>

          {/* Toggle Mode */}
          <div className="text-center pt-4">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              >
                {isLogin ? 'Sign up here' : 'Sign in here'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Secure property management platform</p>
        </div>
      </div>
    </div>
  );
}