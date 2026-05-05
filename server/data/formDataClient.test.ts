import { TaskData } from '@approved-premises/ui'
import { describeCas1NamespaceClient } from '../testutils/describeClient'
import paths from '../paths/api'
import FormDataClient from './formDataClient'

describeCas1NamespaceClient('FormDataClient', provider => {
  let formDataClient: FormDataClient

  const token = 'token-1'
  const formId = 'formId'
  const formDataBlock: TaskData = {} as TaskData

  beforeEach(() => {
    formDataClient = new FormDataClient(token)
  })

  describe('formDataClient', () => {
    it('gets a form data block', async () => {
      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a form data block',
        withRequest: {
          method: 'GET',
          path: paths.formData({ id: formId }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: formDataBlock as { data: string },
        },
      })

      const output = await formDataClient.get(formId)
      expect(output).toEqual(formDataBlock)
    })

    it('updates a form data block', async () => {
      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to persist a form data block',
        withRequest: {
          method: 'PUT',
          path: paths.formData({ id: formId }),
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: formDataBlock,
        },
        willRespondWith: {
          status: 200,
          body: formDataBlock,
        },
      })

      const output = await formDataClient.update(formId, formDataBlock)
      expect(output).toEqual(formDataBlock)
    })
  })
})
