const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5300;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rsj0a3m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();
    // Send a ping to confirm a successful connection

    const usersCollection = client.db("unitedUpliftDB").collection("users");
    const volunteersCollection = client.db("unitedUpliftDB").collection("volunteers");
    const beVolunteersCollection = client.db("unitedUpliftDB").collection("bevolunteer");

    app.get('/volunteers', async(req, res) => {
        const result = await volunteersCollection.find().toArray();
        res.send(result);
    })

    app.get('/volunteers/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await volunteersCollection.findOne(query);
        res.send(result);
    })

    app.get('/users', async(req, res) =>{
        let query = {};

        if(req.query?.email){
            query = {email : req.query?.email}
        }
        const cursor = usersCollection.find(query);
        const result = await cursor.toArray();
        res.send(result)
    })

    app.get('/bevolunteer', async(req, res) => {
        const result = await beVolunteersCollection.find().toArray();
        res.send(result);
    })

    app.post('/users', async(req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.send(result);
    })

    app.post('/volunteers', async(req, res) => {
        const volunteer = req.body;
        const result = await volunteersCollection.insertOne(volunteer)
        res.send(result)
    })

    app.post('/bevolunteer', async(req, res) => {
        const volunteer = req.body;
        const result = await beVolunteersCollection.insertOne(volunteer);
        res.send(result);
    })

    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("United uplift server is running");
}) 

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
})