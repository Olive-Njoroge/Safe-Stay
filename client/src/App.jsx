import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

function App() {
  const handleAuth = (user) => {
    console.log('User authenticated:', user);
    // Redirect or update state here
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={handleAuth} />} />
        <Route path="/signup" element={<SignUp onRegisterSuccess={handleAuth} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
