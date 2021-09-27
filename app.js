const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const userRouter = require('./api/router/userRouter')
const recipeRouter = require('./api/router/recipeRouter')

const app = express()
app.use(cors())

app.use(express.json())
app.use((req, res, next) => {
    res.header({ "Access-Control-Allow-Origin": "*",
    // "Access-Control-Allow-Headers":
    //   "Origin, X-Requested-With, Content-Type, Accept" });
  })
  next()
})


// mongoose to mongoDB connection
mongoose.connect('mongodb+srv://Bryan:Bassbone5@cluster0.qylrd.mongodb.net/Reciplease?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
})

app.use('/users', userRouter)
app.use('/recipe', recipeRouter)

const port = 5000

app.listen(port, () => {
    console.log(`Serving at port ${port}`)
})