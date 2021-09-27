import http from 'http'
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

mongoose.connect('mongodb+srv://Bryan:Bassbone5@cluster0.qylrd.mongodb.net/Reciplease?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

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


// mongoose to mongoDB connectio

app.use('/users', userRouter)
app.use('/recipe', recipeRouter)

app.use((err, res) => { //eslint-disable-line
    res.status(err.status || 500).json({
        message: err.message, 
        stack: err.stack
    })
})

const port = 5000

const httpServer = http.Server(app)

httpServer.listen(port, () => {
    console.log(`Serving at port ${port}`)
})