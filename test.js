const assert = require('assert');
const http = require('http');
const app = require('./server');
const { setTTL, resetTTL } = require('./middleware/cacheMiddleware');

async function runTests() {
    console.log('Starting automated tests...\n');
    const server = http.createServer(app);

    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;

    try {
        // Test 1 & 2: GET /products MISS then HIT
        let res = await fetch(`${baseUrl}/products`);
        let data = await res.json();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.headers.get('x-cache'), 'MISS');
        console.log('✔ Test 1: GET /products initial request returned X-Cache: MISS');

        res = await fetch(`${baseUrl}/products`);
        let cachedData = await res.json();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.headers.get('x-cache'), 'HIT');
        assert.deepStrictEqual(cachedData, data);
        console.log('✔ Test 2: GET /products second request returned X-Cache: HIT');

        // Test 3 & 4: GET /products/1 MISS then HIT
        res = await fetch(`${baseUrl}/products/1`);
        let prod1 = await res.json();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.headers.get('x-cache'), 'MISS');
        console.log('✔ Test 3: GET /products/1 initial request returned X-Cache: MISS');

        res = await fetch(`${baseUrl}/products/1`);
        let prod1Cached = await res.json();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.headers.get('x-cache'), 'HIT');
        assert.deepStrictEqual(prod1Cached, prod1);
        console.log('✔ Test 4: GET /products/1 second request returned X-Cache: HIT');

        // Test 5 & 6: POST /products invalidates cache
        res = await fetch(`${baseUrl}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Webcam', price: 79.99 })
        });
        let newProd = await res.json();
        assert.strictEqual(res.status, 201);
        const createdId = newProd.id;
        console.log(`✔ Test 5: POST /products created item #${createdId}`);

        res = await fetch(`${baseUrl}/products`);
        let updatedList = await res.json();
        assert.strictEqual(res.headers.get('x-cache'), 'MISS');
        assert.ok(updatedList.some(p => p.id === createdId));
        console.log('✔ Test 6: GET /products after POST returned X-Cache: MISS');

        // Test 7 & 8: PUT /products/:id updates and invalidates cache
        res = await fetch(`${baseUrl}/products/${createdId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: '4K Webcam', price: 99.99 })
        });
        let updatedProd = await res.json();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(updatedProd.name, '4K Webcam');
        console.log(`✔ Test 7: PUT /products/${createdId} updated item`);

        res = await fetch(`${baseUrl}/products/${createdId}`);
        assert.strictEqual(res.headers.get('x-cache'), 'MISS');
        console.log('✔ Test 8: GET /products/:id after PUT returned X-Cache: MISS');

        // Test 9 & 10: PATCH & DELETE invalidations
        res = await fetch(`${baseUrl}/products/${createdId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ price: 89.99 })
        });
        assert.strictEqual(res.status, 200);
        console.log(`✔ Test 9: PATCH /products/${createdId} succeeded`);

        res = await fetch(`${baseUrl}/products/${createdId}`, { method: 'DELETE' });
        assert.strictEqual(res.status, 200);
        console.log(`✔ Test 10: DELETE /products/${createdId} succeeded`);

        res = await fetch(`${baseUrl}/products/${createdId}`);
        assert.strictEqual(res.status, 404);
        console.log(`✔ Test 11: GET deleted item returned 404`);

        // Test 12: TTL expiration
        setTTL(100); // 100ms TTL
        res = await fetch(`${baseUrl}/products`);
        assert.strictEqual(res.headers.get('x-cache'), 'MISS');
        res = await fetch(`${baseUrl}/products`);
        assert.strictEqual(res.headers.get('x-cache'), 'HIT');
        await new Promise((r) => setTimeout(r, 150));
        res = await fetch(`${baseUrl}/products`);
        assert.strictEqual(res.headers.get('x-cache'), 'MISS');
        console.log('✔ Test 12: Cache expired after TTL and returned fresh data with X-Cache: MISS');
        resetTTL();

        console.log('\n====================================');
        console.log('All tests passed successfully! 🎉');
        console.log('====================================');
    } finally {
        server.close();
    }
}

runTests().catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
});
