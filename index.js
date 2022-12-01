const express = require('express');
const app = express();
const cors = require('cors');
const courses = require('./data.json');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

//middlewares
app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASSWORD);

// dbaccess
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.s0orzt0.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const courseReviewCollection = client.db('wedemy').collection('reviews');
    const courseCollection = client.db('wedemy').collection('courses');

    //load reviews
    app.get('/reviews', async (req, res) => {
      const query = {};
      const cursor = courseReviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    //load courses
    app.get('/courses', async (req, res) => {
      const query = {};
      const cursor = courseCollection.find(query);
      const courses = await cursor.toArray();
      res.send(courses);
    });

    app.get('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const review = await courseReviewCollection.findOne(query);
      res.send(review);
    });

    app.get('/courses/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const course = await courseCollection.findOne(query);
      res.send(course);
    });

    // receive courses
    app.post('/courses', async (req, res) => {
      const course = req.body;
      console.log(course);
      const result = await courseCollection.insertOne(course);
      res.send(result);
    });

    // receive reviews
    app.post('/reviews/:id', async (req, res) => {
      const review = req.body;
      console.log(review, 'Hello');
      const result = await courseReviewCollection.insertOne(review);
      res.send(result);
    });

    //Update review
    app.put('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const review = req.body;
      const option = { upsert: true };
      const updatedReview = {
        $set: {
          review: review.review,
          rating: review.rating,
        },
      };
      const result = await courseReviewCollection.updateOne(
        filter,
        updatedReview,
        option
      );
      console.log(updatedReview);
      res.send(result);
    });

    //delete specific review
    app.delete('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      console.log(id);
      console.log('deleting is progress for', id);
      const result = await courseReviewCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch((err) => console.error(err));

app.get('/', (req, res) => {
  res.send('Server Running Nonstop');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
