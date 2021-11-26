const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId

const port = process.env.PORT || 5000

// middeleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n4s0u.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri)

async function run() {
    try {
        await client.connect();
        const database = client.db('pixel-house')
        const userCollection = database.collection('users')
        const productsCollection = database.collection('products');
        const orderCollection = database.collection('orders');
        const reviewCollection = database.collection('reviews')

        // user & admin
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            console.log(result);
            res.json(result)
        });
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        app.get('/users/admin', async (req, res) => {

            // console.log(req.query)
            const admin = req.query;
            const cursor = userCollection.find(admin);
            const order = await cursor.toArray();
            res.json(order)
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;

            }
            res.json({ admin: isAdmin })
        });



        // products

        app.post('/products', async (req, res) => {
            const product = req.body;
            // console.log('hit aoi', product)
            const result = await productsCollection.insertOne(product);
            res.json(result)
        });


        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const product = await cursor.toArray();
            res.json(product);
        })
        // load single product

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query)
            res.json(product);
        })


        // order  

        app.post('/orders', async (req, res) => {
            const order = req.body;
            order.createdAt = new Date();
            const result = await orderCollection.insertOne(order);
            res.json(result)
        });

        app.get('/orders', async (req, res) => {
            let query = {};
            // console.log(req.query)
            const email = req.query.email;
            if (email) {
                query = { email: email };
            }
            const cursor = orderCollection.find(query);
            const order = await cursor.toArray();
            res.json(order)
        })
        // total order admin

        app.get('/orders', async (req, res) => {

            // console.log(req.query)
            const email = req.query;
            const cursor = orderCollection.find(email);
            const order = await cursor.toArray();
            res.json(order)
        })

        // delete
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('deleteing id ', id)
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);

            res.json(result)
        })

        // review

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            review.createdAt = new Date();
            const result = await reviewCollection.insertOne(review);
            res.json(result)
        });

        app.get('/reviews', async (req, res) => {
            let query = {};
            // console.log(req.query)
            const email = req.query.email;
            if (email) {
                query = { email: email };
            }
            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            res.json(review)
        });







    }
    finally {
        // await client.close()
    }

}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Hello pixel house!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})