const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');

const config = require('./config');
const mongoose = require('mongoose');


const graphQLResolver = require('./graphql/resolvers/index');
const graphQLSchema = require('./graphql/schema/index');


const app = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema: graphQLSchema,
    rootValue: graphQLResolver,
    graphiql: true
}));

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true }).then(() => {
    console.log('db connection established');
    app.listen(config.PORT);
}).catch(err = () => {
    console.log(err);
});



