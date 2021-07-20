const express = require('express')
const mongoose = require('mongoose')
const path = require('path');
const app = express()
const session = require('express-session')
const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo');

// const sessionOptions = {
//     secret: 'keyboard cat',
//     resave: true,
//     saveUninitialized: true,
//     cookie: { maxAge: 60000, secure: true },
//     store: MongoStore.create({
//         mongoUrl: 'mongodb+srv://admin:IXxvM82KDQNMCBqu@projproj.gehyr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
//     })
// }
// app.set('trust proxy', 1)
// app.use(session(sessionOptions))
// app.use(cookieParser())
app.use(cookieParser());
var MemoryStore =session.MemoryStore;
app.use(session({
    name : 'app.sid',
    secret: "1234567890QWERTY",
    resave: true,
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://admin:IXxvM82KDQNMCBqu@projproj.gehyr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    }),
    saveUninitialized: true
}));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const PORT = process.env.PORT || 8080

mongoose.connect('mongodb+srv://admin:IXxvM82KDQNMCBqu@projproj.gehyr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useNewUrlParser: true })

mongoose.connection.on('connected', (connection) => console.log('MongoDB connected'))
mongoose.connection.on('error', () => console.log('Failed to connect MongoDB'))

const lidSchema = new mongoose.Schema({
    email: String
}, {
    timestamps: true,
    versionKey: false
})

mongoose.model("Lid", lidSchema)

const Lid = mongoose.model("Lid")

app.get('/', async (req, res) => {
    const sent = req.session && req.session.sent
    const error = req.session && req.session.error

    req.session.error = false

    res.render('main', { sent, error })
})

app.post('/', async (req, res) => {
    if (!req.body.email) {
        req.session.error = 'Please fill in your email'
        return res.redirect('/')
    }

    const lid = new Lid({ email: req.body.email })

    await lid.save()
    
    req.session.sent = true

    res.redirect('/')
})

app.get('/lids', async (req, res) => {
    const lids = await Lid.find({})
    res.render('lids', { lids })
})


app.listen(PORT, () => console.log('App is running!'))