
const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');


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

const singleEvent = async eventId => {
    try {
        const event = await Event.findById(eventId);
        return {
            ...event._doc,
            _id: event.id,
            creator: user.bind(this, event.creator)
        };
    }
    catch (err) {
        throw err;
    }
}

module.exports = {
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

    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return {
                    ...booking._doc,
                    _id: booking.id,
                    user: user.bind(this, booking._doc.user),
                    event: singleEvent.bind(this, booking._doc.event),
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updatedAt: new Date(booking._doc.updatedAt).toISOString(),
                }
            })
        } catch (err) {

        }
    },

    createEvent: (args) => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(),
            creator: '5c3bf4148e00c74248b18c25'
        });
        let createdEvent;

        return event
            .save()
            .then(result => {
                createdEvent = { ...result._doc, _id: result._doc._id.toString(), creator: user.bind(this, result._doc.creator) };
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
    },

    bookEvent: async args => {
        const fetchedEvent = await Event.findOne({ _id: args.eventId });
        console.log("fetchedEvent:" + fetchedEvent);
        const booking = new Booking({
            user: '5c23021be96846189c68cdae',
            event: fetchedEvent
        });

        const result = await booking.save();
        console.log("result:" + result);

        return {
            ...result._doc,
            _id: result.id,
            user: user.bind(this, booking._doc.user),
            event: singleEvent.bind(this, booking._doc.event),
            createdAt: new Date(result._doc.createdAt).toISOString(),
            updatedAt: new Date(result._doc.updatedAt).toISOString(),
        };

    }
};