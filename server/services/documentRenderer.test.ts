import { createMock } from '@golevelup/ts-jest'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { caseDetailRole, documentRender } from './documentRender'
import { applicationFactory } from '../testutils/factories'
import applicationData from '../../integration_tests/fixtures/applicationData.json'
import applicationDocument from '../../integration_tests/fixtures/applicationDocument.json'
import logger from '../../logger'

jest.mock('../../logger')

function createToken(authorities: Array<string>) {
  const payload = {
    user_name: 'USER1',
    scope: ['read', 'write'],
    auth_source: 'delius',
    authorities,
    jti: 'a610a10-cca6-41db-985f-e87efb303aaf',
    client_id: 'clientid',
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}

describe('DocumentRenderer', () => {
  const application = applicationFactory.build({ data: applicationData })

  const response = createMock<Response>()
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('returns a rendered document from an application', async () => {
    const token = createToken([caseDetailRole])
    const request = createMock<Request>({ headers: { authorization: `Bearer ${token}` }, body: application })
    await documentRender(request, response)
    expect(response.json).toHaveBeenCalledWith(applicationDocument)
  })

  it('fails if no token provided', async () => {
    const request = createMock<Request>({ body: application })
    await documentRender(request, response)
    expect(response.json).not.toBeCalled()
    expect(response.status).toBeCalledWith(401)
    expect(logger.error).toHaveBeenCalledWith('User is not authorised to access this')
  })

  it('fails if token does not have the right role', async () => {
    const token = createToken(['ROLE_INCORRECT'])
    const request = createMock<Request>({ headers: { authorization: `Bearer ${token}` }, body: application })
    await documentRender(request, response)
    expect(response.json).not.toBeCalled()
    expect(response.status).toBeCalledWith(403)
    expect(logger.error).toHaveBeenCalledWith(
      'User lacks required role ROLE_PROBATION_API__APPROVED_PREMISES__CASE_DETAIL (ROLE_INCORRECT)',
    )
  })
})
