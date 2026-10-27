// Build the site and upload dist/ to Adriahost over FTP.
// Credentials come from .env.deploy (never committed).
import { readFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { Client } from 'basic-ftp'

if (!existsSync('.env.deploy')) {
  console.error('Missing .env.deploy (FTP_HOST, FTP_USER, FTP_PASS, FTP_PORT, FTP_SECURE, FTP_DIR)')
  process.exit(1)
}

const env = Object.fromEntries(
  readFileSync('.env.deploy', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
)

execSync('npm run build', { stdio: 'inherit' })

const client = new Client()
try {
  await client.access({
    host: env.FTP_HOST,
    user: env.FTP_USER,
    password: env.FTP_PASS,
    port: Number(env.FTP_PORT || 21),
    secure: env.FTP_SECURE !== 'false',
  })
  await client.ensureDir(env.FTP_DIR || '/domains/smartino.rs/public_html')
  await client.uploadFromDir('dist')
  console.log('Deployed.')
} finally {
  client.close()
}
