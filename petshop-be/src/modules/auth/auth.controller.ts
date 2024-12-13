import { Request, Response } from 'express'
import argon2d from 'argon2'
import { createUserSchema } from '../user/user.schema'
import UserService from '../user/user.service'
import { z } from 'zod'
import { loginSchema } from './auth.schema'
import { validationMessages } from '../../utils/validateMessage'
import jwt, { JwtPayload } from 'jsonwebtoken'
import redisClient from '../../database/redis'
import { setTokenBlacklist } from '../../utils/redisUtils'

class AuthenticationController {
  static register = async (req: Request, res: Response) => {
    try {
      const validatedUser = await createUserSchema.safeParseAsync(req.body)
      const user = validatedUser.data
      if (!user) {
        res.status(400).json({
          message: validationMessages.validateFailed,
          errors: validatedUser.error.errors
        })
        return
      }
      const hashedPassword = await argon2d.hash(user.password)
      user.password = hashedPassword
      const newUser = await UserService.createUser(user)
      res.status(200).json({ mesage: 'Register successfully', newUser })
    } catch (error) {
      if (error instanceof z.ZodError)
        res.status(400).json({
          message: validationMessages.validateFailed,
          errors: error.errors
        })
      else res.status(500).json({ message: validationMessages.validateFailed })
    }
  }
  static login = async (req: Request, res: Response) => {
    try {
      const loginResult = await loginSchema.safeParseAsync(req.body)
      const loginInfo = loginResult.data
      if (!loginInfo) {
        res.status(400).json({
          message: validationMessages.validateFailed,
          errors: loginResult.error.errors
        })
        return
      }

      const user = await UserService.getUserByEmail(loginInfo.email)
      if (!user) {
        res.status(401).json({ message: 'Email or password is incorrect' })
        return
      }

      const verifiedPassword = await argon2d.verify(user.password, loginInfo.password)
      if (!verifiedPassword) {
        res.status(401).json({ message: 'Email or password is incorrect' })
        return
      }

      const accessKey = process.env.MY_SECRET_KEY_ACCESS
      const refreshKey = process.env.MY_SECRET_KEY_REFRESH
      if (!accessKey || !refreshKey) {
        res.status(500).json({ message: validationMessages.internalServer })
        return
      }

      const accessToken = jwt.sign({ id: user.id }, accessKey, { expiresIn: '1h' })
      const refreshToken = jwt.sign({ id: user.id }, refreshKey, { expiresIn: '8h' })
      res.status(200).json({ data: { user, accessToken, refreshToken } })
      return
    } catch (error) {
      if (error instanceof z.ZodError)
        res.status(400).json({
          message: validationMessages.validateFailed,
          errors: error.errors
        })
      else res.status(500).json({ message: validationMessages.internalServer })
    }
  }

  static logout = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body
      if (!refreshToken) {
        res.status(400).json({ message: validationMessages.missingField })
        return
      }

      await setTokenBlacklist(refreshToken, res)
      res.status(200).json({ message: 'Logged out successfully' })
      return
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) res.status(401).json({ message: 'Token has expired' })
      else res.status(500).json({ message: validationMessages.internalServer })
    }
  }

  static refreshToken = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body
      const accessToken = req.headers.authorization?.split(' ')[1]

      if (!refreshToken) {
        res.status(400).json({ message: validationMessages.missingField })
        return
      }
      if (!accessToken) {
        res.status(401).json({ message: validationMessages.unauthorized })
        return
      }

      const isBlacklisted = await redisClient.get(refreshToken)
      if (isBlacklisted) {
        res.status(403).json({ message: 'Refresh token is not valid' })
        return
      }

      const refreshKey = process.env.MY_SECRET_KEY_REFRESH
      const accessKey = process.env.MY_SECRET_KEY_ACCESS
      if (!refreshKey || !accessKey) {
        res.status(500).json({ message: validationMessages.internalServer })
        return
      }

      const decodedRefreshToken = jwt.verify(refreshToken, refreshKey) as JwtPayload
      const decodedTokenToken = jwt.verify(accessToken, refreshKey) as JwtPayload
      if (decodedTokenToken.id !== decodedRefreshToken.id) {
        res.status(403).json({ message: validationMessages.accessDenied })
        return
      }

      const newAccessToken = jwt.sign({ id: decodedTokenToken.id }, accessKey, {
        subject: 'accessToken',
        algorithm: 'HS256',
        expiresIn: '1h'
      })

      res.status(200).json({ data: newAccessToken })
      return
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) res.status(401).json({ message: 'Token has expired' })
      else res.status(500).json({ message: validationMessages.internalServer })
    }
  }
}

export default AuthenticationController
