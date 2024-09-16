/* istanbul ignore file */

import { Response, SuperAgentRequest } from 'superagent'
import inMemoryStore from '../inMemoryStore'

function userVersionMiddleware(agent: SuperAgentRequest) {
  agent.on('request', ({ req }) => {
    req.on('response', (res: Response, err: Error) => {
      res.on('end', () => {
        if (res.headers['x-cas-user-id'] && res.headers['x-cas-user-version']) {
          inMemoryStore.users[res.headers['x-cas-user-id']] = res.headers['x-cas-user-version']
        }
      })
    })
  })

  return agent
}

export { userVersionMiddleware }
