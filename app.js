const express = require('express');
const path = require('path')
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs')

const users = require('./routes/users');
const api = require('./routes/features');

const app = express();

// Create Write Stream
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'stateless.log'), {flags: 'a'})

// App View
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(morgan('combined', { stream: accessLogStream }))

app.use('/api', api)
app.use('/api/users', users)

// Catch 404 and forward to ErrorHandler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404
    res.status(404).send({ error: 'Page does not exist' })
    next(err)
})

// Error Handler
app.use((err, req, res) => {
    // Set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') == 'development' ? err : {}

    // Render the error page
    res.status(err.status || 500)
    res.render('error')
})

module.exports = app