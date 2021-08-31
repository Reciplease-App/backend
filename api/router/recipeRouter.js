require('dotenv').config()
const express = require('express')
const axios = require('axios')
const key = process.env.SPOON_API_KEY

const recipeRouter = express.Router()

recipeRouter.get('/', async (req, res, next) => {
    try {
        const { recipe } = req.body

        if (!recipe) {
            res.status(403).json({
                message: "Please provide a recipe to search"
            })
        } else {
            const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?query=${recipe}&number=100&addRecipeInformation=true&apiKey=${key}`)
            res.send(response.data.results)
        }
    } catch (err) {
        next(err)
    }
})

module.exports = recipeRouter