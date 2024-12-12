import { Gender, Role } from '@prisma/client'

// Base interface
export interface CreateUserType {
  fullname: string
  email: string
  password: string
  dob: string
  gender: Gender
  role: Role
}
