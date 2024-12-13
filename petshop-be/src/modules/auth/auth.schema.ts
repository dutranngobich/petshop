import { z } from 'zod'
import { validationMessages } from '../../utils/validateMessage'

export const loginSchema = z.object({
  email: z.string(),
  password: z.string()
})

export const refreshPasswordSchema = z
  .object({
    otp: z.string({ required_error: validationMessages.required }),
    password: z.string({ required_error: validationMessages.required }),
    confirmPassword: z.string({ required_error: validationMessages.required })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: validationMessages.passwordMatch
  })
