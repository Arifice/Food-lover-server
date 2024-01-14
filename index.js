const express = require('express');
const cors = require('cors');
const app=express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port=process.env.PORT || 5000;

// middlewaire
app.use(cors());
app.use(express.json());

require('dotenv').config();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.meaty0s.mongodb.net/?retryWrites=true&w=majority`;

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

     const serviceCollection=client.db('FoodLover').collection('services');
     const teamCollection=client.db('FoodLover').collection('team');
     const orderCollection=client.db('FoodLover').collection('order');

     app.get('/services',async(req,res)=>{
        const result=await serviceCollection.find().toArray();
        res.send(result);
     })
     app.post('/services',async(req,res)=>{
      const newService=req.body;
      console.log('added service',newService);
      const result=await serviceCollection.insertOne(newService);
      res.send(result);
     })
     app.get('/services/:id',async(req,res)=>{
      const id=req.params;
      const query={_id: new ObjectId(id)};
      const result=await serviceCollection.findOne(query);
      res.send(result);
     })
     app.post('/order',async(req,res)=>{
      const newOrder=req.body;
      console.log('new order',newOrder);
      const result=await orderCollection.insertOne(newOrder);
      res.send(result);
     })
     app.get('/order',async(req,res)=>{
      const result=await orderCollection.find().toArray();
      res.send(result);
     })
     app.get('/order/:id',async(req,res)=>{
      const id=req.params;
      const query={_id:new ObjectId(id)};
      const result=await orderCollection.findOne(query);
      res.send(result);
     })
     app.delete('/order/:id',async(req,res)=>{
      const id=req.params;
      const query={_id:new ObjectId(id)};
      const result=await orderCollection.deleteOne(query);
      res.send(result);
     })
     app.patch('/order/:id',async(req,res)=>{
      const updatedorders=req.body;
      const id=req.params.id;
      const query={_id: new ObjectId(id)};
      const updateDoc = {
        $set: {
          status: updatedorders.status
        }
      };
      const result=await orderCollection.updateOne(query,updateDoc);
        res.send(result);
      })
     app.get('/team',async(req,res)=>{
        const result=await teamCollection.find().toArray();
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


app.get('/',(req,res)=>{
    res.send('Food Lover is running');
})
app.listen(port,()=>{
    console.log(`Food Lover server is running on port ${port}`);
})