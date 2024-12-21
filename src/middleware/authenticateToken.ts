import express, { Request, Response, NextFunction } from 'express'
import { jwtDecode } from 'jwt-decode'
import jwt from 'jsonwebtoken'
import * as fs from 'fs'
import * as paths from 'path'

// sample Authorizaation middleware to validate the token
const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
    if (req.url === '/login' || req.url === '/register' || req.url === '/auth') {
      next()
      return
    }
  
  const { path, method } = req;

  // Load service configurations
  const configPath = paths.join(__dirname, 'config', 'serviceConfig.json')
  const serviceConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'))

  const authorization = req.headers['authorization'] || ''

  const [bearer, token] = authorization.split(' ') || ''

  if (bearer !== 'Bearer') {
    res.status(401).send({
      error: 'UNATHORIZED',
      message: 'send Bearer token',
      result: false,
    });
    return;
  }

  if (token == null) res.status(401).send('Unauthorized')

  try {
    const decoded: any = jwtDecode(token)

    const clients = await fetch('http://localhost:3003/client')

    // Check if the response is successful (status code 200-299)
    if (!clients.ok) {
      throw new Error(`HTTP error! Status: ${clients.status}`)
    }

    const __clients: any = await clients.json()

    const client = __clients.find(
      (client: any) => client.client_id === decoded.client_id
    )

    if (!client) {
      res.status(403).send('Invalid Token with invalid client id');
      return;
    }
    // verify token
    const signingkey = Buffer.from(client.jwks.k, 'base64').toString('utf-8')
    let claims: any

    try {
      claims = jwt.verify(token, signingkey)
    } catch (err) {
      res.status(403).send(err)
    }
    console.log("claims",claims)
    //verify scope

    const route = serviceConfig.find(
      (route: any) =>
        route.context.some((c: string) => path.startsWith(c)) &&
        route.methods.includes(method)
    )

    if (!route || route?.internal) {
      res.status(404).send('Route not found');
      return;
    }

    if (!claims.scope.includes(route?.security?.scope)) {
      res.status(403).send({error:'forbidden' ,message:'insufficient scope'});
      return;
    }

    // res.status(200).send({ dcodedToken: decoded, client: clients })
    next()
  } catch (err) {
    res.status(403).send(err)
  }
}

export default authenticateToken
