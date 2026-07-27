import express from 'express';
import axios from 'axios';
import db from './db.js';
import { connectToBroker, publishMessage } from './broker.js';

const app = express();
app.use(express.json());

// RabbitMQ
connectToBroker().catch(err => console.error('Broker init error', err));

// Create order
async function createOrder(req, res) {
  try {
    const productId = Number(req.body.productId);
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'Valid productId required' });
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive integer' });
    }

    let product;
    try {
      const productServiceUrl =
        process.env.PRODUCT_SERVICE_URL || 'http://product-service:8002';
      const response = await axios.get(`${productServiceUrl}/${productId}`, {
        timeout: 5000
      });
      product = response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        return res.status(404).json({ error: 'Product not found' });
      }
      console.error('Product service error:', err.message);
      return res.status(502).json({ error: 'Product service unavailable' });
    }

    if (Number(product.stock) < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const result = await db.query(
      `INSERT INTO orders (product_id, quantity, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [productId, quantity, 'PENDING']
    );
    const order = result.rows[0];

    const event = {
      event: 'ORDER_CREATED',
      orderId: order.id,
      productId: product.id,
      productTitle: product.title,
      quantity: order.quantity,
      status: order.status,
      createdAt: order.created_at
    };

    await publishMessage('order.created', event);
    console.log(
      'Published ORDER_CREATED event to RabbitMQ:',
      JSON.stringify(event)
    );

    res.status(201).json(order);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Support both the direct Lab endpoint and the gateway-stripped path.
app.post(['/', '/orders'], createOrder);

// List orders
app.get('/', async (_req, res) => {
  try {
    const r = await db.query('SELECT * FROM orders ORDER BY id DESC');
    res.json(r.rows);
  } catch (err) {
    console.error('List orders error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get order by id
app.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid order id' });
    }
    const r = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = 8003;
app.listen(PORT, () => console.log(`Order Service running on ${PORT}`));
