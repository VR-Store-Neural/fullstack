const express = require('express') // отримання пакету express
const config = require('config') // для отримання констант з config
const mongoose = require('mongoose') // для підключення до MongoDB

const app = express() // наш серевер

app.use('/api/auth', require('./routes/auth.routes'))

const PORT = config.get('port') || 5000 // для отримання порту 

async function start() {     // тому, що метод .connect повертає promise, обертаємо у функцію async/await
    try {
        await mongoose.connect(config.get('mongoUri'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true
        })
        app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`)) // запуск серверу на порті 5000
    } catch (err) {
        console.log('Server Error', err.message)
        process.exit(1)
    }
}

start()

