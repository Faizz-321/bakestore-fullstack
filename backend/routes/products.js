const express = require('express');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'campbread_secret_key';

const router = express.Router();

function rejectAdminIfAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;

  if (req.query.admin === 'true') {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token tidak ditemukan' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Akses admin dibutuhkan.' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Token tidak valid' });
    }
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.role === 'admin') {
        return res.status(403).json({ message: 'Admin tidak dapat mengakses katalog produk.' });
      }
    } catch (error) {
      // Jika token tidak valid, abaikan untuk permintaan publik katalog.
      console.warn('Token katalog publik tidak valid:', error.message);
    }
  }

  next();
}

router.get('/', rejectAdminIfAuthenticated, async (req, res) => {
  const products = await Product.findAll({ order: [['id', 'ASC']] });
  res.json(products);
});

router.get('/:id', rejectAdminIfAuthenticated, async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Produk tidak ditemukan' });
  }
  res.json(product);
});

router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Aksi ini hanya untuk admin.' });
  }

  const { name, category, price, imageUrl, imageGallery, description, stock } = req.body;
  try {
    const product = await Product.create({ name, category, price, imageUrl, imageGallery, description, stock });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Gagal membuat produk', error: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Aksi ini hanya untuk admin.' });
  }

  const product = await Product.findByPk(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Produk tidak ditemukan' });
  }
  const { name, category, price, imageUrl, imageGallery, description, stock } = req.body;
  try {
    await product.update({ name, category, price, imageUrl, imageGallery, description, stock });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Gagal memperbarui produk', error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Aksi ini hanya untuk admin.' });
  }

  const product = await Product.findByPk(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Produk tidak ditemukan' });
  }
  await product.destroy();
  res.json({ message: 'Produk berhasil dihapus' });
});

module.exports = router;
