exports.redisConfig = {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_SVC,
    redisOptions: {
        parser: 'javascript'
    }
}
//,password: process.env.REDIS_PASSWORD