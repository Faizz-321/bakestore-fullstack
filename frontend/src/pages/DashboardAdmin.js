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
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#e5e7eb', position: 'relative' }}>
      <div style={{ width: '250px', backgroundColor: '#111827', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 25px' }}>
          <div style={{ backgroundColor: '#f3f4f6', color: '#111827', padding: '10px', textAlign: 'center', fontWeight: 'bold', borderRadius: '4px', marginBottom: '40px', fontSize: '13px' }}>
            ADMIN PANEL
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '15px', letterSpacing: '1px' }}>MENU ADMIN</div>
          <div
            onClick={() => setActiveTab('products')}
            style={{
              backgroundColor: activeTab === 'products' ? '#1f2937' : 'transparent',
              padding: '15px 20px',
              borderRadius: '6px',
              borderLeft: `4px solid ${activeTab === 'products' ? '#3b82f6' : 'transparent'}`,
              color: activeTab === 'products' ? 'white' : '#9ca3af',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            Kelola Produk
          </div>
          <div
            onClick={() => setActiveTab('orders')}
            style={{
              backgroundColor: activeTab === 'orders' ? '#1f2937' : 'transparent',
              padding: '15px 20px',
              borderRadius: '6px',
              borderLeft: `4px solid ${activeTab === 'orders' ? '#3b82f6' : 'transparent'}`,
              color: activeTab === 'orders' ? 'white' : '#9ca3af',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Kelola Pesanan
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '40px', backgroundColor: '#f9fafb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#111827' }}>
            {activeTab === 'products' ? 'Manajemen Produk' : 'Manajemen Pesanan'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: '500' }}>Halo, Admin</span>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#d1d5db', borderRadius: '50%' }}></div>
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
              style={{ padding: '12px 20px', width: '300px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
            />
            <button
              onClick={openTambahModal}
              className="btn btn-blue"
              style={{ padding: '12px 20px', fontWeight: 'bold', fontSize: '14px' }}
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
          <div style={{ border: '2px solid #0ea5e9', borderRadius: '10px', backgroundColor: 'white', padding: '10px 20px', overflow: 'hidden' }}>
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
                        <td style={{ padding: '15px 10px', fontSize: '14px', color: '#4b5563' }}>{item.id}</td>
                        <td style={{ padding: '15px 10px' }}>
                          <img src={item.imageUrl} alt={item.name} style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover' }} />
                        </td>
                        <td style={{ padding: '15px 10px', fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>{item.name}</td>
                        <td style={{ padding: '15px 10px' }}>
                          <span style={{ backgroundColor: '#e5e7ff', color: '#3730a3', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                            {item.category}
                          </span>
                        </td>
                        <td style={{ padding: '15px 10px', textAlign: 'center', minWidth: '90px', width: '90px', fontSize: '14px', color: '#111827' }}>{item.stock}</td>
                        <td style={{ padding: '15px 10px', fontSize: '14px', color: '#4b5563' }}>{formatCurrency(item.price)}</td>
                        <td style={{ padding: '15px 10px', textAlign: 'center' }}>
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
          <div style={{ border: '2px solid #0ea5e9', borderRadius: '10px', backgroundColor: 'white', padding: '10px 20px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '15px 10px', fontSize: '13px', color: '#4b5563' }}>No</th>
                  <th style={{ padding: '15px 10px', fontSize: '13px', color: '#4b5563' }}>Pelanggan</th>
                  <th style={{ padding: '15px 10px', fontSize: '13px', color: '#4b5563' }}>Total</th>
                  <th style={{ padding: '15px 10px', fontSize: '13px', color: '#4b5563' }}>Status</th>
                  <th style={{ padding: '15px 10px', fontSize: '13px', color: '#4b5563' }}>Tanggal</th>
                  <th style={{ padding: '15px 10px', fontSize: '13px', color: '#4b5563', textAlign: 'center' }}>Aksi</th>
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
                        <td style={{ padding: '15px 10px', fontSize: '14px', color: '#4b5563' }}>{index + 1}</td>
                        <td style={{ padding: '15px 10px', fontSize: '14px', color: '#111827' }}>
                          <div style={{ fontWeight: 'bold' }}>{order.customerName || 'Pelanggan'}</div>
                          <div style={{ color: '#6b7280', fontSize: '12px' }}>{order.customerEmail || '-'}</div>
                        </td>
                        <td style={{ padding: '15px 10px', fontSize: '14px', color: '#4b5563' }}>{formatCurrency(order.totalAmount || 0)}</td>
                        <td style={{ padding: '15px 10px', fontSize: '14px' }}>
                          <span className={`order-status status-${order.status || 'unknown'}`}>
                            {order.status || 'unknown'}
                          </span>
                        </td>
                        <td style={{ padding: '15px 10px', fontSize: '14px', color: '#4b5563' }}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleString('id-ID') : '-'}
                        </td>
                        <td style={{ padding: '15px 10px', textAlign: 'center' }}>
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                              className="btn btn-blue"
                              style={{ padding: '8px 15px', fontSize: '12px', fontWeight: 'bold', marginRight: '10px' }}
                            >
                              Konfirmasi
                            </button>
                          )}
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                              className="btn btn-warning"
                              style={{ padding: '8px 15px', fontSize: '12px', fontWeight: 'bold', marginRight: '10px' }}
                            >
                              Proses
                            </button>
                          )}
                          {order.status === 'processing' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                              className="btn btn-success"
                              style={{ padding: '8px 15px', fontSize: '12px', fontWeight: 'bold', marginRight: '10px' }}
                            >
                              Selesai
                            </button>
                          )}
                          {order.status !== 'completed' && order.status !== 'cancelled' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                              className="btn btn-danger"
                              style={{ padding: '8px 15px', fontSize: '12px', fontWeight: 'bold' }}
                            >
                              Batal
                            </button>
                          )}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: '#f9fafb' }}>
                        <td colSpan="6" style={{ padding: '10px 20px', fontSize: '13px', color: '#4b5563' }}>
                          <div style={{ marginBottom: '10px' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>Detail Pesanan</div>
                            <div style={{ fontSize: '12px' }}>ID Pesanan: #{order.id}</div>
                            <div style={{ fontSize: '12px' }}>Total Item: {(order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)}</div>
                          </div>
                          <div style={{ fontSize: '12px', color: order.note ? '#374151' : '#9ca3af', marginBottom: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {order.note ? `Catatan Pesanan: ${order.note}` : 'Tidak ada catatan pelanggan'}
                          </div>
                          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Item:</div>
                          {(order.items || []).map((item) => (
                            <div key={item.id || `${order.id}-${item.productId || item.productName}` } style={{ marginBottom: '6px' }}>
                              • {item.productName} x{item.quantity || 0} - {formatCurrency(item.price || 0)}{item.note ? ` (Catatan: ${item.note})` : ''}
                            </div>
                          ))}
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
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(30, 41, 59, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px', overflowY: 'auto' }}>
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '540px', maxHeight: 'calc(100vh - 40px)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 25px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 25px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>{modeModal === 'add' ? 'Tambah Produk Baru' : 'Edit Produk'}</h3>
              <span onClick={() => setShowModal(false)} style={{ cursor: 'pointer', fontSize: '20px', color: '#9ca3af' }}>&times;</span>
            </div>
            <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: 'calc(100vh - 160px)', overflowY: 'auto', minHeight: 0 }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>Nama Produk</label>
                <input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  type="text"
                  placeholder="Masukkan nama produk..."
                  style={{ width: '100%', padding: '12px 15px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  style={{ width: '100%', padding: '12px 15px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' }}
                >
                  <option value="Kue Ulang Tahun">Kue Ulang Tahun</option>
                  <option value="Dessert Box">Dessert Box</option>
                  <option value="Kue Kering">Kue Kering</option>
                  <option value="Roti">Roti</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>Harga (Rp)</label>
                <input
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  type="number"
                  placeholder="0"
                  style={{ width: '100%', padding: '12px 15px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>URL Foto</label>
                <input
                  value={formData.imageUrl}
                  onChange={(e) => handleChange('imageUrl', e.target.value)}
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  style={{ width: '100%', padding: '12px 15px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>Galeri Foto (URL, pisahkan dengan koma)</label>
                <textarea
                  value={formData.imageGalleryText}
                  onChange={(e) => handleChange('imageGalleryText', e.target.value)}
                  placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg, https://example.com/img3.jpg"
                  style={{ width: '100%', minHeight: '60px', padding: '12px 15px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Masukkan deskripsi produk..."
                  style={{ width: '100%', minHeight: '100px', padding: '12px 15px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>Stok</label>
                <input
                  value={formData.stock}
                  onChange={(e) => handleChange('stock', e.target.value)}
                  type="number"
                  min="1"
                  placeholder="Jumlah stok"
                  style={{ width: '100%', padding: '12px 15px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ padding: '20px 25px', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ padding: '10px 25px' }}>Batal</button>
              <button onClick={handleSaveProduct} className="btn btn-blue" style={{ padding: '10px 25px', fontWeight: 'bold' }}>
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