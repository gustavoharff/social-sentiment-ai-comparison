import { sql } from '@vercel/postgres'
import { drizzle } from 'drizzle-orm/vercel-postgres'
import { migrate } from 'drizzle-orm/vercel-postgres/migrator'

const db = drizzle(sql)

migrate(db, { migrationsFolder: __dirname.concat('/migrations') }).then(() => {
  console.log('Migrations applied successfully!')
})