const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('BRAIN BLAST IS RUNNING!')
  })
  
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.80g5an4.mongodb.net/?retryWrites=true&w=majority`;

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
    //  await client.connect();
    const database = client.db("brainBlastDB");
    const brainBlastCollections = database.collection("brainBlast");
    
    // create data
    app.post('/addToy',async(req,res)=>{
      const body = req.body;
      const result = await brainBlastCollections.insertOne(body);
      res.send(result)
      console.log(body)
    })    
    // get data
    app.get('/allToys',async(req,res)=>{
      const totalCount = await brainBlastCollections.countDocuments();
      let limit = totalCount;
      if (limit > 20) {
        limit = 20;
      }

      const cursor = brainBlastCollections.find().limit(limit);
      const result = await cursor.toArray();
      res.send(result);
    })
    // read data according to specific id
    app.get('/allToys/:id',async(req,res)=>{
      const id = req.params.id;
      console.log(id);
      const query = {_id: new ObjectId(id)}
      const result = await brainBlastCollections.findOne(query,);
      res.send(result)
    })
    // read data according to current user
    app.get('/allToys', async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      
      const searchQuery = req.query?.search;
      if (searchQuery) {
        query.name = { $regex: searchQuery, $options: 'i' };
      }
    
      const sortDirection = req.query?.sort === 'desc' ? -1 : 1;
      const cursor = brainBlastCollections.find(query).sort({ price: sortDirection });
        const result = await cursor.toArray();
        res.send(result);
      
    });
    
    
    

    // Delete Data API
    app.delete('/allToys/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await brainBlastCollections.deleteOne(query);
      res.send(result)
    })
    // filter data for specific category
    app.get('/allToysCategory/:text',async(req,res)=>{
      const text = req.params.text;
      console.log(req.params.text);
      if(req.params.text =="Math"||req.params.text == "Science"|| req.params.text == "Language"){
        const result = await brainBlastCollections
        .find({category :req.params.text})
        .toArray();
        return res.send(result)
      }
    });
    // sorting
    app.get('')
    
    // update API
    app.put('/allToys/:id',async(req,res)=>{
      const id =req.params.id;
      const filter ={_id: new ObjectId(id)}
      const options ={upsert:true}
      const updatedToy = req.body;
      const update = {
        $set:{
          name:updatedToy.name,
          quantity:updatedToy.quantity,
          price:updatedToy.price,
          rating:updatedToy.rating,
          category:updatedToy.category,
          description:updatedToy.description,
          photo:updatedToy.photo
        }
      }
      const result = await brainBlastCollections.updateOne(filter,update,options)
      res.send(result)
    })
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.log);

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })