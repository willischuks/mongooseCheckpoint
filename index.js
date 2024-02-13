const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const personSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: Number,
    favoriteFoods: { type: [String], default: [] },
});

const Person = mongoose.model('Person', personSchema);

const app = express();

app.use(express.json()); // Parse incoming request bodies as JSON

const database = () => {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

database();

const arrayOfPeople = [
    new Person({
        name: 'John',
        age: 30,
        favoriteFoods: ['pizza', 'burger'],
    }),
    new Person({
        name: 'Jane',
        age: 25,
        favoriteFoods: ['sushi', 'pasta'],
    }),
];

app.post('/people', async (req, res) => {
    const person = new Person(req.body);
    try {
        await person.save();
        res.status(201).send(person);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.post('/people/many', async (req, res) => {
    try {
        const people = await Person.create(req.body);
        res.status(201).send(people);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get('/people/:id', async (req, res) => {
    try {
        const person = await Person.findById(req.params.id);
        if (!person) {
            return res.status(404).send("Person not found");
        }
        res.send(person);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/people/food/:food', async (req, res) => {
    try {
        const person = await Person.findOne({ favoriteFoods: req.params.food });
        if (!person) {
            return res.status(404).send("Person not found with specified favorite food");
        }
        res.send(person);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.put('/people/:id', async (req, res) => {
    try {
        const person = await Person.findById(req.params.id);
        person.favoriteFoods.push('hamburger');
        await person.save();
        res.send(person);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.put('/people/name/:name', async (req, res) => {
    try {
        const person = await Person.findOneAndUpdate({ name: req.params.name }, { age: 20 }, { new: true });
        res.send(person);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.delete('/people/:id', async (req, res) => {
    try {
        const person = await Person.findByIdAndRemove(req.params.id);
        res.send(person);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.delete('/people/name/:name', async (req, res) => {
    try {
        const result = await Person.deleteMany({ name: req.params.name });
        res.status(200).json({ message: `${result.deletedCount} documents deleted` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
