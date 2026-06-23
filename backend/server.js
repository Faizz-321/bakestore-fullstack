require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const sequelize = require('./config/database');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

async function seedDatabase() {
  const adminEmail = 'admin@gmail.com';
  const customerEmail = 'customer@gmail.com';

  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  await User.findOrCreate({
    where: { email: adminEmail },
    defaults: { name: 'Admin CampBread', email: adminEmail, password: adminPassword, role: 'admin' }
  });

  await User.findOrCreate({
    where: { email: customerEmail },
    defaults: { name: 'Pelanggan CampBread', email: customerEmail, password: customerPassword, role: 'customer' }
  });

  const defaultProducts = [
    {
      name: 'Black Forest Cake',
      category: 'Kue Ulang Tahun',
      price: 150000,
      imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&q=80',
      description: 'Kue Black Forest klasik dengan bolu cokelat lembut, krim segar, dan ceri hitam.',
      stock: 15
    },
    {
      name: 'Tiramisu Dessert Box',
      category: 'Dessert Box',
      price: 45000,
      imageUrl: 'https://images.unsplash.com/photo-1571115177098-24edf3e00b65?auto=format&fit=crop&q=80',
      description: 'Dessert box tiramisu lembut dengan lapisan kopi dan mascarpone.',
      stock: 20
    },
    {
      name: 'Nastar Keju Premium',
      category: 'Kue Kering',
      price: 120000,
      imageUrl: 'https://images.unsplash.com/photo-1605335967732-2b6389fccb8c?auto=format&fit=crop&q=80',
      description: 'Nastar keju premium dengan selai nanas asli dan tekstur lembut.',
      stock: 25
    },
    {
      name: 'Croissant Cokelat',
      category: 'Roti',
      price: 28000,
      imageUrl: 'https://images.unsplash.com/photo-1512218168350-8cdd98e7e8e2?auto=format&fit=crop&q=80',
      description: 'Croissant renyah dengan isian cokelat Belgia yang meleleh di mulut.',
      stock: 30
    },
    {
      name: 'Cupcake Red Velvet',
      category: 'Dessert Box',
      price: 35000,
      imageUrl: 'https://images.unsplash.com/photo-1516684669134-de6b6d9a2e8d?auto=format&fit=crop&q=80',
      description: 'Cupcake red velvet lembut dengan cream cheese frosting yang manis dan segar.',
      stock: 22
    },
    {
      name: 'Caramel Brownies',
      category: 'Dessert Box',
      price: 52000,
      imageUrl: 'https://images.unsplash.com/photo-1600699551766-18bd82d894f2?auto=format&fit=crop&q=80',
      description: 'Brownies cokelat pekat dengan saus karamel gurih di atasnya.',
      stock: 18
    },
    {
      name: 'Roti Tawar Gandum',
      category: 'Roti',
      price: 25000,
      imageUrl: 'https://images.unsplash.com/photo-1550445795-4a0b38e58218?auto=format&fit=crop&q=80',
      description: 'Roti tawar sehat dengan campuran gandum utuh, cocok untuk sarapan dan sandwich.',
      stock: 40
    },
    {
      name: 'Lapis Legit Original',
      category: 'Kue Ulang Tahun',
      price: 170000,
      imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6e6b?auto=format&fit=crop&q=80',
      description: 'Kue lapis legit dengan aroma rempah hangat dan tekstur lapis yang kaya.',
      stock: 12
    }
  ];

  for (const productData of defaultProducts) {
    await Product.findOrCreate({
      where: { name: productData.name },
      defaults: productData
    });
  }
}


User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

sequelize.sync()
  .then(async () => {
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Gagal menyambung ke database:', error);
  });
