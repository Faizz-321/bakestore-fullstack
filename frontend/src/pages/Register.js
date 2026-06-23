import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import API from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Password dan konfirmasi password harus sama.',
        toast: true,
        position: 'top-end'
      });
      return;
    }

    try {
      await API.post('/auth/register', { name, email, password });

      Swal.fire({
        icon: 'success',
        title: 'Registrasi berhasil',
        text: 'Silakan masuk menggunakan email dan password Anda.',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

      navigate('/login');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Registrasi gagal',
        text: error.response?.data?.message || 'Terjadi kesalahan saat membuat akun.',
        toast: true,
        position: 'top-end'
      });
    }
  };

  return (
    <div className="katalog-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="katalog-overlay"></div>

      <div style={{ position: 'relative', zIndex: 10, background: 'white', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '420px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '25px' }}>
          <ArrowLeft
            size={24}
            style={{ position: 'absolute', left: 0, cursor: 'pointer', color: '#111' }}
            onClick={() => navigate(-1)}
          />
          <div style={{ background: '#fed7aa', color: '#c2410c', padding: '6px 12px', fontWeight: 'bold', borderRadius: '4px', fontSize: '14px' }}>
            CampBread
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', color: '#111' }}>Daftar Akun Baru</h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Buat akun pelanggan untuk memesan produk.</p>
        </div>

        <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Nama Lengkap</label>
            <input
              type="text"
              placeholder="Nama Anda"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '12px 15px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Email</label>
            <input
              type="email"
              placeholder="email@domain.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px 15px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Kata Sandi</label>
            <input
              type="password"
              placeholder="Minimal 6 karakter"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px 15px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Konfirmasi Kata Sandi</label>
            <input
              type="password"
              placeholder="Ketik ulang kata sandi"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '12px 15px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
            Daftar Sekarang
          </button>
        </form>

        <div style={{ marginTop: '18px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
          Sudah punya akun?{' '}
          <button type="button" onClick={() => navigate('/login')} style={{ color: '#b45309', fontWeight: '700', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
            Masuk di sini
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
