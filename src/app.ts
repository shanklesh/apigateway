import express, { Request, Response } from 'express'
// import cors from 'cors';
import { createProxyMiddleware, Options } from 'http-proxy-middleware'
import * as fs from 'fs'
import * as path from 'path'
import authenticateToken from './middleware/authenticateToken'

const app = express()
app.use(authenticateToken)

//test

const port = process.env.PORT || 3000

// Load service configurations
const configPath = path.join(__dirname, 'config', 'serviceConfig.json')
const serviceConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'))

// Dynamically create proxy routes based on the json configuration
serviceConfig.forEach((service: any) => {
  service.context.forEach((contextPath: any) => {
    console.log(`contextPath: ${contextPath}`)
    service.methods.forEach((method: string) => {
      // Create a proxy for each context path
      const proxyOptions: any = {
        target: service.target,
        changeOrigin: true,
        pathRewrite: service.pathRewrite
      }
      const proxy = createProxyMiddleware(proxyOptions)

      // Register routes based on methods
      switch (method) {
        case 'GET':
          app.get(contextPath, proxy)
          console.log(`Routing GET ${contextPath} to ${service.target}`)
          break
        case 'POST':
          app.post(contextPath, proxy)
          console.log(`Routing POST ${contextPath} to ${service.target}`)
          break
        case 'PUT':
          app.put(contextPath, proxy)
          console.log(`Routing PUT ${contextPath} to ${service.target}`)
          break
        case 'DELETE':
          app.delete(contextPath, proxy)
          console.log(`Routing DELETE ${contextPath} to ${service.target}`)
          break
        default:
          console.warn(`Unsupported method: ${method} for ${contextPath}`)
      }

      // // Set up the route
      // app.use(proxy)

      // console.log(`Routing ${contextPath} to ${service.target}`)
    })
  })
})

// start server
app.listen(port, () => {
  console.log(`API gateway is started at http://localhost:${port}`)
})
