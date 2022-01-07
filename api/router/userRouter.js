const express = require('express')
const bcrypt = require('bcryptjs')
const expressAsyncHandler = require('express-async-handler')
const User = require('../model/userModel')
const { generateToken } = require('../utils')

const userRouter = express.Router()

userRouter.post('/register',
    expressAsyncHandler(async (req, res) => {
        const user = new User({
            email: req.body.email,
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, 8)
        })
        const createdUser = await user.save()
        res.send({
            email: createdUser.email,
            token: generateToken(createdUser)
        })
    })
)

userRouter.post('/login', 
    expressAsyncHandler(async (req, res) => {
        const user = await User.findOne({ email: req.body.email })
        if (user) {
            if (bcrypt.compareSync(req.body.password, user.password)) {
                res.send({
                    username: user.username,
                    token: generateToken(user)
                })
                return
            }
        }
        res.status(401).send({message: 'Invalid email or password'})
    })
)

userRouter.get('/saved_recipes',
    expressAsyncHandler(async (req, res) => {
        const user = await User.findOne({ username: req.query.email })
        res.send(user.savedRecipes)
    })
)

userRouter.put('/profile',
    expressAsyncHandler(async (req, res) => {
        const user = await User.findOne({ email: req.body.email })
        if (user) {
            user.username = req.body.username || user.username
            user.email = req.body.email || user.email
            if (req.body.password) {
                user.password = bcrypt.hashSync(req.body.password, 8)
            }
            const updateduser = await user.save()
            res.send({message: 'user updated successfully!'})
        }
    })
)

userRouter.put('/saved_recipes',
    expressAsyncHandler(async (req, res) => {
        const user = await User.findOne({ email: req.body.email })
        if (user) {
            user.savedRecipes.push(req.body.recipe)
            await user.save()
            res.send(user.savedRecipes)
        }
    })
)

userRouter.delete('/saved_recipes/:id',
    expressAsyncHandler(async (req, res) => {
        const user = await User.findOne({ email: req.body.email })
        if (user) {
            user.savedRecipes.forEach(recipe => {
                if (Number(recipe.recipeId) !== Number(req.params.id)) {
                    console.log(recipe)
                } else {
                    user.savedRecipes.splice(user.savedRecipes.indexOf(recipe), 1)
                    console.log('deleted', user.savedRecipes)
                }
            })
            await user.save()
            res.send(user.savedRecipes)
        }
    })
)

module.exports = userRouter