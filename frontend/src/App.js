import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import DashboardAdmin from './pages/DashboardAdmin';

const TOKEN_KEY = 'campbread_token';
const ROLE_KEY = 'campbread_role';
const USER_KEY = 'campbread_user';

function App() {
  const [kataKunci, setKataKunci] = useState('');
  const [keranjang, setKeranjang] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));
  const [userRole, setUserRole] = useState(localStorage.getItem(ROLE_KEY) || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem(USER_KEY) || 'null'));

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem(TOKEN_KEY)));
    setUserRole(localStorage.getItem(ROLE_KEY) || '');
    setUser(JSON.parse(localStorage.getItem(USER_KEY) || 'null'));
  }, []);

  const tambahKeKeranjang = (produk, qty = 1) => {
    const stokTersedia = Number(produk.stock) || 0;
    if (stokTersedia === 0) {
      return Swal.fire({
        icon: 'warning',
        title: 'Stok Habis',
        text: `Maaf, produk ${produk.name || produk.nama} sudah habis dan tidak dapat ditambahkan ke keranjang.`, 
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        position: 'center'
      });
    }

    const itemCart = {
      ...produk,
      id: produk.id,
      nama: produk.name ?? produk.nama,
      harga: produk.price ? `Rp ${Number(produk.price).toLocaleString('id-ID')}` : produk.harga,
      img: produk.imageUrl ?? produk.img
    };

    const adaDiKeranjang = keranjang.find((item) => item.id === itemCart.id);
    if (adaDiKeranjang) {
      setKeranjang(keranjang.map((item) =>
        item.id === itemCart.id ? { ...adaDiKeranjang, jumlah: adaDiKeranjang.jumlah + qty } : item
      ));
    } else {
      setKeranjang([...keranjang, { ...itemCart, jumlah: qty }]);
    }

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: `${qty} ${itemCart.nama} telah masuk keranjang.`,
      showConfirmButton: false,
      timer: 1000,
      toast: true,
      position: 'center'
    });
  };

  return (
    <Router>
      <Navbar setKataKunci={setKataKunci} jumlahKeranjang={keranjang.length} isLoggedIn={isLoggedIn} />
      <Routes>
        <Route path="/" element={<Catalog kataKunci={kataKunci} tambahKeKeranjang={tambahKeKeranjang} />} />
        <Route path="/produk/:id" element={<ProductDetail tambahKeKeranjang={tambahKeKeranjang} />} />
        <Route path="/keranjang" element={<Cart keranjang={keranjang} setKeranjang={setKeranjang} isLoggedIn={isLoggedIn} />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={
          <ProtectedRoute isAllowed={isLoggedIn}>
            <Profile user={user} setUser={setUser} setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />
          </ProtectedRoute>
        } />
        <Route
          path="/admin"
          element={
            <ProtectedRoute isAllowed={isLoggedIn && userRole === 'admin'}>
              <DashboardAdmin setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} setUser={setUser} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;