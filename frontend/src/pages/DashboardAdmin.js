import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import API from '../services/api';

const DashboardAdmin = ({ setIsLoggedIn, setUserRole, setUser }) => {
  const navigate = useNavigate();
  const [kataKunciPencarian, setKataKunciPencarian] = useState('');
  const [produkAdmin, setProdukAdmin] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modeModal, setModeModal] = useState('add');
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    category: 'Kue Ulang Tahun',
    price: 0,
    imageUrl: '',
    imageGallery: [],
    imageGalleryText: '',
    description: '',
    stock: 1
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await API.get('/products?admin=true');
      setProdukAdmin(response.data);
    } catch (error) {
      console.error('Gagal memuat produk:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await API.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Gagal memuat pesanan:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('campbread_token');
    localStorage.removeItem('campbread_role');
    setIsLoggedIn(false);
    setUserRole('');
    navigate('/login');
  };

  const openTambahModal = () => {
    setModeModal('add');
    setFormData({
      id: null,
      name: '',
      category: 'Kue Ulang Tahun',
      price: 0,
      imageUrl: '',
      imageGallery: [],
      imageGalleryText: '',
      description: '',
      stock: 1
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setModeModal('edit');
    setFormData({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      imageUrl: product.imageUrl,
      imageGallery: Array.isArray(product.imageGallery) ? product.imageGallery : [],
      imageGalleryText: Array.isArray(product.imageGallery) ? product.imageGallery.join(', ') : (typeof product.imageGallery === 'string' ? product.imageGallery : ''),
      description: product.description,
      stock: product.stock
    });
    setShowModal(true);
  };

  const handleChange = (field, value) => {
    setFormData((prevState) => ({ ...prevState, [field]: value }));
  };

  const handleSaveProduct = async () => {
    try {
      if (modeModal === 'add') {
        await API.post('/products', {
          name: formData.name,
          category: formData.category,
          price: Number(formData.price),
          imageUrl: formData.imageUrl,
          imageGallery: formData.imageGalleryText.split(',').map(url => url.trim()).filter(url => url),
          description: formData.description,
          stock: Number(formData.stock)
        });
        Swal.fire({ icon: 'success', title: 'Produk berhasil ditambahkan', toast: true, position: 'top-end', timer: 1500, showConfirmButton: false });
      } else {
        await API.put(`/products/${formData.id}`, {
          name: formData.name,
          category: formData.category,
          price: Number(formData.price),
          imageUrl: formData.imageUrl,
          imageGallery: formData.imageGalleryText.split(',').map(url => url.trim()).filter(url => url),
          description: formData.description,
          stock: Number(formData.stock)
        });
        Swal.fire({ icon: 'success', title: 'Produk berhasil diperbarui', toast: true, position: 'top-end', timer: 1500, showConfirmButton: false });
      }
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Terjadi kesalahan', text: error.response?.data?.message || 'Tidak dapat menyimpan produk.' });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus produk?',
      text: 'Produk yang dihapus tidak dapat dikembalikan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await API.delete(`/products/${id}`);
        Swal.fire({ icon: 'success', title: 'Produk berhasil dihapus', toast: true, position: 'top-end', timer: 1500, showConfirmButton: false });
        fetchProducts();
      } catch (error) {
        console.error(error);
        Swal.fire({ icon: 'error', title: 'Gagal menghapus produk', text: error.response?.data?.message || 'Coba lagi nanti.' });
      }
    }
  };

  const toggleProductDetails = (id) => {
    setExpandedProductId(expandedProductId === id ? null : id);
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status });
      Swal.fire({
        icon: 'success',
        title: 'Status pesanan berhasil diperbarui',
        toast: true,
        position: 'top-end',
        timer: 1500,
        showConfirmButton: false
      });
      fetchOrders();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal memperbarui status pesanan',
        text: error.response?.data?.message || 'Silakan coba lagi.'
      });
    }
  };

  const formatCurrency = (value) => `Rp ${Number(value).toLocaleString('id-ID')}`;

  const filteredOrders = orders.filter((order) =>
    orderStatusFilter === 'all' ? true : order.status === orderStatusFilter
  );

  const produkDifilter = produkAdmin.filter((item) =>
    item.name.toLowerCase().includes(kataKunciPencarian.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '"Outfit", sans-serif', backgroundColor: '#f3f4f6', position: 'relative' }}>
      <div style={{ width: '260px', backgroundColor: '#1f2937', color: 'white', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 15px rgba(0,0,0,0.05)', zIndex: 10 }}>
        <div style={{ padding: '30px 25px' }}>
          <div style={{ background: 'linear-gradient(135deg, #fed7aa 0%, #ffedd5 100%)', color: '#c2410c', padding: '12px', textAlign: 'center', fontWeight: '800', borderRadius: '12px', marginBottom: '40px', fontSize: '15px', boxShadow: '0 4px 10px rgba(194, 65, 12, 0.1)' }}>
            ADMIN PANEL
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '15px', letterSpacing: '1px' }}>MENU ADMIN</div>
          <div
            onClick={() => setActiveTab('products')}
            style={{
              backgroundColor: activeTab === 'products' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              padding: '15px 20px',
              borderRadius: '12px',
              color: activeTab === 'products' ? 'white' : '#9ca3af',
              fontWeight: '700',
              fontSize: '15px',
              cursor: 'pointer',
              marginBottom: '10px',
              transition: 'all 0.2s ease'
            }}
          >
            Kelola Produk
          </div>
          <div
            onClick={() => setActiveTab('orders')}
            style={{
              backgroundColor: activeTab === 'orders' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              padding: '15px 20px',
              borderRadius: '12px',
              color: activeTab === 'orders' ? 'white' : '#9ca3af',
              fontWeight: '700',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Kelola Pesanan
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '40px 50px', backgroundColor: '#f8fafc', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', color: '#111827', fontWeight: '800' }}>
            {activeTab === 'products' ? 'Manajemen Produk' : 'Manajemen Pesanan'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '8px 16px', background: 'white', borderRadius: '999px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: '600' }}>Halo, Admin</span>
              <div style={{ width: '32px', height: '32px', backgroundColor: '#fde68a', color: '#92400e', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>A</div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-danger"
              style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 'bold' }}
            >
              Logout
            </button>
          </div>
        </div>

        {activeTab === 'products' ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
            <input
              type="text"
              placeholder="Cari nama produk..."
              value={kataKunciPencarian}
              onChange={(e) => setKataKunciPencarian(e.target.value)}
              className="search-input"
              style={{ width: '300px' }}
            />
            <button
              onClick={openTambahModal}
              className="btn btn-primary"
              style={{ padding: '12px 24px', fontWeight: '700', fontSize: '14px', borderRadius: '12px' }}
            >
              + Tambah Produk
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ color: '#4b5563', fontSize: '14px' }}>Tampilkan semua pesanan yang telah dikonfirmasi oleh pelanggan.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label htmlFor="statusFilter" style={{ fontSize: '13px', color: '#374151', fontWeight: 'bold' }}>Filter status:</label>
              <select
                id="statusFilter"
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px' }}
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'products' ? (
          <div style={{ borderRadius: '20px', backgroundColor: 'white', padding: '0', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '15px 10px', fontSize: '13px', color: '#4b5563' }}>ID</th>
                  <th style={{ padding: '15px 10px', fontSize: '13px', color: '#4b5563' }}>Foto</th>
                  <th style={{ padding: '15px 10px', fontSize: '13px', color: '#4b5563' }}>Nama Produk</th>
                  <th style={{ padding: '15px 10px', fontSize: '13px', color: '#4b5563' }}>Kategori</th>
                  <th style={{ padding: '15px 10px', minWidth: '90px', width: '90px', fontSize: '13px', color: '#4b5563', textAlign: 'center' }}>Stok</th>
                  <th style={{ padding: '15px 10px', fontSize: '13px', color: '#4b5563' }}>Harga</th>
                  <th style={{ padding: '15px 10px', fontSize: '13px', color: '#4b5563', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '20px', color: '#6b7280', textAlign: 'center' }}>Memuat produk...</td>
                  </tr>
                ) : produkDifilter.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '20px', color: '#6b7280', textAlign: 'center' }}>Tidak ada produk yang cocok.</td>
                  </tr>
                ) : (
                  produkDifilter.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <tr style={{ borderBottom: index !== produkDifilter.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                        <td style={{ padding: '15px 20px', fontSize: '14px', color: '#4b5563' }}>{item.id}</td>
                        <td style={{ padding: '15px 20px' }}>
                          <img src={item.imageUrl} alt={item.name} style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                        </td>
                        <td style={{ padding: '15px 20px', fontSize: '15px', fontWeight: '700', color: '#111827' }}>{item.name}</td>
                        <td style={{ padding: '15px 20px' }}>
                          <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '700' }}>
                            {item.category}
                          </span>
                        </td>
                        <td style={{ padding: '15px 20px', textAlign: 'center', minWidth: '90px', width: '90px', fontSize: '15px', color: '#111827', fontWeight: '600' }}>{item.stock}</td>
                        <td style={{ padding: '15px 20px', fontSize: '15px', color: '#4b5563', fontWeight: '500' }}>{formatCurrency(item.price)}</td>
                        <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                          <button
                            onClick={() => toggleProductDetails(item.id)}
                            className="btn btn-blue"
                            style={{ padding: '8px 15px', fontSize: '12px', fontWeight: 'bold', marginRight: '10px' }}
                          >
                            {expandedProductId === item.id ? 'Tutup' : 'Detail'}
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className="btn btn-warning"
                            style={{ padding: '8px 15px', fontSize: '12px', fontWeight: 'bold', marginRight: '10px' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="btn btn-danger"
                            style={{ padding: '8px 15px', fontSize: '12px', fontWeight: 'bold' }}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                      {expandedProductId === item.id && (
                        <tr style={{ backgroundColor: '#f9fafb' }}>
                          <td colSpan="6" style={{ padding: '15px 20px', color: '#4b5563', fontSize: '13px' }}>
                            <div style={{ marginBottom: '10px' }}><strong>Deskripsi:</strong> {item.description}</div>
                            <div><strong>Stok:</strong> {item.stock}</div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ borderRadius: '20px', backgroundColor: 'white', padding: '0', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '15px 20px', fontSize: '13px', color: '#4b5563' }}>No</th>
                  <th style={{ padding: '15px 20px', fontSize: '13px', color: '#4b5563' }}>Pelanggan</th>
                  <th style={{ padding: '15px 20px', fontSize: '13px', color: '#4b5563' }}>Total</th>
                  <th style={{ padding: '15px 20px', fontSize: '13px', color: '#4b5563' }}>Status</th>
                  <th style={{ padding: '15px 20px', fontSize: '13px', color: '#4b5563' }}>Tanggal</th>
                  <th style={{ padding: '15px 20px', fontSize: '13px', color: '#4b5563', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {ordersLoading ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '20px', color: '#6b7280', textAlign: 'center' }}>Memuat pesanan...</td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '20px', color: '#6b7280', textAlign: 'center' }}>Belum ada pesanan pelanggan.</td>
                  </tr>
                ) : (
                  filteredOrders.map((order, index) => (
                    <React.Fragment key={order.id}>
                      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '15px 20px', fontSize: '14px', color: '#4b5563', fontWeight: '500' }}>{index + 1}</td>
                        <td style={{ padding: '15px 20px', fontSize: '14px', color: '#111827' }}>
                          <div style={{ fontWeight: '700' }}>{order.customerName || 'Pelanggan'}</div>
                          <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '2px' }}>{order.customerEmail || '-'}</div>
                        </td>
                        <td style={{ padding: '15px 20px', fontSize: '15px', color: '#111827', fontWeight: '700' }}>{formatCurrency(order.totalAmount || 0)}</td>
                        <td style={{ padding: '15px 20px', fontSize: '14px' }}>
                          <span className={`order-status status-${order.status || 'unknown'}`}>
                            {order.status || 'unknown'}
                          </span>
                        </td>
                        <td style={{ padding: '15px 20px', fontSize: '14px', color: '#4b5563', fontWeight: '500' }}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleString('id-ID') : '-'}
                        </td>
                        <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                              className="btn btn-blue"
                              style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '700', marginRight: '8px', borderRadius: '8px' }}
                            >
                              Konfirmasi
                            </button>
                          )}
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                              className="btn btn-warning"
                              style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '700', marginRight: '8px', borderRadius: '8px' }}
                            >
                              Proses
                            </button>
                          )}
                          {order.status === 'processing' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                              className="btn btn-success"
                              style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '700', marginRight: '8px', borderRadius: '8px' }}
                            >
                              Selesai
                            </button>
                          )}
                          {order.status !== 'completed' && order.status !== 'cancelled' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                              className="btn btn-danger"
                              style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '700', borderRadius: '8px' }}
                            >
                              Batal
                            </button>
                          )}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f3f4f6' }}>
                        <td colSpan="6" style={{ padding: '20px', fontSize: '14px', color: '#4b5563' }}>
                          <div style={{ marginBottom: '15px', background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontWeight: '800', marginBottom: '8px', color: '#111827', fontSize: '15px' }}>Detail Pesanan</div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>ID Pesanan: <span style={{ color: '#111827', fontWeight: '600' }}>#{order.id}</span></div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>Total Item: <span style={{ color: '#111827', fontWeight: '600' }}>{(order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)}</span></div>
                          </div>
                          <div style={{ fontSize: '13px', color: order.note ? '#374151' : '#9ca3af', marginBottom: '15px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: order.note ? '#fef3c7' : 'transparent', padding: order.note ? '10px 15px' : '0', borderRadius: '8px', borderLeft: order.note ? '4px solid #f59e0b' : 'none' }}>
                            {order.note ? `Catatan Pesanan: ${order.note}` : 'Tidak ada catatan pelanggan'}
                          </div>
                          <div style={{ fontWeight: '800', marginBottom: '10px', color: '#111827', fontSize: '14px' }}>Item Pesanan:</div>
                          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '15px', marginBottom: '15px' }}>
                            {(order.items || []).map((item) => (
                              <div key={item.id || `${order.id}-${item.productId || item.productName}` } style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e5e7eb', paddingBottom: '8px' }}>
                                <div>
                                  <span style={{ fontWeight: '600', color: '#111827' }}>{item.productName}</span> <span style={{ color: '#6b7280' }}>x{item.quantity || 0}</span>
                                  {item.note && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Catatan: {item.note}</div>}
                                </div>
                                <div style={{ fontWeight: '600', color: '#111827' }}>{formatCurrency(item.price || 0)}</div>
                              </div>
                            ))}
                          </div>
                          {order.paymentProof && (
                            <div style={{ marginTop: '15px' }}>
                              <div style={{ fontWeight: '800', marginBottom: '8px', color: '#111827', fontSize: '14px' }}>Bukti Transfer:</div>
                              <a href={`http://localhost:5000${order.paymentProof}`} target="_blank" rel="noopener noreferrer">
                                <img src={`http://localhost:5000${order.paymentProof}`} alt="Bukti Transfer" style={{ maxWidth: '250px', maxHeight: '250px', borderRadius: '12px', border: '2px solid #e5e7eb', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'} />
                              </a>
                            </div>
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px', overflowY: 'auto' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '580px', maxHeight: 'calc(100vh - 40px)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.6)' }}>
            <div style={{ padding: '25px 30px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#111827', fontWeight: '800' }}>{modeModal === 'add' ? 'Tambah Produk Baru' : 'Edit Produk'}</h3>
              <span onClick={() => setShowModal(false)} style={{ cursor: 'pointer', fontSize: '20px', color: '#9ca3af' }}>&times;</span>
            </div>
            <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: 'calc(100vh - 160px)', overflowY: 'auto', minHeight: 0, background: 'white' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>Nama Produk</label>
                <input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  type="text"
                  placeholder="Masukkan nama produk..."
                  className="search-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="search-input"
                  style={{ width: '100%', backgroundColor: 'white', boxSizing: 'border-box' }}
                >
                  <option value="Kue Ulang Tahun">Kue Ulang Tahun</option>
                  <option value="Dessert Box">Dessert Box</option>
                  <option value="Kue Kering">Kue Kering</option>
                  <option value="Roti">Roti</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Harga (Rp)</label>
                <input
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  type="number"
                  placeholder="0"
                  className="search-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>URL Foto</label>
                <input
                  value={formData.imageUrl}
                  onChange={(e) => handleChange('imageUrl', e.target.value)}
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  className="search-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Galeri Foto (URL, pisahkan dengan koma)</label>
                <textarea
                  value={formData.imageGalleryText}
                  onChange={(e) => handleChange('imageGalleryText', e.target.value)}
                  placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                  className="search-input"
                  style={{ width: '100%', minHeight: '80px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Masukkan deskripsi produk..."
                  className="search-input"
                  style={{ width: '100%', minHeight: '120px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Stok</label>
                <input
                  value={formData.stock}
                  onChange={(e) => handleChange('stock', e.target.value)}
                  type="number"
                  min="1"
                  placeholder="Jumlah stok"
                  className="search-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ padding: '20px 30px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '15px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <button onClick={() => setShowModal(false)} className="btn" style={{ padding: '12px 25px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', fontWeight: '700', color: '#374151' }}>Batal</button>
              <button onClick={handleSaveProduct} className="btn-primary" style={{ padding: '12px 25px', fontWeight: '700', borderRadius: '12px' }}>
                {modeModal === 'add' ? 'Tambah Produk' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAdmin;