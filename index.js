require('dotenv').config();
const express = require('express');
const mongodb = require('mongodb');


const cors = require('cors');

const app = express();
app.set('port', (process.env.PORT || 5000));

const userAuth = require('./authentication')

const mongoClient = mongodb.MongoClient;
const URL = process.env.dbURL || 'mongodb://localhost:27017';
console.log(URL);
const objectId  = mongodb.ObjectID;
const DB = 'usercreadentials';

app.use(express.json());
app.use(cors());

app.use('/auth', userAuth);



app.get('/', async (req,res)=>{
    try {
        let client = await mongoClient.connect(URL);
        let db = client.db(DB);
        let data = await db.collection('users').find().toArray();
        if(data){
            res.status(200).json(data);
        }else{
            res.status(404).json({message:'No data available'});
        }
        client.close();
        
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

app.post('/create', async (req,res)=>{
    try {
        let client = await mongoClient.connect(URL);
        let db = client.db(DB);
        await db.collection('users').insertOne(req.body);
        res.status(200).json({message:'Data added sucessfully'});
        client.close();
        
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

app.put('/update/:id', async(req,res)=>{
    try {
        let client  = await mongoClient.connect(URL);
        let db = client.db(DB);
        await db.collection('users').findOneAndUpdate({_id: objectId(req.params.id)},{$set: req.body});
        res.status(200).json({message:'data updated sucessfully'});
        client.close();
        
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

app.delete('/delete/:id', async(req,res)=>{
    try {
        let client = await mongoClient.connect(URL);
        let db = client.db(DB);
        await db.collection('users').deleteOne({_id: objectId(req.params.id)});
        res.status(200).json({message:'data deleted sucessfully'});
        client.close();
        
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

app.listen(app.get('port'),()=>{
    console.log( 'Node server is running on port ' + app.get( 'port' ));
});