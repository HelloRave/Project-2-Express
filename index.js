const express = require('express');
const axios = require('axios');
const ObjectId = require('mongodb').ObjectId;
const MongoUtil = require('./MongoUtil');
const cors = require('cors'); 
require('dotenv').config()

let app = express();
app.use(express.json()); 
app.use(cors())

const MONGO_URI = process.env.MONGO_URI

// Routes
async function main(){

    const db = await MongoUtil.connect(MONGO_URI, 'manga_library')

    app.get('/', async function(req, res){
        const mangaRecords = await db.collection('manga_records').find({}).toArray()
        res.json(mangaRecords)
    })
}

main()

// End of routes

app.listen(8888, ()=>{
    console.log('Server started')
})

