const env = process.env;

const redisHostFromEnv = env.REDIS_HOST;
const redisPortFromEnv = env.REDIS_PORT;
if (!redisHostFromEnv || !redisPortFromEnv) {
    throw new Error('REDIS_HOST and REDIS_PORT must be set in the environment');
}

const pgUser = env.PGUSER;
const pgHost = env.PGHOST;
const pgDatabase = env.PGDATABASE;
const pgPassword = env.PGPASSWORD;
const pgPort = env.PGPORT;

if (!pgUser || !pgHost || !pgDatabase || !pgPassword || !pgPort) {
    throw new Error('PGUSER, PGHOST, PGDATABASE, PGPASSWORD, and PGPORT ' +
        'must be set in the environment');
}

module.exports = {
    redisHost: redisHostFromEnv,
    redisPort: redisPortFromEnv,
    pgUser,
    pgHost,
    pgDatabase,
    pgPassword,
    pgPort,
}