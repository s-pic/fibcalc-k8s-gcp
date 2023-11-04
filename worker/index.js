const redisSettings = require('./redisSettings');
const redis = require('redis');

const redisClient = redis.createClient({
    host: redisSettings.redisHost,
    port: redisSettings.redisPort,
    retry_strategy: () => 1_000
});
const sub = redisClient.duplicate();

const cache = {}
/**
 * 0, 1, 1, 2, 3, 5, 8, 13, 21, ...
 */
function getFibAtIndex(idx) {
    if (idx <= 1) {
        return idx
    }

    const cacheHit = cache[idx]

    if (cacheHit) {
        return cacheHit
    }

    const n1 = idx - 1
    const n2 = idx - 2
    const result = getFibAtIndex(n2) + getFibAtIndex(n1)
    cache[idx] = result
    return result
}

sub.on('message', (channel, messageAsString) => {
    const indexForFibCalc = messageAsString
    const parsedIndex = parseInt(messageAsString);
    const fibForIndex = getFibAtIndex(parsedIndex);
    redisClient.hset('values', indexForFibCalc, fibForIndex)
})
sub.subscribe('insert');