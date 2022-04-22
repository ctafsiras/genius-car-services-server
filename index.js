const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 4000;

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jubia.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const servicesCollection = client.db("geniusCarServices").collection("services");

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

        app.post('/services', async(req, res)=>{
            const data=req.body;
            const service=await servicesCollection.insertOne(data)
            res.send(service)
        })

        //dlt data
        app.delete('/service/:id', async (req, res)=>{
            const id=req.params.id;
            const query={_id: ObjectId(id)}
            const result=await servicesCollection.deleteOne(query)
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

