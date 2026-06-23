import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import '../styles/Catalog.css';

const Katalog = ({ kataKunci, tambahKeKeranjang }) => {
  const navigate = useNavigate();
  const [kategoriAktif, setKategoriAktif] = useState('Semua Produk');
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);

  const daftarKategori = ['Semua Produk', 'Kue Ulang Tahun', 'Dessert Box', 'Kue Kering', 'Roti'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await API.get('/products');
        setProduk(response.data);
      } catch (error) {
        console.error('Gagal memuat produk:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const produkDifilter = produk.filter(item => {
    const cocokKategori = kategoriAktif === 'Semua Produk' || item.category === kategoriAktif;
    const kataPencarian = kataKunci ? kataKunci.toLowerCase() : '';
    const cocokNama = item.name.toLowerCase().includes(kataPencarian);
    return cocokKategori && cocokNama;
  });

  const formatHarga = (price) => {
    return `Rp ${Number(price).toLocaleString('id-ID')}`;
  };

  return (
    <div className="katalog-wrapper">
      <div className="katalog-overlay"></div>
      <div className="katalog-content">
        <aside className="sidebar">
          <h3>Kategori</h3>
          {daftarKategori.map(kategori => (
            <div
              key={kategori}
              className={`category-item ${kategoriAktif === kategori ? 'active' : ''}`}
              onClick={() => setKategoriAktif(kategori)}
            >
              {kategori}
            </div>
          ))}
        </aside>

        <div className="product-grid">
          {loading ? (
            <div style={{ color: '#374151', fontSize: '16px', width: '100%', textAlign: 'center', padding: '60px 0' }}>
              Memuat produk...
            </div>
          ) : produkDifilter.length === 0 ? (
            <div style={{ color: '#374151', fontSize: '16px', width: '100%', textAlign: 'center', padding: '60px 0' }}>
              Tidak ada produk yang cocok.
            </div>
          ) : (
            produkDifilter.map((item) => {
              const stokTersedia = Number(item.stock) || 0;
              return (
                <div key={item.id} className="product-card">
                  {stokTersedia === 0 && (
                    <span className="stock-badge out-of-stock card-badge">STOK HABIS</span>
                  )}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="product-image"
                    onClick={() => navigate(`/produk/${item.id}`)}
                    style={{ cursor: 'pointer' }}
                  />
                  <div className="product-info">
                    <p
                      className="product-name"
                      onClick={() => navigate(`/produk/${item.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      {item.name}
                    </p>
                    <p className="product-price">{formatHarga(item.price)}</p>
                    <button
                      className={`btn-add ${stokTersedia === 0 ? 'btn-disabled' : ''}`}
                      onClick={() => tambahKeKeranjang(item)}
                      disabled={stokTersedia === 0}
                    >
                      {stokTersedia === 0 ? 'Tidak tersedia' : '+ Masukkan Keranjang'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Katalog;