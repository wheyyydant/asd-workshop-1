/**
 * In-memory cache store
 * Key: Request URL (e.g. '/products', '/products/1')
 * Value: { data: any, createdAt: number }
 */
const cacheStore = new Map();

// Default Time-To-Live (TTL) is 1 minute (60,000 milliseconds)
const DEFAULT_TTL_MS = 60 * 1000;
let currentTTL = DEFAULT_TTL_MS;

/**
 * Caching middleware for Express routes.
 * Checks if a cached response exists and is within TTL.
 * If HIT: returns cached data with header X-Cache: HIT.
 * If MISS: fetches fresh data, sets header X-Cache: MISS, and stores result in cache with creation timestamp.
 */
function cacheMiddleware(req, res, next) {
    if (req.method !== 'GET') {
        return next();
    }

    const key = req.originalUrl || req.url;
    const cachedEntry = cacheStore.get(key);
    const now = Date.now();

    if (cachedEntry) {
        const age = now - cachedEntry.createdAt;
        if (age < currentTTL) {
            // Valid cache HIT
            res.setHeader('X-Cache', 'HIT');
            return res.json(cachedEntry.data);
        } else {
            // Expired entry - remove stale data
            cacheStore.delete(key);
        }
    }

    // Cache MISS - Set header and intercept res.json to store fresh value
    res.setHeader('X-Cache', 'MISS');

    const originalJson = res.json.bind(res);
    res.json = function (body) {
        // Cache only successful responses (2xx) with non-empty content
        if (res.statusCode >= 200 && res.statusCode < 300 && body !== null && body !== undefined) {
            cacheStore.set(key, {
                data: body,
                createdAt: Date.now()
            });
        }
        return originalJson(body);
    };

    next();
}

/**
 * Invalidates all cache entries that may contain stale data.
 */
function invalidateCache() {
    cacheStore.clear();
}

/**
 * Helper to get current cache size or entries (useful for inspection/debugging)
 */
function getCacheStore() {
    return cacheStore;
}

/**
 * Helper to configure TTL if needed (e.g., for testing expiration)
 */
function setTTL(ttlMs) {
    currentTTL = ttlMs;
}

/**
 * Helper to reset TTL back to default 1 minute
 */
function resetTTL() {
    currentTTL = DEFAULT_TTL_MS;
}

module.exports = {
    cacheMiddleware,
    invalidateCache,
    getCacheStore,
    setTTL,
    resetTTL,
    DEFAULT_TTL_MS
};
