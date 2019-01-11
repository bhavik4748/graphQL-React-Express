const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const config = require('./config');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

app.use(bodyParser.json());

const events = eventIds => {
    return Event.find({ _id: { $in: eventIds } })
        .then(events => {
            return events.map(event => {
                console.log("event: " + event);
                return {
                    ...event._doc,
                    _id: event.id,
                    creator: user.bind(this, event.creator)
                };
            });
        })
        .catch(err => {
            throw err;
        });
}
const user = userId => {
    return User.findById(userId).then(user => {
        console.log(user);
        return {
            ...user._doc,
            _id: user.id,
            createEvents: events.bind(this, user._doc.createEvents)
        }
    }).catch(err => {
        throw err;
    });
};

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`

    type Event {
        _id:ID!
        title:String!
        description:String!
        price:Float!
        date:String!
        creator: User!
    }

    type User{
        _id:ID!
        email:String!
        password: String
        createEvents:[Event]!
    }

    input EventInput {
        title:String!
        description:String!
        price:Float!
        date:String!
    }

    input UserInput{
        email: String!
        password: String!
    }

    type RootQuery{
        events:[ Event!]!
        users:[User!]!
    }

    type RootMutation{
        createEvent(eventInput:EventInput):Event
        createUser(userInput: UserInput):User
    }


    schema{
        query:RootQuery
        mutation:RootMutation
    }
    `),
    rootValue: {
        events: () => {
            return Event.find()
                .then(result => {
                    return result.map(res => {
                        var t = res.date;
                        t = new Date(t).toLocaleString();
                        return {
                            ...res._doc,
                            _id: res._doc._id.toString(),
                            date: t,
                            creator: user.bind(this, res._doc.creator)
                        };
                    })
                }).catch(err => { throw err; });
        },

        users: () => {
            return User.find()
                .populate('createEvents')
                .then(result => {
                    console.log(result);
                    return result.map(res => {
                        return { ...res._doc, _id: res._doc._id.toString(), password: null }
                    })
                }).catch(err => { throw err; });
        },

        createEvent: (args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(),
                creator: '5c23021be96846189c68cdae'
            });
            let createdEvent;

            return event
                .save()
                .then(result => {
                    createdEvent = { ...result._doc, _id: result._doc._id.toString() };
                    return User.findById('5c23021be96846189c68cdae');
                })
                .then(user => {
                    if (!user) {
                        throw new Error('User not found error');
                    }
                    console.log('user found=', user);
                    user.createEvents.push(event);
                    return user.save();
                })
                .then(result => {
                    return createdEvent;
                })
                .catch(err => {
                    throw err;
                });

            //console.log(event);
            //events.push(event);
            return event;
        },

        createUser: args => {
            return User.findOne({ email: args.userInput.email })
                .then(user => {
                    if (user) {
                        throw new Error('user exists already');
                    }
                    return bcrypt
                        .hash(args.userInput.password, 12)
                }).then(hashedPassword => {
                    const user = new User({
                        email: args.userInput.email,
                        password: hashedPassword
                    })
                    return user.save();
                }).then(result => {
                    return { ...result._doc, password: null, _id: result.id };
                })
                .catch(err => {
                    throw err;
                });
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



