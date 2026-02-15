import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from "firebase/auth";
import Dashboard from './pages/Dashboard';
import PurchaseList from './pages/PurchaseList';
import React, { useState, useEffect } from 'react';


function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>

      {/* Sadece giriş yapmış kullanıcılar Navbar'ı görsün */}
      {user && (
        <nav style={navStyle}>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', alignItems: 'center', width: '100%' }}>
            <div style={logoStyle}>DMS Panel</div>
            <button onClick={() => auth.signOut()} style={logoutButtonStyle}>Çıkış Yap</button>
          </div>

          <div>

           <div style={linkGroupStyle}>
              <Link to="/" style={linkStyle}>📦 Depo Paneli</Link>
              <Link to="/toptanci" style={linkStyle}>🛒 Eksik Listesi</Link>
            
            </div>

          </div>


          
         


        </nav>
      )}



      <Routes>
        {/* Giriş yapıldıysa Dashboard'a, yapılmadıysa Login ekranına (Dashboard içindeki login) */}
        <Route path="/" element={<Dashboard user={user} />} />
        <Route path="/toptanci" element={user ? <PurchaseList user={user} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

const navStyle = { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#0f0f0f', borderBottom: '1px solid #333', marginBottom: '20px' };
const logoStyle = { fontSize: '1.0rem', fontWeight: 'bold', color: '#ffffff', margin: '0 0 0 30px' };
const linkGroupStyle = { display: 'flex', gap: '30px', alignItems: 'center' };
const linkStyle = { color: '#fff', textDecoration: 'none', fontWeight: '500', transition: '0.3s' };
const logoutButtonStyle = {margin: '0 30px 0 0' , padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' };

export default App;