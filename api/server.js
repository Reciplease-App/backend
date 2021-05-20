const http = require('http')
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

const userRouter = require('./router/userRouter.js')

const app = express()
app.use(cors())

app.use(express.json())

// mongoose to mongoDB connection
mongoose.connect('mongodb+srv://Bryan:Bassbone5@cluster0.qylrd.mongodb.net/Reciplease?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

app.use('/users', userRouter)

const port = process.env.PORT || 5000

const httpServer = http.Server(app)

httpServer.listen(port, () => {
    console.log(`Serving at port ${port}`)
})