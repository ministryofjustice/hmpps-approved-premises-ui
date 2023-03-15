import { createMock } from '@golevelup/ts-jest'
import { TasklistPageInterface } from '../form-pages/tasklistPage'
import {
  retrieveOptionalQuestionResponseFromApplicationOrAssessment,
  retrieveQuestionResponseFromApplicationOrAssessment,
} from './retrieveQuestionResponseFromApplicationOrAssessment'
import applicationFactory from '../testutils/factories/application'
import { SessionDataError } from './errors'
import * as utils from '../form-pages/utils'

jest.spyOn(utils, 'getTaskName').mockImplementation(() => 'my-task')
jest.spyOn(utils, 'getPageName').mockImplementation(() => 'my-page')

describe('retrieveQuestionResponseFromApplicationOrAssessment', () => {
  it("throws a SessionDataError if the property doesn't exist", () => {
    const application = applicationFactory.build()

    expect(() =>
      retrieveQuestionResponseFromApplicationOrAssessment(application, createMock<TasklistPageInterface>()),
    ).toThrow(SessionDataError)
  })

  it('returns the property if it does exist and a question is not provided', () => {
    const application = applicationFactory.build({
      data: {
        'my-task': { 'my-page': { myPage: 'no' } },
      },
    })

    const questionResponse = retrieveQuestionResponseFromApplicationOrAssessment(
      application,
      createMock<TasklistPageInterface>(),
    )
    expect(questionResponse).toBe('no')
  })

  it('returns the property if it does exist and a question is provided', () => {
    const application = applicationFactory.build({
      data: {
        'my-task': { 'my-page': { questionResponse: 'no' } },
      },
    })

    const questionResponse = retrieveQuestionResponseFromApplicationOrAssessment(
      application,
      createMock<TasklistPageInterface>(),
      'questionResponse',
    )
    expect(questionResponse).toBe('no')
  })
})

describe('retrieveOptionalQuestionResponseFromApplicationOrAssessment', () => {
  it("returns undefined if the property doesn't exist", () => {
    const application = applicationFactory.build()
    expect(
      retrieveOptionalQuestionResponseFromApplicationOrAssessment(application, createMock<TasklistPageInterface>()),
    ).toEqual(undefined)
  })

  it('returns the property if it does exist', () => {
    const application = applicationFactory.build({
      data: {
        'my-task': { 'my-page': { myPage: 'no' } },
      },
    })

    expect(
      retrieveOptionalQuestionResponseFromApplicationOrAssessment(application, createMock<TasklistPageInterface>()),
    ).toEqual(retrieveQuestionResponseFromApplicationOrAssessment(application, createMock<TasklistPageInterface>()))
  })
})
