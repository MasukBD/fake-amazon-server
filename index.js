const express = require('express');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors');

// middle ware 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.sc5cufk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect();


        const productCollection = client.db('fakeAmazonDB').collection('products');

        // get all products
        app.get('/products', async (req, res) => {
            const page = parseInt(req.query.page) || 0;
            const limit = parseInt(req.query.limit) || 12;
            const skip = page * limit;
            const result = await productCollection.find().skip(skip).limit(limit).toArray();
            res.send(result);
        });

        // get total number of products 
        app.get('/productCount', async (req, res) => {
            const result = await productCollection.estimatedDocumentCount();
            res.send({ totalProducts: result });
        });

        app.post('/cartProducts', async (req, res) => {
            const cartItemsId = req.body;
            const object_Id = cartItemsId.map(item => new ObjectId(item));
            const query = { _id: { $in: object_Id } };
            const result = await productCollection.find(query).toArray();
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello From Fake Amazon Web store!')
})

app.listen(port, () => {
    console.log(`Amazon Web Store running at Port: ${port}`)
})