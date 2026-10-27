// Read-only FTP connection check: logs in, lists FTP_DIR, disconnects.
import { readFileSync } from 'node:fs'
import { Client } from 'basic-ftp'

const env = Object.fromEntries(
  readFileSync('.env.deploy', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
)

const client = new Client(15000)
try {
  await client.access({
    host: env.FTP_HOST,
    user: env.FTP_USER,
    password: env.FTP_PASS,
    port: Number(env.FTP_PORT || 21),
    secure: env.FTP_SECURE !== 'false',
  })
  console.log('LOGIN OK, pwd:', await client.pwd())
  const list = await client.list(env.FTP_DIR)
  console.log(`${env.FTP_DIR}: ${list.length} entries`)
  for (const f of list) console.log(' ', f.isDirectory ? 'd' : '-', f.name, f.size)
} catch (e) {
  console.error('FAILED:', e.code || '', e.message)
  process.exitCode = 1
} finally {
  client.close()
}
