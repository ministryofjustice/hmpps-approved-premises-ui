import Apply from '../../form-pages/apply'
import { applicationFactory } from '../../testutils/factories'
import { journeyTypeFromArtifact } from '../journeyTypeFromArtifact'
import { getResponses } from './getResponses'

jest.mock('../journeyTypeFromArtifact')

const FirstApplyPage = jest.fn()
const SecondApplyPage = jest.fn()

const applySection1Task1 = {
  id: 'first-apply-section-task-1',
  title: 'First Apply section, task 1',
  actionText: '',
  pages: {
    first: FirstApplyPage,
    second: SecondApplyPage,
  },
}
const applySection1Task2 = {
  id: 'first-apply-section-task-2',
  title: 'First Apply section, task 2',
  actionText: '',
  pages: {},
}

const applySection2Task1 = {
  id: 'second-apply-section-task-1',
  title: 'Second Apply section, task 1',
  actionText: '',
  pages: {},
}

const applySection2Task2 = {
  id: 'second-apply-section-task-2',
  title: 'Second Apply section, task 2',
  actionText: '',
  pages: {},
}

const applySection1 = {
  name: 'first-apply-section',
  title: 'First Apply section',
  tasks: [applySection1Task1, applySection1Task2],
}

const applySection2 = {
  name: 'second-apply-section',
  title: 'Second Apply section',
  tasks: [applySection2Task1, applySection2Task2],
}

Apply.sections = [applySection1, applySection2]

Apply.pages['first-apply-section-task-1'] = {
  first: FirstApplyPage,
  second: SecondApplyPage,
}

describe('getResponses', () => {
  it('returns the responses from all answered questions', () => {
    ;(journeyTypeFromArtifact as jest.MockedFunction<typeof journeyTypeFromArtifact>).mockReturnValue('applications')

    FirstApplyPage.mockReturnValue({
      response: () => ({ foo: 'bar' }),
      next: () => 'second',
    })

    SecondApplyPage.mockReturnValue({
      response: () => ({ bar: 'foo' }),
      next: () => '',
    })

    const application = applicationFactory.build({
      data: {
        'first-apply-section-task-1': { first: { foo: 'bar' }, second: { bar: 'foo' } },
      },
    })

    expect(getResponses(application)).toEqual({
      'first-apply-section-task-1': [{ foo: 'bar' }, { bar: 'foo' }],
      'first-apply-section-task-2': [],
    })
  })
})
