-- ============================================
-- UrbanStore Database Schema
-- UAS Pemrograman Web
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS urbanstore_db;
CREATE DATABASE urbanstore_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE urbanstore_db;

-- ==================== TABEL USERS ====================
CREATE TABLE users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        ENUM('admin','customer') DEFAULT 'customer',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== TABEL PRODUCTS ====================
CREATE TABLE products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    category    VARCHAR(100) NOT NULL,
    price       DECIMAL(12,0) NOT NULL DEFAULT 0,
    image       TEXT,
    rating      DECIMAL(3,1) DEFAULT 0.0,
    stock       INT DEFAULT 0,
    weight      INT DEFAULT 0 COMMENT 'gram',
    description TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== TABEL KOTA ====================
CREATE TABLE kota (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    nama    VARCHAR(100) NOT NULL,
    ongkir  INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== TABEL ORDERS ====================
CREATE TABLE orders (
    id              VARCHAR(50) PRIMARY KEY,
    user_id         INT NOT NULL,
    customer_name   VARCHAR(100) NOT NULL,
    address         TEXT NOT NULL,
    phone           VARCHAR(20) NOT NULL,
    kota_id         INT,
    kota            VARCHAR(100),
    ongkir          INT DEFAULT 0,
    subtotal        DECIMAL(12,0) NOT NULL DEFAULT 0,
    total_amount    DECIMAL(12,0) NOT NULL DEFAULT 0,
    status          ENUM('pending','paid','processing','shipped','delivered','cancelled') DEFAULT 'paid',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== TABEL ORDER_ITEMS ====================
CREATE TABLE order_items (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    order_id        VARCHAR(50) NOT NULL,
    product_id      INT,
    product_name    VARCHAR(200) NOT NULL,
    product_image   TEXT,
    price           DECIMAL(12,0) NOT NULL,
    quantity        INT NOT NULL DEFAULT 1,
    subtotal        DECIMAL(12,0) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== DATA KOTA ====================
INSERT INTO kota (id, nama, ongkir) VALUES
(1, 'Jakarta',    15000),
(2, 'Bandung',    20000),
(3, 'Surabaya',   25000),
(4, 'Yogyakarta', 22000),
(5, 'Semarang',   18000),
(6, 'Medan',      35000),
(7, 'Bali',       40000),
(8, 'Makassar',   45000);

-- ==================== DATA PRODUK ====================
INSERT INTO products (name, category, price, image, rating, stock, weight, description) VALUES
('Urban Hoodie Premium', 'Clothing',    499000, 'https://picsum.photos/id/20/400/400', 4.8, 25, 500, 'Hoodie premium dengan bahan cotton combed 30s, nyaman dipakai sehari-hari'),
('Slim Fit Jeans',       'Clothing',    359000, 'https://picsum.photos/id/21/400/400', 4.5, 40, 400, 'Jeans slim fit dengan bahan denim stretch berkualitas tinggi'),
('Running Shoes Pro',    'Footwear',    789000, 'https://picsum.photos/id/22/400/400', 4.9, 15, 600, 'Sepatu lari profesional dengan teknologi cushioning terbaru'),
('Smart Watch X1',       'Accessories', 1250000,'https://picsum.photos/id/23/400/400', 4.7, 10, 200, 'Smartwatch fitur lengkap: monitor jantung, GPS, notifikasi HP'),
('Backpack Explorer',    'Bags',        649000, 'https://picsum.photos/id/24/400/400', 4.6, 30, 800, 'Tas backpack anti air kapasitas 30L, cocok untuk traveling'),
('Cotton T-Shirt',       'Clothing',    149000, 'https://picsum.photos/id/25/400/400', 4.4, 50, 200, 'Kaos cotton 100% combed 30s, adem dan nyaman'),
('Sunglasses Retro',     'Accessories', 299000, 'https://picsum.photos/id/26/400/400', 4.3, 20, 150, 'Kacamata retro UV400 protection, desain stylish'),
('Leather Wallet',       'Accessories', 219000, 'https://picsum.photos/id/27/400/400', 4.5, 35, 100, 'Dompet kulit asli sapi, slim design dengan banyak slot kartu');

-- CATATAN: Akun admin dibuat via: node reset-admin.js

SET FOREIGN_KEY_CHECKS = 1;
