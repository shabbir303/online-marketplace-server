const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);
// mongodb

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3xfyiqs.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
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

    await client.connect();

    const categoriesCollection = client.db('categories').collection('categoriesCollection');
    const jobCollection = client.db('jobs').collection('jobCollection');
    const userCollection = client.db('users').collection('userCollection');
    const bidCollection = client.db('bids').collection('bidCollection');

    // user collection
    app.post('/users', async (req, res) => {
      const addUser = req.body;
      console.log(addUser);
      const result = await userCollection.insertOne(addUser);
      res.send(result);
    })
    app.get('/users', async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // Bid collection
    app.post('/bids', async (req, res) => {
      const addBid = req.body;
      console.log(addBid);
      const result = await bidCollection.insertOne(addBid);
      res.send(result);
    })

    app.get('/bids', async (req, res) => {
      const cursor = bidCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })



    // categories
    app.get('/categories', async (req, res) => {
      const cursor = categoriesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // jobCollection
    app.post('/jobs', async (req, res) => {
      const addJobs = req.body;
      console.log(addJobs);
      const result = await jobCollection.insertOne(addJobs);
      res.send(result);
    })

    app.get('/jobs', async (req, res) => {
      const cursor = jobCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/jobs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const cursor = await jobCollection.findOne(query);
      res.send(cursor);
    })

    app.put('/jobs/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updateJobValues = req.body;
      const Jobs = {
        $set: {
          title: updateJobValues.title,
          deadline: updateJobValues.dedline,
          category: updateJobValues.category,
          description: updateJobValues.description,
          minPrice: updateJobValues.minPrice,
          maxPrice: updateJobValues.maxPrice,
        }
      }
      const result = await jobCollection.updateOne(query, Jobs,option);
      res.send(result);
    })

    app.delete('/jobs/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    })

    app.put('/updateStatus/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { newStatus } = req.body;
    
        // Validate newStatus (optional)
    
        // Find and update the document
        const updatedDocument = await bidCollection.updateOne(
           {id:new ObjectId(id)},
          { $set: { status: newStatus } },
          // { new: true } // Return the modified document
        );
    
        if (!updatedDocument) {
          return res.status(404).json({ error: 'Document not found' });
        }
    
        res.json(updatedDocument);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Marketplace app running');
})

app.listen(port, () => {
  console.log(`Marketplace server is running on port: ${port}`)
})
