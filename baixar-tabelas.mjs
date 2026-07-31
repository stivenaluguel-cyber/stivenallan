import { createClient } from '@supabase/supabase-js'
import { writeFileSync, readFileSync } from 'node:fs'
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n')
  .filter(l => l.includes('=') && !l.trim().startsWith('#'))
  .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=')+1).trim().replace(/^["']|["']$/g,'')]))
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const D = '/private/tmp/claude-501/-Users-stivenallan/aee905ff-3486-4ab2-afde-b9e7ab2fde82/scratchpad/tab/'
for (const p of process.argv.slice(2)) {
  const slug = p.split('/')[1]
  const { data, error } = await sb.storage.from('documentos').download(p)
  if (error) { console.log(`ERRO ${slug}: ${error.message}`); continue }
  writeFileSync(D + slug + '.pdf', Buffer.from(await data.arrayBuffer()))
  console.log(`ok ${slug}`)
}
