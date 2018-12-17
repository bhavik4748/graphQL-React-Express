const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const config = require('./config');
const mongoose = require('mongoose');

const Event = require('./models/event')

const app = express();



app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`

    type Event {
        _id:ID!
        title:String!
        description:String!
        price:Float!
        date:String!
    }

    input EventInput {
        title:String!
        description:String!
        price:Float!
        date:String!
    }

    type RootQuery{
        events:[ Event!]!
    }

    type RootMutation{
        createEvent(eventInput:EventInput):Event
    }


    schema{
        query:RootQuery
        mutation:RootMutation
    }
    `),
    rootValue: {
        events: () => {
            return Event.find().then(result => {
                return result.map(res => {
                    var t = res.date;
                    t = new Date(t).toLocaleString();
                    return { ...res._doc, _id: res._doc._id.toString(), date: t };
                })
            }).catch(err => { throw err; });
        },
        createEvent: (args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date()
            });

            return event.save().then(result => {
                console.log(result);
                return { ...result._doc, _id: result._doc._id.toString() };
            }).catch(err => {
                console.log(err);
                throw err;
            });

            //console.log(event);
            //events.push(event);
            return event;
        }
    },
    graphiql: true
}));

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true }).then(() => {
    console.log('db connection established');
    app.listen(config.PORT);
}).catch(err = () => {
    console.log(err);
});



