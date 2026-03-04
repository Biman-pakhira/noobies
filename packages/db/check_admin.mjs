import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
async function run(){
  const users = await p.user.findMany({ where: { role: 'ADMIN' } })
  console.log(users.map(u=>({id:u.id,email:u.email,username:u.username})))
  await p.$disconnect()
}
run().catch(e=>{ console.error(e); process.exit(1) })
