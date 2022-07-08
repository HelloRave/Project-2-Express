let checkEmptyFields = (req,res,next) => {
    if (!req.body.title || 
        !req.body.author_name ||
        !req.body.description ||
        req.body.genre === [] ||
        !req.body.chapters ||
        !req.body.volumes ||
        !req.body.published || 
        !req.body.serialization ||
        !req.body.plot ||
        !req.body.main_characters ||
        !req.body.supporting_characters ||
        !req.body.rating){
        res.sendStatus(400)
        console.log('Missing fields')
    } else {
        next()
    }
}

module.exports = {checkEmptyFields}