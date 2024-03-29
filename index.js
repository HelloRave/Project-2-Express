const express = require('express');
const axios = require('axios');
const ObjectId = require('mongodb').ObjectId;
const MongoUtil = require('./MongoUtil');
const { checkEmptyFields, checkEmptyReviews, checkTypeMain, checkTypeReview } = require('./Middleware')
const cors = require('cors');
require('dotenv').config()

let app = express();
app.use(express.json());
app.use(cors())

const MONGO_URI = process.env.MONGO_URI

// Routes
async function main() {

    const db = await MongoUtil.connect(MONGO_URI, 'manga_library')

    app.get('/', async function (req, res) {
        const mangaRecords = await db.collection('manga_records').find({}).toArray()
        res.json(mangaRecords)
    })

    app.post('/add_new_manga', [checkEmptyFields, checkEmptyReviews, checkTypeMain, checkTypeReview], async function (req, res) {

        let author_id = ObjectId()

        if (req.body.author_id) {
            author_id = ObjectId(req.body.author_id)
        } else {
            await db.collection('manga_authors').insertOne({
                _id: author_id,
                author_name: req.body.author_name
            })
        }

        let review_id = ObjectId()

        let url = req.body.url;
        let title = req.body.title;
        let author = {
            _id: author_id,
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
        let reviews = [review_id];
        let average_rating = req.body.rating

        let response = await db.collection('manga_records').insertOne({
            url, title, author, description, genre, chapters, ongoing, published, serialization, volumes, anime_adaptation, reviews, average_rating
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
        let rating = Number(req.body.rating)

        await db.collection('manga_reviews').insertOne({
            _id: review_id, 
            manga, plot, main_characters, supporting_characters, rating
        })

        res.status(201);
        res.send(response)
    })

    app.get('/find_author/:name', async function (req, res) {
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

    app.get('/find_review/:manga_id', async function (req, res) {
        let reviewResults = await db.collection('manga_reviews').find({
            'manga._id': ObjectId(req.params.manga_id)
        }).toArray()

        res.json(reviewResults)
    })

    app.post('/add_review/:manga_id', [checkEmptyReviews, checkTypeReview], async function (req, res) {
        let manga = {
            _id: ObjectId(req.params.manga_id),
            name: req.body.title
        }
        let plot = req.body.plot;
        let main_characters = req.body.main_characters;
        let supporting_characters = req.body.supporting_characters;
        let rating = Number(req.body.rating)

        let addReview = await db.collection('manga_reviews').insertOne({
            manga, plot, main_characters, supporting_characters, rating
        })

        
        let allCurrentReviews = await db.collection('manga_reviews').find({
            'manga._id': ObjectId(req.params.manga_id)
        }).project({
            rating: 1
        }).toArray()

        let ratingOnlyArray = allCurrentReviews.map((obj) => { return obj.rating})

        let averageRating = ratingOnlyArray.reduce((total, current) => {return total + current}, 0) / ratingOnlyArray.length

        await db.collection('manga_records').updateOne({
            _id: ObjectId(req.params.manga_id)
        }, {
            '$set': {
                'average_rating': averageRating
            },
            '$push': {
                'reviews': addReview.insertedId
            }
        })

        res.sendStatus(200)
    })

    app.get('/find_manga', async function (req, res) {
        let criteria = {}

        if (req.query.author_name) {
            criteria['author.name'] = {
                $regex: req.query.author_name,
                $options: 'i'
            }
        }

        if (req.query.title) {
            criteria['title'] = {
                $regex: req.query.title,
                $options: 'i'
            }
        }

        if (req.query.ongoing) {
            criteria['ongoing'] = {
                $eq: req.query.ongoing == "true" ? true : false
            }
        }

        if (req.query.max_volume && req.query.min_volume) {
            criteria['volumes'] = {
                $lte: Number(req.query.max_volume),
                $gte: Number(req.query.min_volume)
            }
        }

        if (req.query.max_chapter && req.query.min_chapter) {
            criteria['chapters'] = {
                $lte: Number(req.query.max_chapter),
                $gte: Number(req.query.min_chapter)
            }
        }

         if (req.query.min_rating){
            criteria['average_rating'] = {
                $gte: Number(req.query.min_rating)
            }
        }

        if (req.query.genre) {
            criteria['$and'] = req.query.genre.map((genre) => {
                return {
                    'genre': {
                        '$in': [genre]
                    }
                }
            })
        }

        let results = await db.collection('manga_records').find(criteria).toArray()

        res.status(200);
        res.send(results)
    })

    app.patch('/update_manga/:id', [checkEmptyFields, checkTypeMain], async function (req, res) {

        let url = req.body.url
        let title = req.body.title;

        let author_id = await db.collection('manga_authors').findOne({
            author_name: {
                $regex: req.body.author_name,
                $options: 'i'
            }
        }, {
            'projection': {
                '_id': 1
            }
        })

        let author = {
            _id: (author_id && author_id._id) ? ObjectId(author_id._id) : ObjectId(),
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

        await db.collection('manga_records').updateOne({
            _id: ObjectId(req.params.id)
        }, {
            '$set': {
                url, title, author, description, genre, chapters, ongoing, published, serialization, volumes, anime_adaptation
            }
        })

        res.sendStatus(200)
    })

    app.delete('/delete_manga/:manga_id', async function (req, res){
        await db.collection('manga_records').deleteOne({
            _id: ObjectId(req.params.manga_id)
        })

        res.sendStatus(200)
    })
}

main()

// End of routes

app.listen(process.env.PORT, () => {
    console.log('Server started')
})

