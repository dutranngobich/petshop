import { Response } from 'express'
import redisClient from '../database/redis'
import { validationMessages } from './validateMessage'
import jwt, { JwtPayload } from 'jsonwebtoken'

export const setTokenBlacklist = async (refreshToken: string, res: Response) => {
  const refreshKey = process.env.MY_SECRET_KEY_REFRESH
  if (!refreshKey) {
    res.status(500).json({ message: validationMessages.internalServer })
    return
  }

  const decoded = jwt.verify(refreshToken, refreshKey) as JwtPayload
  const currentTime = Math.floor(Date.now() / 1000)
  const ttl = Number(decoded.exp) - currentTime

  await redisClient.setEx(refreshToken, ttl, 'blacklisted')
}
