const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

async function run(){
    try{
        const donationCollection = client.db('bloodDonation').collection('donation');
        const eventsCollection = client.db('bloodDonation').collection('events')
        //create
        app.post("/donation", async (req, res) => {
          const doc = req.body;
        //   console.log(doc);
          const donation = await donationCollection.insertOne(doc);
          res.send(donation);
        });
        //read
        app.get("/donation", async(req,res)=> {
          const query = {};
          const cursor = donationCollection.find(query);
          const donation = await cursor.toArray();
          res.send(donation);
        });
        //find one by id
        app.get('/donation/:id', async(req, res)=> {
          const id = req.params.id;
          const query = {_id: ObjectId(id)};
          const result = await donationCollection.findOne(query);
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