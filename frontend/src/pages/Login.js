import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import API from '../services/api';
import '../styles/Catalog.css';

const Login = ({ setIsLoggedIn, setUserRole, setUser }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('campbread_token', token);
      localStorage.setItem('campbread_role', user.role);
      localStorage.setItem('campbread_user', JSON.stringify(user));
      setIsLoggedIn(true);
      setUserRole(user.role);
      setUser(user);

      Swal.fire({
        icon: 'success',
        title: 'Login berhasil',
        text: `Selamat datang, ${user.name}`,
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Login gagal',
        text: error.response?.data?.message || 'Periksa email dan password Anda.',
        toast: true,
        position: 'top-end'
      });
    }
  };

  return (
    <div className="katalog-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="katalog-overlay"></div>

      <div className="glass-panel" style={{ position: 'relative', zIndex: 10, padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '420px', border: '1px solid rgba(255,255,255,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '30px' }}>
          <ArrowLeft
            size={24}
            style={{ position: 'absolute', left: 0, cursor: 'pointer', color: '#1f2937', transition: 'transform 0.2s' }}
            onMouseEnter={(e) => e.target.style.transform = 'translateX(-3px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateX(0)'}
            onClick={() => navigate(-1)}
          />
          <div style={{ background: 'linear-gradient(135deg, #fed7aa 0%, #ffedd5 100%)', color: '#c2410c', padding: '8px 16px', fontWeight: '800', borderRadius: '12px', fontSize: '15px', boxShadow: '0 4px 10px rgba(194, 65, 12, 0.1)' }}>
            CampBread
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', color: '#111' }}>Masuk ke Akun</h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Silakan masuk untuk melanjutkan</p>
        </div>

        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Email</label>
            <input
              type="email"
              placeholder="Masukkan email Anda"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="search-input"
              style={{ boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Kata Sandi</label>
            <input
              type="password"
              placeholder="********"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="search-input"
              style={{ boxSizing: 'border-box' }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
            Masuk Sekarang
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
          <span style={{ padding: '0 10px', fontSize: '12px', color: '#9ca3af' }}>atau</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button type="button" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', color: '#374151', border: '2px solid rgba(209, 213, 219, 0.5)' }}>
            <span style={{ color: '#ea4335', fontWeight: '900', fontSize: '18px' }}>G</span> Masuk dengan Google
          </button>
        </div>

        <div style={{ marginTop: '18px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
          Belum punya akun?{' '}
          <button type="button" onClick={() => navigate('/register')} style={{ color: '#b45309', fontWeight: '700', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
            Daftar di sini
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;