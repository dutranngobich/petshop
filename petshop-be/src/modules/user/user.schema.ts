import { z } from 'zod'
import { prisma } from '../../database/prisma'
import { Gender, Role } from '@prisma/client'
import { validationMessages } from '../../utils/validateMessage'

const checkExistEmail = async (email: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })
  return !existingUser
}

export const createUserSchema = z.object({
  fullname: z.string({ required_error: validationMessages.required }),
  avatar: z.string({ required_error: validationMessages.required }).nullable(),
  email: z
    .string({ required_error: validationMessages.required })
    .email(validationMessages.emailInvalid)
    .refine((email) => checkExistEmail(email), {
      message: validationMessages.emailExist
    }),
  password: z
    .string({ required_error: validationMessages.required })
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/, {
      message: validationMessages.passwordInvalid
    }),
  dob: z.string({ required_error: validationMessages.required }),
  gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER], { required_error: validationMessages.required }),
  role: z.enum([Role.ADMIN, Role.CUSTOMER], { required_error: validationMessages.required })
})

export const changePasswordSchema = z
  .object({
    refreshToken: z.string({ required_error: validationMessages.required }),
    password: z.string({ required_error: validationMessages.required }),
    newPassword: z
      .string({ required_error: validationMessages.required })
      .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/, {
        message: validationMessages.passwordInvalid
      }),
    confirmPassword: z.string({ required_error: validationMessages.required })
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: validationMessages.passwordMatch
  })
