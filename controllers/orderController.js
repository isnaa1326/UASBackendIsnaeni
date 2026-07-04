const db = require('../config/database');
const axios = require('axios');
require('dotenv').config();

// Kirim notifikasi WhatsApp ke owner via Fonnte
async function kirimNotifWA(order) {
  try {
    const itemList = order.items
      .map(item => `  • ${item.name} x${item.quantity} = Rp${(item.price * item.quantity).toLocaleString('id-ID')}`)
      .join('\n');

    const pesan =
      `🛍️ *PESANAN BARU - UrbanStore*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📋 *Order ID:* ${order.id}\n` +
      `📅 *Waktu:* ${new Date(order.date).toLocaleString('id-ID')}\n\n` +
      `👤 *Customer:*\n` +
      `  Nama: ${order.customerName}\n` +
      `  HP: ${order.phone}\n` +
      `  Alamat: ${order.address}, ${order.kota}\n\n` +
      `🛒 *Produk Dipesan:*\n` +
      `${itemList}\n\n` +
      `💰 *Rincian Harga:*\n` +
      `  Subtotal: Rp${order.subtotal.toLocaleString('id-ID')}\n` +
      `  Ongkir: Rp${order.ongkir.toLocaleString('id-ID')}\n` +
      `  *TOTAL: Rp${order.totalAmount.toLocaleString('id-ID')}*\n\n` +
      `✅ Status: ${order.status === 'paid' ? 'LUNAS' : order.status.toUpperCase()}\n` +
      `━━━━━━━━━━━━━━━━━━`;

    // Kirim via Fonnte API
    const response = await axios.post(
      'https://api.fonnte.com/send',
      {
        target: process.env.WA_OWNER_NUMBER,
        message: pesan,
        countryCode: '62'
      },
      {
        headers: {
          Authorization: process.env.WA_TOKEN
        }
      }
    );

    console.log('✅ Notif WA terkirim:', response.data);
    return true;
  } catch (error) {
    // Notif WA gagal tidak menghentikan proses order
    console.error('⚠️ Gagal kirim notif WA:', error.message);
    return false;
  }
}

// POST buat order baru (checkout)
exports.createOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const {
      customerName,
      address,
      phone,
      kota_id,
      kota,
      ongkir,
      items,
      subtotal,
      totalAmount
    } = req.body;

    // Validasi input wajib
    if (!customerName || !address || !phone || !kota_id || !items || items.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Data order tidak lengkap.'
      });
    }

    // Generate order ID
    const orderId = 'TRX_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Insert ke tabel orders
    await connection.query(
      `INSERT INTO orders
        (id, user_id, customer_name, address, phone, kota_id, kota, ongkir, subtotal, total_amount, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', NOW())`,
      [orderId, userId, customerName, address, phone, kota_id, kota, ongkir || 0, subtotal, totalAmount]
    );

    // Insert detail item ke order_items
    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.id,
          item.name,
          item.image || '',
          item.price,
          item.quantity,
          item.price * item.quantity
        ]
      );
    }

    await connection.commit();
    connection.release();

    // Ambil data order lengkap untuk notif WA
    const orderData = {
      id: orderId,
      customerName,
      address,
      phone,
      kota,
      ongkir: ongkir || 0,
      items,
      subtotal,
      totalAmount,
      status: 'paid',
      date: new Date().toISOString()
    };

    // Kirim notif WA (async, tidak blocking)
    kirimNotifWA(orderData);

    res.status(201).json({
      success: true,
      message: 'Pesanan berhasil dibuat. Notifikasi dikirim ke owner.',
      data: { orderId, status: 'paid', totalAmount }
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error create order:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memproses pesanan.'
    });
  }
};

// GET riwayat pesanan user yang sedang login
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const [orders] = await db.query(
      `SELECT o.*, GROUP_CONCAT(
        JSON_OBJECT(
          'id', oi.product_id,
          'name', oi.product_name,
          'image', oi.product_image,
          'price', oi.price,
          'quantity', oi.quantity
        )
      ) as items_json
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC`,
      [userId]
    );

    const formattedOrders = orders.map(order => ({
      id: order.id,
      customerName: order.customer_name,
      address: order.address,
      phone: order.phone,
      kota: order.kota,
      ongkir: order.ongkir,
      subtotal: order.subtotal,
      totalAmount: order.total_amount,
      status: order.status,
      date: order.created_at,
      items: order.items_json
        ? JSON.parse('[' + order.items_json + ']')
        : []
    }));

    res.json({
      success: true,
      data: formattedOrders,
      total: formattedOrders.length
    });
  } catch (error) {
    console.error('Error get my orders:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.'
    });
  }
};

// GET semua pesanan (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, u.email as user_email,
        GROUP_CONCAT(
          JSON_OBJECT(
            'id', oi.product_id,
            'name', oi.product_name,
            'image', oi.product_image,
            'price', oi.price,
            'quantity', oi.quantity
          )
        ) as items_json
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC`
    );

    const formattedOrders = orders.map(order => ({
      id: order.id,
      customerName: order.customer_name,
      userEmail: order.user_email,
      address: order.address,
      phone: order.phone,
      kota: order.kota,
      ongkir: order.ongkir,
      subtotal: order.subtotal,
      totalAmount: order.total_amount,
      status: order.status,
      date: order.created_at,
      items: order.items_json
        ? JSON.parse('[' + order.items_json + ']')
        : []
    }));

    res.json({
      success: true,
      data: formattedOrders,
      total: formattedOrders.length
    });
  } catch (error) {
    console.error('Error get all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.'
    });
  }
};

// PUT update status order (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Pilihan: ${validStatuses.join(', ')}`
      });
    }

    const [existing] = await db.query(
      'SELECT id FROM orders WHERE id = ?', [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order tidak ditemukan.'
      });
    }

    await db.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    res.json({
      success: true,
      message: `Status order berhasil diubah ke "${status}".`
    });
  } catch (error) {
    console.error('Error update order status:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.'
    });
  }
};
