import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react'; // Memanggil ikon tempat sampah
import Swal from 'sweetalert2';
import API from '../services/api';
import '../styles/Catalog.css';

const Keranjang = ({ keranjang, setKeranjang, isLoggedIn }) => {
  const [barangDipilih, setBarangDipilih] = useState([]);
  const [orderNote, setOrderNote] = useState('');
  const navigate = useNavigate();

  // Memilih semua barang secara otomatis saat pertama kali dimuat
  useEffect(() => {
    setBarangDipilih(keranjang.map(item => item.id));
  }, [keranjang]);

  const aturPilihSemua = (e) => {
    if (e.target.checked) {
      setBarangDipilih(keranjang.map(item => item.id));
    } else {
      setBarangDipilih([]);
    }
  };

  const aturPilihBarang = (id) => {
    if (barangDipilih.includes(id)) {
      setBarangDipilih(barangDipilih.filter(itemId => itemId !== id));
    } else {
      setBarangDipilih([...barangDipilih, id]);
    }
  };

  const ubahJumlah = (id, angka) => {
    setKeranjang(keranjang.map(item => {
      if (item.id === id) {
        const jumlahBaru = item.jumlah + angka;
        return { ...item, jumlah: jumlahBaru > 0 ? jumlahBaru : 1 };
      }
      return item;
    }));
  };

  const ubahCatatan = (id, teks) => {
    setKeranjang(keranjang.map(item => 
      item.id === id ? { ...item, catatan: teks } : item
    ));
  };

  const hapusBarangTerpilih = () => {
    setKeranjang(keranjang.filter(item => !barangDipilih.includes(item.id)));
    setBarangDipilih([]);
  };

  // Fungsi baru untuk menghapus satu produk secara individu
  const hapusSatuBarang = (id) => {
    setKeranjang(keranjang.filter(item => item.id !== id));
    setBarangDipilih(barangDipilih.filter(itemId => itemId !== id));
  };

  const itemTerpilih = keranjang.filter(item => barangDipilih.includes(item.id));
  const totalJumlahBarang = itemTerpilih.reduce((total, item) => total + item.jumlah, 0);
  const totalHargaBelanja = itemTerpilih.reduce((total, item) => {
    const hargaAngka = parseInt(String(item.harga).replace(/[^0-9]/g, ''));
    return total + (hargaAngka * item.jumlah);
  }, 0);

  const handleCheckoutAction = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (itemTerpilih.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Pilih barang terlebih dahulu' });
      return;
    }

    try {
      const payload = {
        items: itemTerpilih.map((item) => ({
          productId: item.id,
          name: item.nama,
          price: parseInt(String(item.harga).replace(/[^0-9]/g, '')) || 0,
          quantity: item.jumlah,
          note: item.catatan || ''
        })),
        note: orderNote || ''
      };

      await API.post('/orders', payload);

      setKeranjang([]);
      setBarangDipilih([]);
      setOrderNote('');

      Swal.fire({
        icon: 'success',
        title: 'Pesanan Dikonfirmasi',
        text: 'Pesanan Ditambahkan pada Keranjang.',
        toast: true,
        position: 'center',
        timer: 1500,
        showConfirmButton: false
      });

      navigate('/');
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal konfirmasi pesanan',
        text: error.response?.data?.message || 'Silakan coba lagi.'
      });
    }
  };

  return (
    <div className="katalog-wrapper">
      <div className="katalog-overlay"></div>
      
      <div className="katalog-content" style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* Kolom Kiri: Daftar Keranjang */}
        <div style={{ flex: '2', background: 'white', borderRadius: '8px', border: '2px solid #38bdf8', overflow: 'hidden' }}>
          <div style={{ padding: '15px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                checked={barangDipilih.length === keranjang.length && keranjang.length > 0}
                onChange={aturPilihSemua}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#3b82f6' }}
              />
              <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Pilih Semua</span>
            </div>
            <span 
              onClick={hapusBarangTerpilih} 
              style={{ color: '#ef4444', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Hapus Terpilih
            </span>
          </div>

          <div style={{ padding: '0 20px' }}>
            {keranjang.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#9ca3af' }}>Keranjang belanja Anda masih kosong.</div>
            ) : (
              keranjang.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', padding: '20px 0', borderBottom: '1px solid #eee', gap: '15px' }}>
                  <input 
                    type="checkbox" 
                    checked={barangDipilih.includes(item.id)}
                    onChange={() => aturPilihBarang(item.id)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#3b82f6', marginTop: '30px' }}
                  />
                  <img src={item.img} alt={item.nama} style={{ width: '85px', height: '85px', borderRadius: '8px', objectFit: 'cover' }} />
                  
                  <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#111', fontWeight: 'bold' }}>{item.nama}</h4>
                        <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#9ca3af' }}>{item.harga}</p>
                      </div>
                      
                      {/* Kontrol Jumlah & Tombol Hapus Individu */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden', height: '32px' }}>
                          <button onClick={() => ubahJumlah(item.id, -1)} style={{ width: '32px', background: 'white', border: 'none', borderRight: '1px solid #e5e7eb', cursor: 'pointer', fontSize: '16px', color: '#374151', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>-</button>
                          <span style={{ width: '40px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold', color: '#111' }}>{item.jumlah}</span>
                          <button onClick={() => ubahJumlah(item.id, 1)} style={{ width: '32px', background: 'white', border: 'none', borderLeft: '1px solid #e5e7eb', cursor: 'pointer', fontSize: '16px', color: '#374151', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>+</button>
                        </div>
                        
                        {/* Ikon Tempat Sampah (Hapus Item) */}
                        <button 
                          onClick={() => hapusSatuBarang(item.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }}
                          title="Hapus produk ini"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Kolom Catatan Abu-abu */}
                    <input 
                      type="text" 
                      placeholder="Catatan" 
                      value={item.catatan || ''}
                      onChange={(e) => ubahCatatan(item.id, e.target.value)}
                      style={{ width: '100%', maxWidth: '350px', padding: '8px 12px', background: '#e5e7eb', border: 'none', borderRadius: '6px', fontSize: '12px', color: '#4b5563', outline: 'none' }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom Kanan: Ringkasan Belanja */}
        <div style={{ flex: '1', maxWidth: '350px', background: 'white', borderRadius: '8px', padding: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', color: '#111', fontWeight: 'bold' }}>Ringkasan Belanja</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#6b7280', fontSize: '13px' }}>
            <span>Total Harga ({totalJumlahBarang} Barang)</span>
            <span>Rp {totalHargaBelanja.toLocaleString('id-ID')}</span>
          </div>
          
          <div style={{ width: '100%', height: '1px', background: '#f3f4f6', margin: '15px 0' }}></div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>Catatan Pesanan (opsional)</label>
            <textarea
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="Masukkan catatan untuk pesanan ini..."
              style={{ width: '100%', minHeight: '100px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', color: '#111', fontSize: '15px', fontWeight: 'bold' }}>
            <span>Total Belanja</span>
            <span>Rp {totalHargaBelanja.toLocaleString('id-ID')}</span>
          </div>

          <button 
            onClick={handleCheckoutAction} 
            disabled={itemTerpilih.length === 0}
            className={itemTerpilih.length === 0 ? '' : 'btn-primary'}
            style={{ width: '100%', padding: '14px', background: itemTerpilih.length === 0 ? '#d1d5db' : undefined, color: itemTerpilih.length === 0 ? 'white' : undefined, borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: itemTerpilih.length === 0 ? 'not-allowed' : 'pointer' }}
          >
            {isLoggedIn ? "Konfirmasi Pesanan" : "Login untuk Checkout"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Keranjang;