const express = require('express')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')
const pool = require('./config/db')
const PORT = process.env.PORT || 3000

dotenv.config()

const app = express()

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')

//Middleware
app.use(express.json())
app.use(cookieParser())

//Custom middleware
const authenticate = require('./middleware/authenticate')

//db connection
pool.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.log('DB Connection error', err));

app.use(authenticate)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/auth', userRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}.`)
})