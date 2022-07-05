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

    // Route to add new manga to the list - how to link with the other 3 collections? 
    app.post('/add_new_manga', async function(req, res){

        let author_id = ObjectId()

        if (req.query.author_id){
            author_id = ObjectId(req.query.author_id)
        }

        let title = req.body.title;
        let author = {
            id_: author_id,
            name: req.body.author_name
        };
        let genre = req.body.genre;
        let chapters = req.body.chapters;
        let ongoing = req.body.ongoing;
        let published = req.body.published;
        let serialization = req.body.serialization;
        let volumes = req.body.volumes;
        let popularity = req.body.popularity;
        let anime_adaptation = req.body.anime_adaptation;
        let reviews = [ObjectId()]

        let newManga = await db.collection('manga_records').insertOne({
            title, author, genre, chapters, ongoing, published, serialization, volumes, popularity, anime_adaptation, reviews
        })

        res.status(201);
        res.json(newManga)
    })

    app.get('/find_manga', async function(req, res){
        let criteria = {}

        if (req.query.author_name){
            criteria['author.name'] = {
                $regex: req.query.author_name,
                $options: 'i'
                    }
                }

        if (req.query.ongoing){
            criteria['ongoing'] = {
                $eq: req.query.ongoing == "true" ? true : false 
            }
        }

        if (req.query.volumes){
            criteria['volumes'] = {
                $lt: Number(req.query.volumes)
            }
        }

        if (req.query.genre){
            criteria['genre'] = {
                $in: req.query.genre.split(' ')
            }
        }

        let results = await db.collection('manga_records').find(criteria).toArray()

        res.status(200);
        res.send(results)
    })

    
}

main()

// End of routes

app.listen(8888, ()=>{
    console.log('Server started')
})

