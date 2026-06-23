import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import API from '../services/api';
import '../styles/Catalog.css';

const DetailProduk = ({ tambahKeKeranjang }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jumlahBeli, setJumlahBeli] = useState(1);
  const [indeksGambar, setIndeksGambar] = useState(0);
  const [produk, setProduk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await API.get(`/products/${id}`);
        setProduk(response.data);
      } catch (error) {
        console.error('Gagal memuat produk:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const formatHarga = (price) => `Rp ${Number(price).toLocaleString('id-ID')}`;

  // Fungsi untuk membuat galeri dari database atau fallback ke gambar kategori
  const generateGaleri = (product) => {
    const mainImage = product.imageUrl;
    
    // Jika sudah ada imageGallery dari database, gunakan itu
    if (product.imageGallery && Array.isArray(product.imageGallery) && product.imageGallery.length > 0) {
      return [mainImage, ...product.imageGallery];
    }
    
    // Fallback ke kategori jika belum ada galeri khusus
    const categoryImages = {
      'Kue Ulang Tahun': [
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80'
      ],
      'Dessert Box': [
        'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1599599810694-b5ac4dd83eaf?auto=format&fit=crop&q=80'
      ],
      'Kue Kering': [
        'https://images.unsplash.com/photo-1557925923-cd4648e211a0?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80'
      ],
      'Roti': [
        'https://images.unsplash.com/photo-1551024709-8f23befc6bed?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1542831371-d531d36971e6?auto=format&fit=crop&q=80'
      ]
    };
    
    const images = categoryImages[product.category] || [];
    return [mainImage, ...images];
  };


  if (loading) {
    return (
      <div className="katalog-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="katalog-overlay"></div>
        <div style={{ position: 'relative', zIndex: 10, padding: '40px', background: 'white', borderRadius: '12px' }}>
          Memuat detail produk...
        </div>
      </div>
    );
  }

  if (!produk) {
    return (
      <div className="katalog-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="katalog-overlay"></div>
        <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', zIndex: 10 }}>
          <h2>Oops! Produk Tidak Ditemukan</h2>
          <p>Sepertinya terjadi kesalahan saat memuat data kue.</p>
          <button onClick={() => navigate('/')} style={{ padding: '10px 20px', background: '#b45309', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}>
            Kembali ke Katalog Utama
          </button>
        </div>
      </div>
    );
  }

  const stokTersedia = Number(produk.stock) || 0;
  const galeri = generateGaleri(produk);

  const aturJumlah = (angka) => {
    const nilaiBaru = jumlahBeli + angka;
    if (nilaiBaru >= 1 && nilaiBaru <= stokTersedia) {
      setJumlahBeli(nilaiBaru);
    }
  };

  const handleTambah = () => {
    if (stokTersedia === 0) return;
    tambahKeKeranjang(produk, jumlahBeli);
  };

  return (
    <div className="katalog-wrapper">
      <div className="katalog-overlay"></div>
      <div className="katalog-content" style={{ flexDirection: 'column', gap: '15px' }}>
        <div style={{ fontSize: '13px', color: '#e5e7eb', paddingLeft: '5px' }}>
          Beranda / {produk.category} / {produk.name}
        </div>

        <div style={{ display: 'flex', background: 'white', borderRadius: '12px', overflow: 'hidden', width: '100%', padding: '35px', gap: '40px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <img
              src={galeri[indeksGambar]}
              alt={produk.name}
              style={{ width: '100%', height: '380px', objectFit: 'cover', borderRadius: '8px', transition: 'all 0.3s ease' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {galeri.map((gbr, idx) => (
                <img
                  key={idx}
                  src={gbr}
                  alt={`thumbnail-${idx}`}
                  onClick={() => setIndeksGambar(idx)}
                  style={{
                    width: '100%',
                    height: '85px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: indeksGambar === idx ? '2px solid #b45309' : '2px solid transparent',
                    opacity: indeksGambar === idx ? '1' : '0.6',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#111' }}>{produk.name}</h1>
            <h2 className="product-price product-price-large" style={{ margin: '0 0 15px 0' }}>{formatHarga(produk.price)}</h2>
            <div style={{ display: 'flex', gap: '3px', marginBottom: '30px' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>

            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '25px', marginBottom: '30px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#374151', fontWeight: 'bold' }}>Deskripsi Produk</h4>
              <p style={{ margin: '0', fontSize: '14px', color: '#4b5563', lineHeight: '1.7' }}>
                {produk.description}
              </p>
            </div>

            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '25px', marginTop: 'auto' }}>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#374151', fontWeight: 'bold' }}>Atur Jumlah</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '6px', overflow: 'hidden', height: '40px' }}>
                  <button
                    onClick={() => aturJumlah(-1)}
                    disabled={stokTersedia === 0 || jumlahBeli <= 1}
                    style={{
                      width: '40px', height: '100%', background: 'white', border: 'none', borderRight: '1px solid #d1d5db', cursor: stokTersedia === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '20px', color: '#374151', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: stokTersedia === 0 ? 0.4 : 1
                    }}
                  >-
                  </button>
                  <span style={{ width: '60px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', color: '#111' }}>{stokTersedia === 0 ? 0 : jumlahBeli}</span>
                  <button
                    onClick={() => aturJumlah(1)}
                    disabled={stokTersedia === 0 || jumlahBeli >= stokTersedia}
                    style={{
                      width: '40px', height: '100%', background: 'white', border: 'none', borderLeft: '1px solid #d1d5db', cursor: stokTersedia === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '20px', color: '#374151', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: stokTersedia === 0 ? 0.4 : 1
                    }}
                  >+
                  </button>
                </div>
                <span style={{ fontSize: '13px', color: stokTersedia === 0 ? '#b91c1c' : '#6b7280', fontWeight: stokTersedia === 0 ? '700' : '500' }}>
                  {stokTersedia === 0 ? 'Stok habis' : `Stok tersedia: ${stokTersedia}`}
                </span>
              </div>

              <button
                onClick={handleTambah}
                className="btn-primary"
                disabled={stokTersedia === 0}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: stokTersedia === 0 ? 'not-allowed' : 'pointer',
                  backgroundColor: stokTersedia === 0 ? '#fca5a5' : '#b45309',
                  color: 'white',
                  border: 'none',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                {stokTersedia === 0 ? 'Stok Habis' : '+ Masukkan Keranjang'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailProduk;