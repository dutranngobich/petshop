import { Request, Response, NextFunction } from 'express'
import UserService from '../modules/user/user.service'
import { Role } from '@prisma/client'
import { validationMessages } from '../utils/validateMessage'

export const authorizeMiddleware = (
  roles: Role[],
  ownerCheck: boolean = false,
  getResourceOwner?: (req: Request) => Promise<string | null>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userID = req.userID // id from token
      if (!userID) {
        res.status(401).json({ message: validationMessages.unauthorized })
        return
      }

      const currentUser = await UserService.getUser(userID)
      if (!currentUser) {
        res.status(401).json({ message: validationMessages.unauthorized })
        return
      }

      // Check owner
      let isOwner = false
      if (getResourceOwner && ownerCheck) {
        const userIDFromParams = await getResourceOwner(req)
        isOwner = userID === userIDFromParams
      }
      // Check role
      const hasRole = roles.includes(currentUser.role)

      if (!hasRole && !isOwner) {
        res.status(403).json({ message: validationMessages.accessDenied })
        return
      }
      return next()
    } catch (error) {
      res.status(500).json({ message: validationMessages.internalServer })
      return
    }
  }
}
