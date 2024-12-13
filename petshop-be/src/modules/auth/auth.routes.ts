import { Router } from 'express'
import AuthenticationController from './auth.controller'
import { authenMiddleware } from '../../middlewares/authenMiddleware'

const authRoutes = Router()

authRoutes.post('/register', AuthenticationController.register)
authRoutes.post('/login', AuthenticationController.login)
authRoutes.post('/logout', authenMiddleware, AuthenticationController.logout)
authRoutes.post('/refresh-token', AuthenticationController.refreshToken)

export default authRoutes
