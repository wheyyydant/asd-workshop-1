const productService = require('../services/productService');
const { invalidateCache } = require('../middleware/cacheMiddleware');

/**
 * Controller layer handling HTTP requests and responses for products
 */
class ProductController {
    /**
     * GET /products
     * Retrieves all products
     */
    async getAllProducts(req, res) {
        try {
            const products = await productService.getAllProducts();
            res.json(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * GET /products/:id
     * Retrieves a single product by ID
     */
    async getProductById(req, res) {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        try {
            const product = await productService.getProductById(id);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json(product);
        } catch (error) {
            console.error(`Error fetching product ${id}:`, error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * POST /products
     * Creates a new product and invalidates cache
     */
    async createProduct(req, res) {
        try {
            const newProduct = await productService.createProduct(req.body);
            // Invalidate cache upon successful data modification
            invalidateCache();
            res.status(201).json(newProduct);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * PUT /products/:id or PATCH /products/:id
     * Updates an existing product and invalidates cache
     */
    async updateProduct(req, res) {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        try {
            const updatedProduct = await productService.updateProduct(id, req.body);
            if (!updatedProduct) {
                return res.status(404).json({ error: 'Product not found' });
            }
            // Invalidate cache upon successful data modification
            invalidateCache();
            res.json(updatedProduct);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * DELETE /products/:id
     * Deletes a product by ID and invalidates cache
     */
    async deleteProduct(req, res) {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        try {
            const deletedProduct = await productService.deleteProduct(id);
            if (!deletedProduct) {
                return res.status(404).json({ error: 'Product not found' });
            }
            // Invalidate cache upon successful data modification
            invalidateCache();
            res.json({
                message: 'Product deleted successfully',
                product: deletedProduct
            });
        } catch (error) {
            console.error(`Error deleting product ${id}:`, error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = new ProductController();
