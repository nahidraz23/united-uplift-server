const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5300
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')

// Middleware
app.use(express.json())
app.use(cors( {
  origin:[
    'united-uplift.web.app',
    'united-uplift.firebaseapp.com'
  ]
}))
app.use(cookieParser())

//Local MongoDB server
// const uri = 'mongodb://localhost:27017'

// MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rsj0a3m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

const logger = async (req, res, next) => {
  console.log('Logging info: ', req.method, req.url)
  next()
}

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token

  if (!token) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized' })
    }
    req.user = decoded
    next()
  })
}

async function run () {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    // Web token realted api
    app.post('/jwt', async (req, res) => {
      const user = req.body
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRETE, {
        expiresIn: '1h'
      })
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: false
        })
        .send({ success: true })
    })

    const usersCollection = client.db('unitedUpliftDB').collection('users')
    const volunteersCollection = client
      .db('unitedUpliftDB')
      .collection('volunteers')
    const beVolunteersCollection = client
      .db('unitedUpliftDB')
      .collection('bevolunteer')

    app.get('/volunteers', async (req, res) => {
      let query = {}
      if (req.query?.email) {
        query = { email: req.query?.email }
      }
      const result = await volunteersCollection.find(query).toArray()
      res.send(result)
    })

    app.get('/volunteers/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await volunteersCollection.findOne(query)
      res.send(result)
    })

    app.get('/users', async (req, res) => {
      let query = {}
      if (req.query?.email) {
        query = { email: req.query?.email }
      }
      const cursor = usersCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/bevolunteer', async (req, res) => {
      let query = {}

      if (req.query?.volunteerEmail) {
        query = { volunteerEmail: req.query?.volunteerEmail }
      }
      const result = await beVolunteersCollection.find(query).toArray()
      res.send(result)
    })

    app.post('/users', async (req, res) => {
      const user = req.body
      const result = await usersCollection.insertOne(user)
      res.send(result)
    })

    app.post('/volunteers', async (req, res) => {
      const volunteer = req.body
      const result = await volunteersCollection.insertOne(volunteer)
      res.send(result)
    })

    app.post('/bevolunteer', async (req, res) => {
      const volunteer = req.body
      const result = await beVolunteersCollection.insertOne(volunteer)
      res.send(result)
    })

    app.get('/updatepage/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await volunteersCollection.findOne(query)
      res.send(result)
    })

    app.put('/volunteers/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const updatedVolunteer = req.body

      const volunteer = {
        $set: {
          thumbnail: updatedVolunteer.thumbnail,
          title: updatedVolunteer.title,
          category: updatedVolunteer.category,
          location: updatedVolunteer.location,
          noOfVolunteer: updatedVolunteer.noOfVolunteer,
          deadline: updatedVolunteer.deadline,
          email: updatedVolunteer.email,
          name: updatedVolunteer.name,
          description: updatedVolunteer.description
        }
      }
      const result = await volunteersCollection.updateOne(filter, volunteer)
      res.send(result)
    })

    app.put('/bevolunteer/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const result = await beVolunteersCollection.updateOne(filter, {
        $inc: { noOfVolunteer: -1, noOfVolunteer: -1 }
      })
      res.send(result)
    })

    // My volunteer post delete api
    app.delete('/volunteers/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await volunteersCollection.deleteOne(query)
      res.send(result)
    })

    // Be volunteer request delete api
    app.delete('/bevolunteer/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await beVolunteersCollection.deleteOne(query)
      res.send(result)
    })

    // await client.db("admin").command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('United uplift server is running')
})

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})
