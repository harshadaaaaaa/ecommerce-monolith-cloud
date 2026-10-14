# ShopNest Ecommerce | Monolithic Architecture

A small, polished ecommerce demo built with **Node.js + Express**. The storefront, product API, cart logic, and order logic run inside one application/server, which demonstrates a monolithic architecture.

## Features
- Responsive storefront with product categories, search, sorting, and favourites
- Shopping cart with quantity controls and item removal
- Demo checkout and order confirmation
- REST API for products, cart, and orders
- No database or payment gateway required for this lab demo; data resets when the server restarts

## Run locally
1. Install Node.js 18 or newer.
2. Open a terminal in this folder (the folder containing `package.json`).
3. Run:
   ```bash
   npm install
   npm start
   ```
4. Open **http://localhost:3000**.

## Main API routes
- `GET /api/products`
- `GET /api/cart`
- `POST /api/cart` with `{ "productId": "p1" }`
- `PATCH /api/cart/:id` with `{ "delta": 1 }`
- `DELETE /api/cart/:id`
- `POST /api/orders` with customer name, email, and address

## Architecture
`Browser → One Express application → Product + Cart + Order logic`

## Academic demo notice
Checkout is simulated. No real payment is processed, and data is held in memory only.
