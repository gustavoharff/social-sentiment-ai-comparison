import fs from 'node:fs'

import { run } from '@softwaretechnik/dbml-renderer'
import { pgGenerate } from 'drizzle-dbml-generator'

import * as schema from './schema'

const out = './schema.dbml'
const relational = true
pgGenerate({ schema, out, relational })
console.log('✅ Created the schema.dbml file')
console.log('⏳ Creating the erd.svg file')

const dbml = fs.readFileSync(out, 'utf-8')

const dbmlString = run(dbml, 'svg')

fs.writeFileSync('./erd.svg', dbmlString)
