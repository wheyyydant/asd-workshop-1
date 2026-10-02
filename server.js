const express = require('express');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use('/products', productRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Product API with Caching Middleware',
        endpoints: {
            'GET /products': 'List all products (cached, 1 min TTL)',
            'GET /products/:id': 'Get product by ID (cached, 1 min TTL)',
            'POST /products': 'Create a product (invalidates cache)',
            'PUT /products/:id': 'Update a product (invalidates cache)',
            'PATCH /products/:id': 'Partially update a product (invalidates cache)',
            'DELETE /products/:id': 'Delete a product (invalidates cache)'
        }
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start server only if executed directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;

