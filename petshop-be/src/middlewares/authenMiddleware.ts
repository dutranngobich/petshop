import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { validationMessages } from '../utils/validateMessage'

export const authenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.headers.authorization?.split(' ')[1]
    const accessKey = process.env.MY_SECRET_KEY_ACCESS

    if (!accessToken) {
      res.status(401).json({ message: validationMessages.unauthorized })
      return
    }
    if (!accessKey) {
      res.status(401).json({ message: validationMessages.unauthorized })
      return
    }

    const decodedAccessToken = jwt.verify(accessToken, accessKey) as JwtPayload
    if (decodedAccessToken.id) {
      req.userID = decodedAccessToken.id
      next()
    } else res.status(401).json({ message: validationMessages.unauthorized })
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: validationMessages.unauthorized })
    }
    res.status(500).json({ message: validationMessages.internalServer })
  }
}
