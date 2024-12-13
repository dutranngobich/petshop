import { User } from '@prisma/client'
import { prisma } from '../../database/prisma'
import { handlePrismaError } from '../../utils/prismaErrorCustom'

class UserService {
  static async createUser(user: Omit<User, 'id'>) {
    const userResponse = await prisma.user.create({ data: user })
    return userResponse
  }
  static async getUser(userId: string) {
    try {
      return await prisma.user.findUnique({
        where: {
          id: userId
        }
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }
  static getUserByEmail = async (email: string) => {
    try {
      return await prisma.user.findUnique({ where: { email: email } })
    } catch (error) {
      handlePrismaError(error)
    }
  }
  static async getAllUser() {
    try {
      return await prisma.user.findMany()
    } catch (error) {
      handlePrismaError(error)
    }
  }
  static async deleteUser(userId: string) {
    try {
      return await prisma.user.delete({
        where: {
          id: userId
        }
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }
  static async updateUser(userId: string, data: Partial<Omit<User, 'id'>>) {
    try {
      return await prisma.user.update({
        where: {
          id: userId
        },
        data: data
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }
}
export default UserService
