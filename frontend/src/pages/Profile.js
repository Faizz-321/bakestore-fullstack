import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import API from '../services/api';
import '../styles/Catalog.css';

const Profile = ({ user, setUser, setIsLoggedIn, setUserRole }) => {
  const navigate = useNavigate();
  const storedUser = user || JSON.parse(localStorage.getItem('campbread_user') || 'null');
  const [userData, setUserData] = useState(storedUser || { name: '', email: '', role: '', profilePicture: '' });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileFile, setProfileFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Gagal memuat riwayat pesanan:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUserData(storedUser);
    fetchOrders();
  }, [storedUser, navigate, fetchOrders]);

  const formatCurrency = (value) => `Rp ${Number(value).toLocaleString('id-ID')}`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    localStorage.removeItem('campbread_token');
    localStorage.removeItem('campbread_role');
    localStorage.removeItem('campbread_user');
    setIsLoggedIn?.(false);
    setUserRole?.('');
    setUser?.(null);
    navigate('/login');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!userData.name.trim() || !userData.email.trim()) {
      Swal.fire({ icon: 'warning', title: 'Data tidak lengkap', text: 'Nama dan email harus diisi.' });
      return;
    }

    try {
      setSaving(true);
      
      const formData = new FormData();
      formData.append('name', userData.name.trim());
      formData.append('email', userData.email.trim());
      
      if (profileFile) {
        formData.append('profilePicture', profileFile);
      }

      const response = await API.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedUser = response.data;
      localStorage.setItem('campbread_user', JSON.stringify(updatedUser));
      setUser?.(updatedUser);
      setEditMode(false);

      Swal.fire({ icon: 'success', title: 'Profil diperbarui', text: 'Perubahan profil berhasil disimpan.' });
    } catch (error) {
      console.error('Gagal memperbarui profil:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal memperbarui',
        text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan profil.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (!storedUser) {
    return null;
  }

  return (
    <div className="katalog-wrapper">
      <div className="katalog-overlay"></div>
      <div className="katalog-content" style={{ display: 'block', width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gap: '28px' }}>
          <section className="glass-panel" style={{ borderRadius: '24px', padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fde68a', display: 'grid', placeItems: 'center', fontSize: '30px', color: '#92400e', fontWeight: '800', overflow: 'hidden', border: '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                  {storedUser.profilePicture ? (
                    <img src={`http://localhost:5000${storedUser.profilePicture}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    storedUser.name?.charAt(0).toUpperCase() || 'P'
                  )}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', letterSpacing: '0.02em' }}>Profil Pelanggan</p>
                  <h1 style={{ margin: '8px 0 0', fontSize: '28px', color: '#111827' }}>{storedUser.name}</h1>
                  <p style={{ margin: '8px 0 0', fontSize: '15px', color: '#4b5563' }}>{storedUser.email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setEditMode((prev) => !prev);
                    setProfileFile(null);
                    setPreviewUrl(null);
                  }}
                  style={{ padding: '12px 20px', borderRadius: '14px', border: '1px solid #d1d5db', background: editMode ? '#f8fafc' : '#fef3c7', color: '#92400e', cursor: 'pointer', fontWeight: '700', minWidth: '140px' }}
                >
                  {editMode ? 'Batal Edit' : 'Edit Profil'}
                </button>
                <button
                  onClick={handleLogout}
                  style={{ padding: '12px 20px', borderRadius: '14px', border: '1px solid #d1d5db', background: '#fef2f2', color: '#b91c1c', cursor: 'pointer', fontWeight: '700', minWidth: '140px' }}
                >
                  Logout
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '20px', marginTop: '32px' }}>
              <div style={{ background: '#f8fafc', borderRadius: '18px', padding: '22px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Role</p>
                <p style={{ margin: '12px 0 0', fontSize: '18px', fontWeight: '700', color: '#111827', textTransform: 'capitalize' }}>{storedUser.role}</p>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: '18px', padding: '22px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Pesanan</p>
                <p style={{ margin: '12px 0 0', fontSize: '18px', fontWeight: '700', color: '#111827' }}>{orders.length}</p>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: '18px', padding: '22px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email Aktif</p>
                <p style={{ margin: '12px 0 0', fontSize: '18px', fontWeight: '700', color: '#111827' }}>{storedUser.email}</p>
              </div>
            </div>

            {editMode && (
              <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: '18px', marginTop: '30px' }}>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <label style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>Foto Profil (Opsional)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#f3f4f6', overflow: 'hidden', border: '2px dashed #d1d5db', display: 'grid', placeItems: 'center' }}>
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (storedUser.profilePicture ? (
                        <img src={`http://localhost:5000${storedUser.profilePicture}`} alt="Current Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '20px', color: '#9ca3af' }}>📷</span>
                      ))}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setProfileFile(file);
                          setPreviewUrl(URL.createObjectURL(file));
                        }
                      }}
                      style={{ fontSize: '13px', color: '#4b5563', padding: '8px', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <label style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>Nama lengkap</label>
                  <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '14px 16px', border: '1px solid #d1d5db', borderRadius: '14px', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <label style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '14px 16px', border: '1px solid #d1d5db', borderRadius: '14px', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ width: 'fit-content', padding: '14px 22px', background: '#b45309', color: 'white', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </form>
            )}
          </section>

          <section className="glass-panel" style={{ borderRadius: '24px', padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <div>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', letterSpacing: '0.04em' }}>Riwayat Pesanan</p>
                <h2 style={{ margin: '8px 0 0', fontSize: '26px', color: '#111827' }}>Pesanan Anda</h2>
              </div>
              <span style={{ padding: '10px 16px', borderRadius: '999px', background: '#f3f4f6', color: '#374151', fontSize: '13px' }}>{orders.length} pesanan</span>
            </div>

            {loading ? (
              <p style={{ color: '#6b7280' }}>Memuat riwayat pesanan...</p>
            ) : orders.length === 0 ? (
              <p style={{ color: '#6b7280' }}>Belum ada pesanan. Ayo mulai berbelanja!</p>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {orders.map((order) => (
                  <div key={order.id} style={{ border: '1px solid #e5e7eb', borderRadius: '20px', overflow: 'hidden', background: '#fcfcfd' }}>
                    <div style={{ background: '#f8fafc', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>Pesanan #{order.id}</div>
                        <div style={{ marginTop: '6px', fontSize: '13px', color: '#6b7280' }}>{new Date(order.createdAt).toLocaleString('id-ID')}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <span className={`order-status status-${order.status}`}>
                          {order.status}
                        </span>
                        <span style={{ padding: '8px 14px', borderRadius: '999px', background: '#f3f4f6', color: '#374151', fontSize: '13px' }}>{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </div>
                    <div style={{ padding: '22px 24px' }}>
                      {order.items.map((item) => (
                        <div key={item.id} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                            <span style={{ fontWeight: '700', color: '#111827' }}>{item.productName}</span>
                            <span style={{ color: '#6b7280', fontSize: '13px' }}>Qty {item.quantity}</span>
                          </div>
                          <div style={{ fontSize: '14px', color: '#4b5563' }}>
                            Harga: {formatCurrency(item.price)}
                            {item.note ? <span style={{ display: 'block', marginTop: '8px', color: '#374151' }}>Catatan: {item.note}</span> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
