import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.createMany({
    data: [
      {
        id: 'ce114485-d46d-4cb0-b7d7-e6d08c887d34',
        fullname: 'admin account',
        avatar: 'my avatar',
        email: 'admin@example.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$uYFKKk9XrEmZG2+lZqbBug$ps5eI+17gqzJj9PsuO4pWEUPTix0pl0jshqmFAgC1/E',
        dob: '1',
        gender: 'FEMALE',
        role: 'ADMIN'
      },
      {
        id: 'da321595-8e68-4e22-ba0f-01bab9eaa9a9',
        fullname: 'du1',
        avatar: 'my avatar',
        email: 'du1@example.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$/h8ad7Orig3jAdNc90JQ6g$qHUOKzR89JS70sUwPXvm8r1NnmEJMw0pF+Snj0X29bY',
        dob: '1',
        gender: 'FEMALE',
        role: 'ADMIN'
      },
      {
        id: 'f4d3f424-96dd-4ce3-9996-a3b9c6921c30',
        fullname: 'du2',
        avatar: 'my avatar',
        email: 'du2@example.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$+tvoDMq818M8h1+9De5rKw$UqMv6eekPsd6njzJTLCy7zv9dmF3LVYTNvnC/u6qfpk',
        dob: '1',
        gender: 'FEMALE',
        role: 'ADMIN'
      }
    ]
  })
  console.log('Seed data has been successfully added!')
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
