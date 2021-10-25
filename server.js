const { syncAndSeed } = require('./db')
require('dotenv').config()
const app = require('./app')

const init = async ()=> {
    await syncAndSeed();
    var port = process.env.PORT

    app.listen(port, ()=> console.log(`Listening on Port ${port}`))
}

init();