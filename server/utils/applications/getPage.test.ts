import Apply from '../../form-pages/apply'
import Assess from '../../form-pages/assess'
import PlacementRequest from '../../form-pages/placement-application'
import { UnknownPageError } from '../errors'
import { getPage } from './getPage'

const FirstApplyPage = jest.fn()
const SecondApplyPage = jest.fn()
const AssessPage = jest.fn()
const PlacementRequestPage = jest.fn()

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

const assessSection1Task1 = {
  id: 'first-assess-section-task-1',
  title: 'First Apply section, task 1',
  actionText: '',
  pages: {},
}
const assessSection1Task2 = {
  id: 'first-assess-section-task-2',
  title: 'First Assess section, task 2',
  actionText: '',
  pages: {},
}

const assessSection2Task1 = {
  id: 'second-assess-section-task-1',
  title: 'Second Assess section, task 1',
  actionText: '',
  pages: {},
}

const assessSection2Task2 = {
  id: 'second-assess-section-task-2',
  title: 'Second Assess section, task 2',
  actionText: '',
  pages: {},
}

const assessSection1 = {
  name: 'first-assess-section',
  title: 'First Assess section',
  tasks: [assessSection1Task1, assessSection1Task2],
}

const assessSection2 = {
  name: 'second-assess-section',
  title: 'Second Assess section',
  tasks: [assessSection2Task1, assessSection2Task2],
}

Assess.sections = [assessSection1, assessSection2]

Assess.pages['assess-page'] = {
  first: AssessPage,
}

PlacementRequest.pages['placement-request-page'] = {
  first: PlacementRequestPage,
}

describe('getPage', () => {
  it('should return a page from Apply if it exists', () => {
    expect(getPage('first-apply-section-task-1', 'first', 'applications')).toEqual(FirstApplyPage)
    expect(getPage('first-apply-section-task-1', 'second', 'applications')).toEqual(SecondApplyPage)
  })

  it('should return a page from assess if passed the an assessment', () => {
    expect(getPage('assess-page', 'first', 'assessments')).toEqual(AssessPage)
  })

  it('should return a page from the placement request journey if passed the placement requests', () => {
    expect(getPage('placement-request-page', 'first', 'placement-applications')).toEqual(PlacementRequestPage)
  })

  it('should raise an error if the page is not found', async () => {
    expect(() => {
      getPage('basic-information', 'bar', 'applications')
    }).toThrow(UnknownPageError)
  })
})
