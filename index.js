const express = require('express');
const cors = require('cors');
const jwt=require('jsonwebtoken');
const cookieParser=require('cookie-parser');
const app=express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port=process.env.PORT || 5000;

// middlewaire
app.use(cors({
  origin:[
    'https://food-lover-client.web.app',
    'https://food-lover-client.firebaseapp.com',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials:true
}));
app.use(express.json());
app.use(cookieParser());

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



// middlewire 
const logger=async(req,res,next)=>{
  console.log('called : ',req.host,req.url);
  next();
}

const verifyToken=async(req,res,next)=>{
  const token=req.cookies?.token;
  console.log('value of token in middile waire',token);
  if(!token){
    return res.status(401).send({message:'Un Authorized'});
  }
  jwt.verify(token,process.env.ACCESS_TOKEN,(error,decoded)=>{
    if(error){
      return res.status(401).send({message:'Un Athorized'});
    }
    console.log('value of decoded in the verify',decoded);
    req.user=decoded;
    next();
  })
  
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
     client.connect();

     const serviceCollection=client.db('FoodLover').collection('services');
     const teamCollection=client.db('FoodLover').collection('team');
     const orderCollection=client.db('FoodLover').collection('order');
     
     
     
     // auth related api
      app.post('/jwt',logger, async(req,res)=>{
        const user=req.body;
        console.log('jwt user',user);
        const token=jwt.sign(user,process.env.ACCESS_TOKEN,{expiresIn:'1h'});
        res
        .cookie('token',token,{
          httpOnly:true,
          secure:true,
          sameSite:'none'
        })
        .send({success:true});
      })

    // app.post('/logout',async(req,res)=>{
    //   const user=req.body;
    //   console.log('login out',user);
    //   res.clearCookie('token',{maxAge:0}).send({success:true});
    // })




      // services related api
      app.get('/home/services',logger,async(req,res)=>{
        const result=await serviceCollection.find().toArray();
        res.send(result);
      })
      
     app.get('/services',logger, async(req,res)=>{
        const filter=req.query;
        console.log({filter});
        const query={
          title:{
            $regex:filter.search,
            $options:'i',
          }
        };
        const options={
          srot: {
            price: filter.sort==='asc'? 1 : -1,
          },
        };
        const result=await serviceCollection.find(query,options).toArray();
        res.send(result);
     })
     app.post('/services',logger, async(req,res)=>{
      const newService=req.body;
      console.log('added service',newService);
      const result=await serviceCollection.insertOne(newService);
      res.send(result);
     })
     app.get('/services/:id',logger, async(req,res)=>{
      const id=req.params;
      const query={_id: new ObjectId(id)};
      const result=await serviceCollection.findOne(query);
      res.send(result);
     })
     app.delete('/services/:id',logger, async(req,res)=>{
      const id=req.params.id;
      const query={_id: new ObjectId(id)};
      const result=await serviceCollection.deleteOne(query);
      res.send(result);
     })
     app.patch('/services/:id',logger,async(req,res)=>{
      const id=req.params.id;
      const service=req.body;
      const query={_id:new ObjectId(id)};
      const updateDoc={
        $set:{
            customerName:service.customerName,
            email:service.email,
            title:service.title,
            img:service.img,
            price:service.price,
            date:service.date,
            description:service.description,
            quantity:service.quantity,
        }
      }
      const result=await serviceCollection.updateOne(query,updateDoc);
      res.send(result);

     })
     app.get('/services/user/:email',async(req,res)=>{
      const email=req.params.email;
      const query={email:email};
      console.log({query})
      const result=await serviceCollection.find(query).toArray();
      res.send(result);
     })
     app.post('/order',logger, async(req,res)=>{
      const newOrder=req.body;
      // console.log('new order',newOrder);
      const result=await orderCollection.insertOne(newOrder);
      res.send(result);
     })
     

     app.get('/order',logger,verifyToken, async(req,res)=>{
      console.log(req.query.email);
      console.log('user in the valid token send from verify',req.user);
      // console.log('tok tok token',req.cookies.token);
      if(req.query.email !==req.user.email){
          return res.status(403).send({message:'Forbidden Access'}); 
      }
      let query={};
      if(req.query.email){
        query={email:req.query.email}
      }
      const result=await orderCollection.find(query).toArray();
      res.send(result);
     })
     
     app.delete('/order/:id',logger, async(req,res)=>{
      const id=req.params;
      const query={_id:new ObjectId(id)};
      const result=await orderCollection.deleteOne(query);
      res.send(result);
     })
     app.patch('/order/:id',logger, async(req,res)=>{
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
     app.get('/team',logger, async(req,res)=>{
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