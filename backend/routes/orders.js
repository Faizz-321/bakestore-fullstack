const express = require('express');
const sequelize = require('../config/database');
const authMiddleware = require('../middleware/auth');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const User = require('../models/User');
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diizinkan'), false);
    }
  }
});

const router = express.Router();

router.post('/', authMiddleware, upload.single('paymentProof'), async (req, res) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ message: 'Hanya pelanggan yang dapat membuat pesanan.' });
  }

  let items;
  try {
    items = JSON.parse(req.body.items);
  } catch (error) {
    return res.status(400).json({ message: 'Format items tidak valid.' });
  }
  const note = req.body.note;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Pesanan harus berisi minimal satu produk.' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Bukti transfer wajib diunggah.' });
  }

  const paymentProofUrl = `/uploads/${req.file.filename}`;

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'Pengguna tidak ditemukan.' });
    }

    const totalAmount = items.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + price * quantity;
    }, 0);

    const order = await sequelize.transaction(async (transaction) => {
      const createdOrder = await Order.create({
        userId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        status: 'confirmed',
        totalAmount,
        note: note || null,
        paymentProof: paymentProofUrl
      }, { transaction });

      const orderItems = items.map((item) => ({
        orderId: createdOrder.id,
        productId: item.productId || null,
        productName: item.name || item.productName,
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
        note: item.note || null
      }));

      await OrderItem.bulkCreate(orderItems, { transaction });
      return createdOrder;
    });

    const result = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items' }, { model: User, attributes: ['id', 'name', 'email'] }]
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat pesanan', error: error.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const filter = isAdmin ? {} : { userId: req.user.id };

    const orders = await Order.findAll({
      where: filter,
      include: [
        { model: OrderItem, as: 'items' },
        { model: User, attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil pesanan', error: error.message });
  }
});

router.put('/:id/status', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Aksi ini hanya untuk admin.' });
  }

  const { status } = req.body;
  const allowedStatuses = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Status tidak valid.' });
  }

  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
    }

    const previousStatus = order.status;

    // If transitioning to completed from a non-completed status, decrement stocks
    if (previousStatus !== 'completed' && status === 'completed') {
      await sequelize.transaction(async (transaction) => {
        const items = await OrderItem.findAll({ where: { orderId: order.id }, transaction });

        for (const item of items) {
          if (!item.productId) continue;

          const product = await Product.findByPk(item.productId, { transaction, lock: transaction.LOCK.UPDATE });
          if (!product) continue;

          const qty = Number(item.quantity) || 0;
          if (product.stock < qty) {
            throw new Error(`Stok tidak cukup untuk produk ${product.name}`);
          }

          product.stock = product.stock - qty;
          await product.save({ transaction });
        }

        order.status = status;
        await order.save({ transaction });
      });
    } else {
      // No stock changes required, just update status
      order.status = status;
      await order.save();
    }

    const updatedOrder = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items' }, { model: User, attributes: ['id', 'name', 'email'] }]
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    // If our transaction threw due to insufficient stock, return 400
    if (error.message && error.message.startsWith('Stok tidak cukup')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Gagal memperbarui status pesanan', error: error.message });
  }
});

module.exports = router;
