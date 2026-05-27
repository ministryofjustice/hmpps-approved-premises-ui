import { SuperAgentRequest } from 'superagent'
import { TaskData } from '@approved-premises/ui'
import { getMatchingRequests, stubFor } from './setup'
import paths from '../../server/paths/api'

export default {
  stubFormDataGet: ({ id, data }: { id: string; data: TaskData }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: paths.formData({ id }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: data,
      },
    })
  },
  stubFormDataUpdate: ({ id }: { id: string; data: TaskData }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        url: paths.formData({ id }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: { id },
      },
    })
  },
  /**
   * Replace stubbed form data with contents of last update
   * @param placementApplication provides the id and used as the stub return if there are no previous updates
   * @param update manual update to the data blob
   */
  stubFormDataFromLastUpdate: async ({ id, defaultData = {} }) => {
    const {
      body: { requests },
    } = await getMatchingRequests({
      method: 'PUT',
      url: paths.formData({ id }),
    })
    const lastPostData = requests.pop()?.body
    const body = lastPostData ? JSON.parse(lastPostData) : defaultData
    const jsonBody = {
      ...body,
    }

    return stubFor({
      request: {
        method: 'GET',
        urlPattern: paths.formData({ id }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody,
      },
    })
  },
}
