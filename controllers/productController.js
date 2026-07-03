const db = require('../config/database');

// GET semua produk (dengan filter search & kategori)
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR category LIKE ? OR description LIKE ?)';
      const keyword = `%${search}%`;
      params.push(keyword, keyword, keyword);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const [products] = await db.query(query, params);

    res.json({
      success: true,
      data: products,
      total: products.length
    });
  } catch (error) {
    console.error('Error get products:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.'
    });
  }
};

// GET produk berdasarkan ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [products] = await db.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan.'
      });
    }

    res.json({
      success: true,
      data: products[0]
    });
  } catch (error) {
    console.error('Error get product by id:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.'
    });
  }
};

// GET semua kategori
exports.getCategories = async (req, res) => {
  try {
    const [categories] = await db.query(
      'SELECT DISTINCT category FROM products ORDER BY category ASC'
    );

    res.json({
      success: true,
      data: categories.map(c => c.category)
    });
  } catch (error) {
    console.error('Error get categories:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.'
    });
  }
};

// POST buat produk baru (admin)
exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, image, rating, stock, weight, description } = req.body;

    // Validasi input
    if (!name || !category || !price || !stock || !weight) {
      return res.status(400).json({
        success: false,
        message: 'Field name, category, price, stock, weight wajib diisi.'
      });
    }

    const [result] = await db.query(
      `INSERT INTO products (name, category, price, image, rating, stock, weight, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        name,
        category,
        parseFloat(price),
        image || 'https://picsum.photos/400/400',
        parseFloat(rating) || 0,
        parseInt(stock),
        parseInt(weight),
        description || ''
      ]
    );

    const [newProduct] = await db.query(
      'SELECT * FROM products WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Produk berhasil ditambahkan.',
      data: newProduct[0]
    });
  } catch (error) {
    console.error('Error create product:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.'
    });
  }
};

// PUT update produk (admin)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, image, rating, stock, weight, description } = req.body;

    // Cek produk ada
    const [existing] = await db.query(
      'SELECT id FROM products WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan.'
      });
    }

    await db.query(
      `UPDATE products
       SET name = ?, category = ?, price = ?, image = ?, rating = ?,
           stock = ?, weight = ?, description = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        name,
        category,
        parseFloat(price),
        image,
        parseFloat(rating),
        parseInt(stock),
        parseInt(weight),
        description,
        id
      ]
    );

    const [updated] = await db.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Produk berhasil diperbarui.',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error update product:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.'
    });
  }
};

// DELETE produk (admin)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query(
      'SELECT id FROM products WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan.'
      });
    }

    await db.query('DELETE FROM products WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Produk berhasil dihapus.'
    });
  } catch (error) {
    console.error('Error delete product:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.'
    });
  }
};
