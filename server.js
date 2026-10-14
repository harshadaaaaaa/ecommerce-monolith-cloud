const express = require('express');
const path = require('path');
const products = require('./products.json');
const app = express();
const PORT = process.env.PORT || 3000;
let cart = [];
let orders = [];
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/health', (_req, res) => res.json({status:'ok', architecture:'monolithic'}));
app.get('/api/products', (_req, res) => res.json(products));
app.get('/api/cart', (_req, res) => res.json(cart));
app.post('/api/cart', (req, res) => {
  const product = products.find(p => p.id === req.body.productId);
  if (!product) return res.status(404).json({error:'Product not found'});
  const existing = cart.find(item => item.id === product.id);
  if (existing) existing.quantity += 1; else cart.push({...product, quantity:1});
  res.status(201).json(cart);
});
app.patch('/api/cart/:id', (req, res) => {
  const item = cart.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({error:'Cart item not found'});
  item.quantity += Number(req.body.delta || 0);
  if (item.quantity <= 0) cart = cart.filter(i => i.id !== req.params.id);
  res.json(cart);
});
app.delete('/api/cart/:id', (req, res) => { cart = cart.filter(i => i.id !== req.params.id); res.json(cart); });
app.post('/api/orders', (req, res) => {
  if (!cart.length) return res.status(400).json({error:'Your bag is empty'});
  const order = {orderId:'SN-' + Date.now().toString().slice(-6), customer:{name:req.body.name,email:req.body.email,address:req.body.address}, items:cart.map(i=>({...i})), total:cart.reduce((sum,i)=>sum+i.price*i.quantity,0), createdAt:new Date().toISOString()};
  orders.push(order); cart=[]; res.status(201).json(order);
});
app.listen(PORT, () => console.log(`ShopNest monolith running at http://localhost:${PORT}`));
