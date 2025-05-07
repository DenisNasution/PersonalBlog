const jwt = require('jsonwebtoken')

const generateToken = (user) => {
    return jwt.sign({
        _id: user.id
    },
        'somethingsecret',
        {
            expiresIn: '20d'
        }
    )

}

const isAuth = (req, res, next) => {
    const authorization = req.headers.authorization
    console.log(authorization);
    if (authorization) {
        // const token = authorization.
        jwt.verify(
            authorization,
            'somethingsecret',
            (err, decode) => {
                if (err) {
                    res.status(401).send({ message: 'Invalid Token' })
                } else {
                    req.user = decode
                    // console.log(req.user);
                    next()
                }
            }
        )
    }
}

module.exports = { generateToken, isAuth };