const express = require('express');
const axios = require('axios');
const ObjectId = require('mongodb').ObjectId;
const MongoUtil = require('./MongoUtil');
const {checkEmptyFields} = require('./Middleware')
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
    app.post('/add_new_manga', checkEmptyFields, async function(req, res){

        let author_id = ObjectId()

        if (req.body.author_id){
            author_id = ObjectId(req.body.author_id)
        } 

        let review_id = ObjectId()

        let title = req.body.title;
        let author = {
            id_: author_id,
            name: req.body.author_name
        };
        let description = req.body.description;
        let genre = req.body.genre;
        let chapters = req.body.chapters;
        let ongoing = req.body.ongoing;
        let published = req.body.published;
        let serialization = req.body.serialization;
        let volumes = req.body.volumes;
        let anime_adaptation = req.body.anime_adaptation;
        let reviews = [review_id]

        let newManga = await db.collection('manga_records').insertOne({
            title, author, description, genre, chapters, ongoing, published, serialization, volumes, anime_adaptation, reviews
        })

        let mangaId = await db.collection('manga_records').findOne({
            'reviews': {
                $in: [review_id]
            } 
        }, {
            'projection': {
                '_id': 1
            }
        }
        )

        let manga = {
            _id: mangaId._id,
            name: req.body.title
        }
        let plot = req.body.plot;
        let main_characters = req.body.main_characters;
        let supporting_characters = req.body.supporting_characters;
        let rating = req.body.rating

        let newReview = await db.collection('manga_reviews').insertOne({
            manga, plot, main_characters, supporting_characters, rating
        })

        res.status(201);
        res.json(newManga) // can post to database but the error? 
    })

    app.get('/find_author/:name', async function(req, res){
        let results = await db.collection('manga_authors').find({
            author_name: {
                $regex: req.params.name,
                $options: 'i'
                    }
        }).project({
            _id: 1
        }).toArray()

        res.status(200);
        res.send(results)
    })

    app.get('/find_manga', async function(req, res){
        let criteria = {}

        if (req.query.author_name){
            criteria['author.name'] = {
                $regex: req.query.author_name,
                $options: 'i'
                    }
                }

        if (req.query.title){
            criteria['author.name'] = {
                $regex: req.query.title,
                $options: 'i'
                    }
                }

        if (req.query.ongoing){
            criteria['ongoing'] = {
                $eq: req.query.ongoing == "true" ? true : false 
            }
        }

        if (req.query.max_volume && req.query.min_volume){
            criteria['volumes'] = {
                $lte: Number(req.query.max_volume),
                $gte: Number(req.query.min_volume)
            }
        }

        if (req.query.max_chapter && req.query.min_chapter){
            criteria['chapters'] = {
                $lte: Number(req.query.max_chapter),
                $gte: Number(req.query.min_chapter)
            }
        }

        // IN ANOTHER COLLECTION
        //  if (req.query.max_rating && req.query.min_rating){
        //     criteria['rating'] = {
        //         $lte: Number(req.query.max_rating),
        //         $gte: Number(req.query.min_rating)
        //     }
        // }

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

