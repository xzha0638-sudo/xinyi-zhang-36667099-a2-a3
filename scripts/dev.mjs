import { createServer } from 'vite'
import { sharedViteConfig } from './vite.shared.mjs'

const server = await createServer({
  ...sharedViteConfig,
  configFile: false
})

await server.listen()
server.printUrls()
