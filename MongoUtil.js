const MongoClient = require('mongodb').MongoClient //return mongo object and find MongoClient(MongoShell that can be controlled in NodeJS) in the object

async function connect(mongoUri, dbName){
    const client = await MongoClient.connect(mongoUri)

    const db = client.db(dbName)
    return db
}

module.exports = {
    connect
}