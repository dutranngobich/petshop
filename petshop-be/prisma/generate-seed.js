import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  const tables = ['user']

  let seedContent = `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
`
  for (const table of tables) {
    const data = await prisma[table].findMany()

    if (data.length > 0) {
      seedContent += `
  await prisma.${table}.createMany({
    data: ${JSON.stringify(data).replace(/"([^"]+)":/g, '$1:')},
  });`
    }
  }

  seedContent += `
  console.log('Seed data has been successfully added!');
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`

  // write seed.ts (override if exist)
  fs.writeFileSync('prisma/seed.ts', seedContent, 'utf-8')
  console.log('Seed file generated successfully: prisma/seed.ts')
}

main()
  .catch((error) => {
    console.error('Error generating seed file:', error)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
