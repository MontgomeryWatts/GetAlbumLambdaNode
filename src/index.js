const MongoClient = require('mongodb').MongoClient;
const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME;

let cachedClient;

function connectToDatabase (uri) {
  if (cachedClient) return Promise.resolve(cachedClient);

  return MongoClient.connect(uri, { useNewUrlParser: true })
    .then(client => {
      cachedClient = client;
      return cachedClient;
    });
}

function getAlbum (client, albumId) {
    return client.db(DATABASE_NAME).collection('albums').findOne({ _id: albumId })
  .then(doc => {
    return {
      statusCode: 200,
      body: JSON.stringify(doc)
    }
  })
  .catch(err => {
    return {
      statusCode: 404
    }
  })
}

exports.handler = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  let { albumId } = event.pathParameters;
  
  connectToDatabase(MONGODB_URI)
    .then(client => getAlbum(client, albumId))
    .then(result => callback(null, result))
    .catch(err => callback(err))
};