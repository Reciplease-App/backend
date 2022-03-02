require('dotenv').config();
const express = require('express')
const bcrypt = require('bcryptjs')
const expressAsyncHandler = require('express-async-handler')
const User = require('../model/userModel')
const { generateToken } = require('../utils')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const crypto = require('crypto');
const key = process.env.SG_KEY
const mail = process.env.SERVICE_MAIL
const link = process.env.RESET_LINK

const userRouter = express.Router()

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: key
    }
}))

// auth routes
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



userRouter.post('/forgot-password', ((req, res) => {
    User.findOne({email: req.body.email})
        .then(user => {
            if (!user) {
                res.status(422).send({message: "Invalid email. Please try again"})
            } 

            crypto.randomBytes(32, (err, buffer) => {
                const resetPassWordToken = buffer.toString("hex")
                
                user.resetToken = resetPassWordToken;
                user.expireToken = Date.now() + 360000;
                user.save()
                    .then(result => {
                        transporter.sendMail({
                            to:user.email,
                            from: mail,
                            subject: "password reset",
                            html: `
                            <h1>Reciplease</h1>
                            <h3>Reset Password Request</h3>
                            <p>You are receiving this email because there has been a request to reset your password. Please follow the link below to reset your password. Please note that this link will expire in one hour.</p>
                            <a href=http://localhost:3000/reset/${user.resetToken}>Reset Password</a>
                            <p>Didn't make this request? Please disregard this message</p>
                            `,
                        })
                    })
                    .catch(err => console.log(err))
            })
            res.send({message: "Check email", token: user.resetToken})
        })
})
)

userRouter.put('/reset-password', (req, res) => {

    User.findOne({resetToken: req.body.resetToken})
        .then(user => {
            if (!user) {
                res.status(422).send({message: "Session expired."})
            }

            const hash = bcrypt.hashSync(req.body.password, 8)
            user.password = hash
            user.resetToken = undefined;
            user.expiredToken = undefined;
            user.save().then(savedUser => {
                res.send({message: "Password updated successfully!", email: savedUser.email})
            })
        })
        .catch(err => {
            console.log(err)
        })
}) 

// recipe and user settings routes
userRouter.get('/saved_recipes',
    expressAsyncHandler(async (req, res) => {
        const user = await User.findOne({ email: req.body.email })
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