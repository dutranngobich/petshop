import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import authRoutes from './modules/auth/auth.routes'
import userRoutes from './modules/user/user.routes'

const app = express()

declare module 'express' {
  export interface Request {
    userID?: string
  }
}

app.use(bodyParser.json())
app.use(cors())

app.use('/api/user', userRoutes)
app.use('/api/auth', authRoutes)

app.get('/', (req, res) => {
  res.send('Welcome to the API!')
})

export { app }
