import { SummaryListActions } from '@approved-premises/ui'
import { createMock } from '@golevelup/ts-jest'
import Apply from '../form-pages/apply'
import applicationFactory from '../testutils/factories/application'
import assessmentFactory from '../testutils/factories/assessment'
import isAssessment from './assessments/isAssessment'
import reviewSections from './reviewUtils'

jest.mock('./assessments/isAssessment')

jest.mock('../form-pages/apply', () => {
  return {
    pages: { 'basic-information': {}, 'type-of-ap': {} },
    sections: [
      {
        title: 'First',
        tasks: [
          {
            id: 'basic-information',
            title: 'Basic Information',
            pages: { 'basic-information': {}, 'type-of-ap': {} },
          },
        ],
      },
      {
        title: 'Second',
        tasks: [],
      },
    ],
  }
})
jest.mock('../form-pages/assess', () => {
  return {
    pages: { 'assess-page': {} },
    sections: [
      {
        title: 'First',
        tasks: [
          {
            id: 'assess-page-1',
            title: 'Assess page one',
            pages: { 'assess-page-1': {} },
          },
        ],
      },
      {
        title: 'Second',
        tasks: [
          {
            id: 'assess-page-2',
            title: 'Assess page two',
            pages: { 'assess-page-2': {} },
          },
        ],
      },
    ],
  }
})

describe('reviewSections', () => {
  it('returns an object for each non-check your answers Apply section', () => {
    const application = applicationFactory.build()
    const spy = jest.fn()

    const nonCheckYourAnswersSections = Apply.sections.slice(0, -1)
    const result = reviewSections(application, spy)

    expect(isAssessment).toHaveBeenCalledWith(application)
    expect(result).toHaveLength(nonCheckYourAnswersSections.length)
  })

  it('returns an object with the titles of each section and an object for each task', () => {
    const application = applicationFactory.build()
    const spy = jest.fn()

    const result = reviewSections(application, spy)

    expect(isAssessment).toHaveBeenCalledWith(application)
    expect(result).toEqual([
      {
        title: 'First',
        tasks: [
          {
            card: {
              title: { text: 'Basic Information', headingLevel: 3 },
              attributes: { 'data-cy-section': 'basic-information' },
            },
          },
        ],
      },
    ])
  })

  it('returns the assess page objects if passed an assessment', () => {
    const assessment = assessmentFactory.build()
    const spy = jest.fn()

    ;(isAssessment as unknown as jest.Mock).mockReturnValue(true)

    const result = reviewSections(assessment, spy)

    expect(isAssessment).toHaveBeenCalledWith(assessment)

    expect(result).toEqual([
      {
        title: 'First',
        tasks: [
          {
            card: {
              title: { text: 'Assess page one', headingLevel: 3 },
              attributes: { 'data-cy-section': 'assess-page-1' },
            },
          },
        ],
      },
    ])
  })

  it('calls the rowFunction for each task with the task and application', () => {
    const application = applicationFactory.build()
    const spy = jest.fn()
    ;(isAssessment as unknown as jest.Mock).mockReturnValue(false)

    reviewSections(application, spy)

    expect(isAssessment).toHaveBeenCalledWith(application)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      {
        id: 'basic-information',
        title: 'Basic Information',
        pages: { 'basic-information': {}, 'type-of-ap': {} },
      },
      application,
      true,
    )
  })

  it('calls the rowFunction for each task with the task, application and showActions if specified', () => {
    const application = applicationFactory.build()
    const rowFunctionSpy = jest.fn()
    ;(isAssessment as unknown as jest.Mock).mockReturnValue(false)

    reviewSections(application, rowFunctionSpy, false)

    expect(isAssessment).toHaveBeenCalledWith(application)
    expect(rowFunctionSpy).toHaveBeenCalledTimes(1)
    expect(rowFunctionSpy).toHaveBeenCalledWith(
      {
        id: 'basic-information',
        title: 'Basic Information',
        pages: { 'basic-information': {}, 'type-of-ap': {} },
      },
      application,
      false,
    )
  })

  it('calls the cardActionFunction if specified', () => {
    const application = applicationFactory.build()
    const cardActions = createMock<SummaryListActions>()
    const cardActionFunction = jest.fn(() => cardActions)

    ;(isAssessment as unknown as jest.Mock).mockReturnValue(false)

    const result = reviewSections(application, jest.fn(), false, cardActionFunction)

    expect(result[0].tasks[0].card.actions).toEqual(cardActions)
    expect(cardActionFunction).toHaveBeenCalledWith('basic-information')
  })
})
