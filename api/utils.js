const jwt = require('jsonwebtoken')

const generateToken = (user) => {
    return jwt.sign(
        {
            email: user.email,
            username: user.username,
            password: user.password,
            savedRecipes: user.savedRecipes
        },
        process.env.JWT_SECRET || 'POOP',
        {
            expiresIn: '30d'
        }
    )
}

// const isAuth = (req, res, next) => {
//     const authorization = req.headers.authorization
//     if (authorization) {
//         const token = authorization.slice(7, authorization.length)
//         jwt.verify(
//             token,
//             process.env.JWT_SECRET || 'POOP',
//             (err, decode) => {
//                 if (err) {
//                     res.status(401).send({message: 'Invalid Token'})
//                 } else {
//                     req.user = decode
//                     next()
//                 }
//             }
//         )
//     } else {
//         res.status(401).send({message: 'Invalid Token'})
//     }
// }

module.exports = {
    generateToken,
    
}