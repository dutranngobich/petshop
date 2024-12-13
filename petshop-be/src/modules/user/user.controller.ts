import { Request, Response } from 'express'
import UserService from './user.service'
import { z } from 'zod'
import { changePasswordSchema, createUserSchema } from './user.schema'
import { validationMessages } from '../../utils/validateMessage'
import argon2d from 'argon2'
import { setTokenBlacklist } from '../../utils/redisUtils'
import { User } from '@prisma/client'

class UserController {
  static createUser = async (req: Request, res: Response) => {
    try {
      const validatedUser = await createUserSchema.parseAsync(req.body)
      const newUser = await UserService.createUser(validatedUser)
      if (!newUser) {
        res.status(404).json({ message: 'User not found' })
        return
      }
      const { password, ...userWithoutPassword } = newUser
      res.status(200).json(userWithoutPassword)
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: validationMessages.validateFailed,
          errors: error.errors
        })
      } else res.status(500).json({ message: validationMessages.internalServer })
    }
  }

  static getUser = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id
      const responseUser = await UserService.getUser(userId)
      if (!responseUser) {
        res.status(404).json({ message: 'User not found' })
        return
      }
      res.status(200).json(responseUser)
    } catch (error) {
      res.status(500).json({ message: validationMessages.internalServer })
    }
  }

  static getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await UserService.getAllUser()
      res.status(200).json(users || [])
    } catch (error) {
      res.status(500).json({ message: validationMessages.internalServer })
    }
  }

  static deleteUser = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id
      const deletedUser = await UserService.deleteUser(userId)
      if (!deletedUser) {
        res.status(404).json({ message: 'User not found' })
      }
      res.status(200).json({ message: 'User deleted successfully' })
    } catch (error) {
      res.status(500).json({ message: validationMessages.internalServer })
    }
  }

  static updateUser = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id
      const data: Partial<Omit<User, 'id'>> = req.body
      const updatedUser = await UserService.updateUser(userId, data)
      if (!updatedUser) {
        res.status(404).json({ message: 'User not found' })
        return
      }
      const { password, ...userWithoutPassword } = updatedUser
      res.status(200).json({ data: userWithoutPassword, message: 'Update user successfully' })
    } catch (error) {
      res.status(500).json({ message: validationMessages.internalServer })
    }
  }
  static changePassword = async (req: Request, res: Response) => {
    try {
      const changePasswordInfo = req.body
      const validatedInfo = await changePasswordSchema.safeParseAsync(changePasswordInfo)
      if (!validatedInfo.data) {
        res.status(400).json({
          message: validationMessages.validateFailed,
          errors: validatedInfo.error.errors
        })
        return
      }

      const userId = req.userID
      if (!userId) {
        res.status(404).json({ message: 'User not found' })
        return
      }

      const currentUser = await UserService.getUser(userId)
      if (!currentUser) {
        res.status(404).json({ message: 'User not found' })
        return
      }

      const isMatch = await argon2d.verify(currentUser?.password, validatedInfo.data?.password)
      if (!isMatch) {
        res.status(400).json({ message: 'Current password is incorrect' })
        return
      }

      const hashedPassword = await argon2d.hash(validatedInfo.data?.password)
      const updatedUser = await UserService.updateUser(userId, { password: hashedPassword })
      if (!updatedUser) {
        res.status(404).json({ message: 'Change password failed' })
        return
      }
      //relogin
      await setTokenBlacklist(validatedInfo.data.refreshToken, res)
      res.status(200).json({ message: 'Change password successfully.' })
    } catch (error) {
      console.log(error)
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: validationMessages.validateFailed,
          errors: error.errors
        })
      } else res.status(500).json({ message: validationMessages.internalServer })
    }
  }
}

export default UserController
