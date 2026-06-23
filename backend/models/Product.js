const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imageGallery: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    get() {
      const raw = this.getDataValue('imageGallery');
      return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    },
    set(val) {
      this.setDataValue('imageGallery', val ? JSON.stringify(val) : null);
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  }
});
module.exports = Product;
