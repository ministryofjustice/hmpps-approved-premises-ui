import { SuperAgentRequest } from 'superagent'
import { JourneyType, TaskData } from '@approved-premises/ui'
import { Cas1SpaceBooking } from '@approved-premises/api'
import { getMatchingRequests, stubFor } from './setup'
import paths from '../../server/paths/api'

export default {
  stubFormDataGet: ({
    placement,
    journey,
    data,
  }: {
    placement: Cas1SpaceBooking
    journey: JourneyType
    data: TaskData
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: paths.formData({ id: `${placement.id}-${journey}` }),
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
  stubFormDataUpdate: ({
    placement,
    journey,
  }: {
    placement: Cas1SpaceBooking
    journey: JourneyType
    data: TaskData
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        url: paths.formData({ id: `${placement.id}-${journey}` }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: { id: `${placement.id}-${journey}` },
      },
    })
  },
  /**
   * Replace stubbed form data with contents of last update
   * @param placementApplication provides the id and used as the stub return if there are no previous updates
   * @param update manual update to the data blob
   */
  stubFormDataFromLastUpdate: async ({
    placement,
    journey,
    defaultData = {},
  }: {
    placement: Cas1SpaceBooking
    journey: JourneyType
    defaultData: TaskData
  }) => {
    const {
      body: { requests },
    } = await getMatchingRequests({
      method: 'PUT',
      url: paths.formData({ id: `${placement.id}-${journey}` }),
    })
    const lastPostData = requests.pop()?.body
    const body = lastPostData ? JSON.parse(lastPostData) : defaultData
    const jsonBody = {
      ...body,
    }

    return stubFor({
      request: {
        method: 'GET',
        urlPattern: paths.formData({ id: `${placement.id}-${journey}` }),
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
