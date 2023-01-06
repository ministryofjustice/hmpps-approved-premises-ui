import Apply from '../form-pages/apply'
import applicationFactory from '../testutils/factories/application'
import reviewSections from './reviewUtils'

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

describe('reviewSections', () => {
  it('returns an object for each non-check your answers Apply section', () => {
    const application = applicationFactory.build()
    const spy = jest.fn()

    const nonCheckYourAnswersSections = Apply.sections.slice(0, -1)

    expect(reviewSections(application, spy)).toHaveLength(nonCheckYourAnswersSections.length)
  })

  it('returns an object with the titles of each section and an object for each task', () => {
    const application = applicationFactory.build()
    const spy = jest.fn()

    expect(reviewSections(application, spy)).toEqual([
      { tasks: [{ id: 'basic-information', rows: undefined, title: 'Basic Information' }], title: 'First' },
    ])
  })

  it('calls the rowFunction for each task with the task and application', () => {
    const application = applicationFactory.build()
    const spy = jest.fn()

    reviewSections(application, spy)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      {
        id: 'basic-information',
        title: 'Basic Information',
        pages: { 'basic-information': {}, 'type-of-ap': {} },
      },
      application,
    )
  })
})
