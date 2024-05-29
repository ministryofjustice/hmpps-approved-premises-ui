import path from 'path'
import { pactWith } from 'jest-pact'
import { Pact } from '@pact-foundation/pact'

import config from '../config'

const describeClient = (consumer: string, fn: (provider: Pact) => void) => {
  verifyClientMeetsContract(consumer, fn, { cas1Namespace: false })
}

export const describeCas1NamespaceClient = (consumer: string, fn: (provider: Pact) => void) => {
  verifyClientMeetsContract(consumer, fn, { cas1Namespace: true })
}

const verifyClientMeetsContract = (
  consumer: string,
  fn: (provider: Pact) => void,
  { cas1Namespace } = { cas1Namespace: false },
) => {
  const provider = 'API'
  const dir = path.join(__dirname, '..', '..', 'tmp', 'pacts')

  describe(consumer, () => {
    pactWith({ consumer, provider, dir }, pact => {
      beforeEach(() => {
        config.apis.approvedPremises.url = pact.mockService.baseUrl
      })

      fn(pact)
    })

    it('meets the contract for the service', () => {
      const pactPath = `${dir}/${consumer}-${provider}.json`
      expect(pactPath).toMatchOpenAPISpec({ cas1Namespace })
    })
  })
}

export default describeClient
