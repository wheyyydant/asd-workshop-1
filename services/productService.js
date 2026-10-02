const productDb = require('../database/productDb');

/**
 * Service layer handling business logic for products
 */
class ProductService {
    /**
     * Retrieves all products
     * @returns {Promise<Array>}
     */
    async getAllProducts() {
        return await productDb.readAll();
    }

    /**
     * Retrieves a single product by its ID
     * @param {number} id
     * @returns {Promise<Object|null>}
     */
    async getProductById(id) {
        return await productDb.findById(id);
    }

    /**
     * Creates a new product
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    async createProduct(data) {
        if (!data.name || data.price === undefined) {
            throw new Error('Name and price are required');
        }
        return await productDb.create({
            name: data.name,
            price: Number(data.price)
        });
    }

    /**
     * Updates an existing product
     * @param {number} id
     * @param {Object} data
     * @returns {Promise<Object|null>}
     */
    async updateProduct(id, data) {
        const updatePayload = {};
        if (data.name !== undefined) {
            updatePayload.name = data.name;
        }
        if (data.price !== undefined) {
            updatePayload.price = Number(data.price);
        }
        return await productDb.update(id, updatePayload);
    }

    /**
     * Deletes a product by its ID
     * @param {number} id
     * @returns {Promise<Object|null>}
     */
    async deleteProduct(id) {
        return await productDb.delete(id);
    }
}

module.exports = new ProductService();
