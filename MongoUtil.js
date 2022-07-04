const MongoClient = require('mongodb').MongoClient //return mongo object and find MongoClient(MongoShell that can be controlled in NodeJS) in the object

async function connect(mongoUri, dbName){
    const client = await MongoClient.connect(mongoUri, {
        'useUnifiedTopology': true //different versions of Mongo; when set to true, regardless of versions
    }) //.connect takes in two arguement - 1st the connection string, 2nd an option string

    const db = client.db(dbName)
    return db
}

module.exports = {
    connect
}