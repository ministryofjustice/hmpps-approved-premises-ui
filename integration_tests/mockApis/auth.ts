import jwt from 'jsonwebtoken'
import { Response } from 'superagent'
import { faker } from '@faker-js/faker'

import { ApArea, ProfileResponse, ApprovedPremisesUserRole as UserRole } from '../../server/@types/shared'

import { getMatchingRequests, stubFor } from './setup'
import tokenVerification from './tokenVerification'
import { apAreaFactory, userFactory } from '../../server/testutils/factories'
import { userProfileFactory } from '../../server/testutils/factories/user'

const createToken = () => {
  const payload = {
    user_name: 'USER1',
    scope: ['read'],
    auth_source: 'nomis',
    authorities: [],
    jti: '83b50a10-cca6-41db-985f-e87efb303ddb',
    client_id: 'clientid',
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}

const getSignInUrl = (): Promise<string> =>
  getMatchingRequests({
    method: 'GET',
    urlPath: '/auth/oauth/authorize',
  }).then(data => {
    const { requests } = data.body
    const stateValue = requests[requests.length - 1].queryParams.state.values[0]
    return `/sign-in/callback?code=codexxxx&state=${stateValue}`
  })

const favicon = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/favicon.ico',
    },
    response: {
      status: 200,
    },
  })

const ping = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/health/ping',
    },
    response: {
      status: 200,
    },
  })

const redirect = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/oauth/authorize\\?response_type=code&redirect_uri=.+?&state=.+?&client_id=clientid',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        Location: 'http://localhost:3007/sign-in/callback?code=codexxxx&state=stateyyyy',
      },
      body: '<html lang="en"><title>Sign in</title><body><main>SignIn page<h1>Sign in</h1></body></main></html>',
    },
  })

const signOut = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/sign-out.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '<html lang="en"><title>Sign in</title><body><main>SignIn page<h1>Sign in</h1></body></main></html>',
    },
  })

const manageDetails = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/account-details.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '<html lang="en"><title>Account details</title><body><main><h1>Your account details</h1></main></body></html>',
    },
  })

const token = () =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/auth/oauth/token',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Location: 'http://localhost:3007/sign-in/callback?code=codexxxx&state=stateyyyy',
      },
      jsonBody: {
        access_token: createToken(),
        token_type: 'bearer',
        user_name: 'USER1',
        expires_in: 599,
        scope: 'read',
        internalUser: true,
      },
    },
  })

export const defaultUserId = '70596333-63d4-4fb2-8acc-9ca55563d878'

const stubProfile = (profile: ProfileResponse) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/profile/v2',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: profile,
    },
  })

export default {
  getSignInUrl,
  stubAuthPing: ping,
  stubSignIn: (): Promise<[Response, Response, Response, Response, Response, Response]> =>
    Promise.all([favicon(), redirect(), signOut(), manageDetails(), token(), tokenVerification.stubVerifyToken()]),
  stubAuthUser: (
    args: { name?: string; userId?: string; roles?: Array<UserRole>; apArea?: ApArea; profile?: ProfileResponse } = {},
  ): Promise<Response> =>
    stubProfile(
      args.profile ||
        userProfileFactory.build({
          user: userFactory.build({
            name: args.name || faker.person.fullName(),
            id: args.userId || defaultUserId,
            roles: args.roles || [],
            apArea: args.apArea || apAreaFactory.build(),
            isActive: true,
          }),
        }),
    ),
}
