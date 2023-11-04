const redisHostFromEnv = process.env.REDIS_HOST;
const redisPortFromEnv = process.env.REDIS_PORT;
if (!redisHostFromEnv || !redisPortFromEnv) {
    throw new Error('REDIS_HOST and REDIS_PORT must be set in the environment');
}
module.exports = {
    redisHost: redisHostFromEnv,
    redisPort: redisPortFromEnv
}