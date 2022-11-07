const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
//midlewares 
app.use(cors());
app.use(express.json());

//username: bloodDonationDbUser
//password: inrlSQDxSqhXBDBB


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nbna82s.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
function verifyJWT(req, res, next){
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({ message: "Unauthorized Access!" });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.SCRECT_ACCESS_TOKEN, function(err, decoded){
    if(err){
      return res.status(403).send({ message: "Forbidded Access!" });
    }
    req.decoded = decoded;
    next();
  })
}
async function run(){
    try{
        const donationCollection = client.db('bloodDonation').collection('donation');
        const eventsCollection = client.db('bloodDonation').collection('events');
        //jwt
        app.post('/jwt', async(req, res)=> {
         
          const user = req.body;
          const token = jwt.sign(user, process.env.SCRECT_ACCESS_TOKEN, {expiresIn: '10d'});
          res.send({token})
        })
        //create
        app.post("/donation", async (req, res) => {
          const doc = req.body;
        
          const donation = await donationCollection.insertOne(doc);
          res.send(donation);
        });
        //read
        app.get("/donation", async(req,res)=> {
          const page = parseInt(req.query.page);
          const size = parseInt(req.query.size);
          
          const query = {};
          const cursor = donationCollection.find(query);
          const count = await donationCollection.estimatedDocumentCount();
          const donation = await cursor.skip(page*size).limit(size).toArray();
          res.send({count, donation});
        });
        //find one by id
        app.get('/donation/:id', async(req, res)=> {
          const id = req.params.id;
          const query = {_id: ObjectId(id)};
          const result = await donationCollection.findOne(query);
          res.send(result);
        });
        //event api
        app.post('/events', async(req, res)=> {

          const event = req.body;
          const result = await eventsCollection.insertOne(event);
          res.send(result);
        });
        //email query !
        app.get('/events', verifyJWT, async(req, res)=> {
          const decoded = req.decoded;
          console.log(decoded);
          if(decoded.email !== req.query.email){
            return res.status(403).send({ message: "Forbidded Access!" });
          }
          let query = {};
          if(req.query.email){
            query = {email: req.query.email}
          }
          const cursor = eventsCollection.find(query);
          const result = await cursor.toArray();
          res.send(result);
        });
        //delete event
        app.delete('/events/:id',verifyJWT, async(req, res)=> {
          const id = req.params.id;
          const query = {_id: ObjectId(id)};
          const result = await eventsCollection.deleteOne(query);
          res.send(result);
        });
        //update -status
        app.patch('/events/:id',verifyJWT, async(req,res)=> {
          
          const id = req.params.id;
          const filter = {_id: ObjectId(id)};
          const status = req.body.status;
          const updatedStatus = {
            $set: {
              status: status,
            },
          };
          const result = await eventsCollection.updateOne(filter, updatedStatus);
          res.send(result);
        })
    }
    finally{

    }
}
run().catch(error => console.log(error))

app.get('/', (req, res)=> {
    res.send('Blood Donation Camp Server is Running!!');
});
app.listen(port, ()=> {
    console.log(`Server running on port ${port}`);
})