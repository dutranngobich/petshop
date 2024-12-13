import { Request, Router } from 'express'
import userController from './user.controller'
import { authenMiddleware } from '../../middlewares/authenMiddleware'
import { authorizeMiddleware } from '../../middlewares/authorizeMiddleware'
import { Role } from '@prisma/client'

const userRoutes = Router()

userRoutes.post('/create', authenMiddleware, authorizeMiddleware([Role.ADMIN], false), userController.createUser)
userRoutes.get(
  '/getByID/:id',
  authenMiddleware,
  authorizeMiddleware([Role.ADMIN], true, async (req: Request) => req.params.id),
  userController.getUser
)
userRoutes.get('/getAll', authenMiddleware, authorizeMiddleware([Role.ADMIN], false), userController.getAllUsers)
userRoutes.delete('/delete/:id', authenMiddleware, authorizeMiddleware([Role.ADMIN], false), userController.deleteUser)
userRoutes.put(
  '/update/:id',
  authenMiddleware,
  authorizeMiddleware([Role.ADMIN], true, async (req: Request) => req.params.id),
  userController.updateUser
)
userRoutes.put('/change-password', authenMiddleware, userController.changePassword)

export default userRoutes
