module.exports = {
    ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 8500,
    URL: process.env.BASE_URL || 'http://localhost:8500',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://master:1qaz!QAZ@ds037508.mlab.com:37508/graphql-express-reactjs-project',
    JWT_SECRET: process.env.JWT_SECRET || 'secret1',
}