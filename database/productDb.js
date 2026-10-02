const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'db.json');

/**
 * Database access layer for products stored in db.json
 */
class ProductDatabase {
    /**
     * Reads all products from db.json
     * @returns {Promise<Array>}
     */
    async readAll() {
        try {
            const data = await fs.readFile(DB_PATH, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                await this.writeAll([]);
                return [];
            }
            throw error;
        }
    }

    /**
     * Writes all products to db.json
     * @param {Array} products
     * @returns {Promise<void>}
     */
    async writeAll(products) {
        await fs.writeFile(DB_PATH, JSON.stringify(products, null, 2), 'utf-8');
    }

    /**
     * Finds a product by id
     * @param {number} id
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        const products = await this.readAll();
        return products.find(item => item.id === id) || null;
    }

    /**
     * Creates a new product
     * @param {Object} productData
     * @returns {Promise<Object>}
     */
    async create(productData) {
        const products = await this.readAll();
        const maxId = products.reduce((max, item) => (item.id > max ? item.id : max), 0);
        const newProduct = {
            id: maxId + 1,
            ...productData
        };
        products.push(newProduct);
        await this.writeAll(products);
        return newProduct;
    }

    /**
     * Updates an existing product by id
     * @param {number} id
     * @param {Object} updateData
     * @returns {Promise<Object|null>}
     */
    async update(id, updateData) {
        const products = await this.readAll();
        const index = products.findIndex(item => item.id === id);
        if (index === -1) {
            return null;
        }

        const existingProduct = products[index];
        const updatedProduct = {
            ...existingProduct,
            ...updateData,
            id: existingProduct.id // preserve immutable ID
        };

        products[index] = updatedProduct;
        await this.writeAll(products);
        return updatedProduct;
    }

    /**
     * Deletes a product by id
     * @param {number} id
     * @returns {Promise<Object|null>}
     */
    async delete(id) {
        const products = await this.readAll();
        const index = products.findIndex(item => item.id === id);
        if (index === -1) {
            return null;
        }

        const [deletedProduct] = products.splice(index, 1);
        await this.writeAll(products);
        return deletedProduct;
    }
}

module.exports = new ProductDatabase();
