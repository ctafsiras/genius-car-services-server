const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 4000;

app.use(cors())
app.use(express.json())

function verifyJWT(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) {

        return res.status(401).send({ message: 'UnAuth Access' })

    }
    const token = auth.split(' ')[1];
    jwt.verify(token, process.env.JWT_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded;
        next()
    })

    
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jubia.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const servicesCollection = client.db("geniusCarServices").collection("services");
        const orderCollection = client.db('geniusCarServices').collection('order');

        //auth
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.JWT_TOKEN, {
                expiresIn: '1d'
            })
            res.send({ accessToken })
        })


        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);

        })

        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const service = await servicesCollection.findOne(filter);
            res.send(service)
        })

        //post data

        app.post('/services', async (req, res) => {
            const data = req.body;
            const service = await servicesCollection.insertOne(data)
            res.send(service)
        })

        //dlt data
        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await servicesCollection.deleteOne(query)
            res.send(result)
        })

        // order load from api server

        app.get('/orders', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (decodedEmail === email) {
                const query = { email };
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders)
            } else {
                res.status(403).send({ message: 'Forbidden Access' })
            }
        })

        // Order api to post server

        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result)
        })

    }
    finally {

    }
}

run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Genius Car Server')
})

app.listen(port, () => {
    console.log("Port connected");
})

