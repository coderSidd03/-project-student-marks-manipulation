const JWT = require('jsonwebtoken');

const authUser = async (req, res, next) => {
    try {
        // accessing token from headers
        let token = req.headers.authorization;
        if (!token) return res.status(403).send({ status: false, message: 'TOKEN is missing !!!' });

        // splitting token & string 
        let user = token.split(' ');

        // verifying token
        JWT.verify(
            user[1],            // after splitting token will present in 1st index
            "~ functionUp--assignment-- _student-Marks_ -- by Soumyadeep Chakraborty ~",
            (error, decodedToken) => {
                if (error) return res.status(400).send({ status: false, message: error.message })
                req.userId = decodedToken.userId
                next();
            });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { authUser };