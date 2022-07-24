let dateRegex = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/
let urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/

let checkEmptyFields = (req,res,next) => {
    if (!req.body.url||
        !req.body.title || 
        !req.body.author_name ||
        !req.body.description ||
        req.body.genre === [] ||
        !req.body.chapters ||
        !req.body.volumes ||
        !req.body.published || 
        !req.body.serialization){
        res.sendStatus(400)
        console.log('Missing fields')
    } else {
        next()
    }
}

let checkEmptyReviews = (req,res,next) => {
    if (!req.body.plot ||
        !req.body.main_characters ||
        !req.body.supporting_characters ||
        !req.body.rating){
        res.sendStatus(400)
        console.log('Missing fields in reviews')
    } else {
        next()
    }
}

let checkTypeMain = (req, res, next) => {
    if (urlRegex.test(req.body.url) ||
        typeof req.body.title !== 'string' ||
        typeof req.body.author_name !== 'string' ||
        typeof req.body.description !== 'string' ||
        !Array.isArray(req.body.genre) ||
        /^[1-9]\d*$/.test(req.body.chapters) ||
        /^[1-9]\d*$/.test(req.body.volumes) ||
        dateRegex.test(req.body.published) ||
        typeof req.body.serialization !== 'string'){
        res.sendStatus(400)
        console.log('Wrong data type')
    } else {    
        next()
    }
}

let checkTypeReview = (req, res, next) => {
    if (typeof req.body.plot !== 'string' ||
        typeof req.body.main_characters !== 'string' ||
        typeof req.body.supporting_characters !== 'string' ||
        typeof req.body.rating !== 'number' ){
        res.sendStatus(400)
        console.log('Wrong data type')
    } else {    
        next()
    }
}

module.exports = {checkEmptyFields, checkEmptyReviews, checkTypeMain, checkTypeReview}