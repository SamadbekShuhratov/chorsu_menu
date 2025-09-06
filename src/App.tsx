import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';

import CustomerMenu from './components/CustomerMenu';
import AdminPanel from './components/admin/AdminPanel';
import LoginForm from './components/admin/LoginForm';

import { MenuItem } from './types/menu';
import  ApiService  from './services/apiService'; // 🔁 Eslatma: default emas, named export

function App() {
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchMenuItems = async () => {
    try {
      const data = await ApiService.getMenuItems();
      setMenuItems(data);
    } catch (error) {
      console.error("Failed to fetch menu items", error);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleLogin = (token: string, user: any) => {
    setAuthToken(token);
    setCurrentUser(user);
    setIsAuthenticated(true);
    navigate('/admin');
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <CustomerMenu menuItems={menuItems} />
              <button
                onClick={() => navigate('/login')}
                className="fixed bottom-6 right-6 bg-gray-800 hover:bg-gray-900 text-white p-3 rounded-full shadow-lg transition-colors z-50"
                title="Admin Access"
              >
                <Settings className="w-6 h-6" />
              </button>
            </>
          }
        />

        <Route
          path="/login"
          element={<LoginForm onLogin={handleLogin} />}
        />

        <Route
          path="/admin"
          element={
            isAuthenticated ? (
              <AdminPanel onLogout={handleLogout} />
            ) : (
              <LoginForm onLogin={handleLogin} />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
// import React from 'react';
// import ImageUploadTest from './components/ImageUploadTest';

// function App() {
//   return (
//     <div className="App">
//       <ImageUploadTest />
//     </div>
//   );
// }

// export default App;
