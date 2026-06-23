import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, ArrowLeft } from 'lucide-react';
import '../styles/Catalog.css';

const Navbar = ({ setKataKunci, jumlahKeranjang, isLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/admin') {
    return null;
  }

  const handleSearch = (e) => {
    setKataKunci(e.target.value);
    
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {location.pathname !== '/' && (
          <ArrowLeft 
            size={24} 
            style={{ cursor: 'pointer', color: '#111' }} 
            onClick={() => navigate(-1)} 
          />
        )}
        <Link to="/" className="brand-logo">CampBread</Link>
      </div>
      
      {location.pathname !== '/keranjang' && (
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Cari kue atau dessert..." 
            className="search-input"
            onChange={handleSearch}
          />
        </div>
      )}

      <div className="nav-icons" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/keranjang" className="cart-icon-wrapper" style={{ color: 'inherit', position: 'relative' }}>
          <ShoppingCart size={24} />
          {jumlahKeranjang > 0 && <span className="cart-badge">{jumlahKeranjang}</span>}
        </Link>
        <Link to={isLoggedIn ? '/profile' : '/login'} style={{ color: 'inherit' }}>
          <User size={24} />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;