import { FormSection, TaskNames, UiTask } from 'server/@types/ui'
import Apply from '../apply'
import Assess from '../assess'
import PlacementRequest from '../placement-application'
import { UnknownPageError } from '../../utils/errors'
import { getPage, getSections } from './getPage'
import { journeyTypeFromArtifact } from '../../utils/journeyTypeFromArtifact'
import { applicationFactory, assessmentFactory, placementApplicationFactory } from '../../testutils/factories'

const FirstApplyPage = jest.fn()
const SecondApplyPage = jest.fn()
const AssessPage = jest.fn()
const PlacementRequestPage = jest.fn()

jest.mock('../../utils/journeyTypeFromArtifact')

const applySection1Task1: UiTask = {
  id: 'first-apply-section-task-1' as TaskNames,
  title: 'First Apply section, task 1',
  pages: {
    first: FirstApplyPage,
    second: SecondApplyPage,
  },
}
const applySection1Task2: UiTask = {
  id: 'first-apply-section-task-2' as TaskNames,
  title: 'First Apply section, task 2',
  pages: {},
}

const applySection2Task1: UiTask = {
  id: 'second-apply-section-task-1' as TaskNames,
  title: 'Second Apply section, task 1',
  pages: {},
}

const applySection2Task2: UiTask = {
  id: 'second-apply-section-task-2' as TaskNames,
  title: 'Second Apply section, task 2',
  pages: {},
}

const applySection1: FormSection = {
  name: 'first-apply-section',
  title: 'First Apply section',
  tasks: [applySection1Task1, applySection1Task2],
}

const applySection2: FormSection = {
  name: 'second-apply-section',
  title: 'Second Apply section',
  tasks: [applySection2Task1, applySection2Task2],
}

Apply.sections = [applySection1, applySection2]

Apply.pages['first-apply-section-task-1' as TaskNames] = {
  first: FirstApplyPage,
  second: SecondApplyPage,
}

const assessSection1Task1: UiTask = {
  id: 'first-assess-section-task-1' as TaskNames,
  title: 'First Apply section, task 1',
  pages: {},
}
const assessSection1Task2: UiTask = {
  id: 'first-assess-section-task-2' as TaskNames,
  title: 'First Assess section, task 2',
  pages: {},
}

const assessSection2Task1: UiTask = {
  id: 'second-assess-section-task-1' as TaskNames,
  title: 'Second Assess section, task 1',
  pages: {},
}

const assessSection2Task2: UiTask = {
  id: 'second-assess-section-task-2' as TaskNames,
  title: 'Second Assess section, task 2',
  pages: {},
}

const assessSection1: FormSection = {
  name: 'first-assess-section',
  title: 'First Assess section',
  tasks: [assessSection1Task1, assessSection1Task2],
}

const assessSection2: FormSection = {
  name: 'second-assess-section',
  title: 'Second Assess section',
  tasks: [assessSection2Task1, assessSection2Task2],
}

Assess.sections = [assessSection1, assessSection2]

// @ts-expect-error Test page ids
Assess.pages['assess-page'] = {
  first: AssessPage,
}

// @ts-expect-error Test page ids
PlacementRequest.pages['placement-request-page'] = {
  first: PlacementRequestPage,
}

describe('getPage', () => {
  it('should return a page from Apply if it exists', () => {
    // @ts-expect-error Test page ids
    expect(getPage('first-apply-section-task-1', 'first', 'applications')).toEqual(FirstApplyPage)
    // @ts-expect-error Test page ids
    expect(getPage('first-apply-section-task-1', 'second', 'applications')).toEqual(SecondApplyPage)
  })

  it('should return a page from assess if passed the an assessment', () => {
    // @ts-expect-error Test page ids
    expect(getPage('assess-page', 'first', 'assessments')).toEqual(AssessPage)
  })

  it('should return a page from the placement request journey if passed the placement requests', () => {
    // @ts-expect-error Test page ids
    expect(getPage('placement-request-page', 'first', 'placement-applications')).toEqual(PlacementRequestPage)
  })

  it('should raise an error if the page is not found', async () => {
    expect(() => {
      getPage('basic-information', 'bar', 'applications')
    }).toThrow(UnknownPageError)
  })
})

describe('getSections', () => {
  it('returns Apply sections when given an application', () => {
    ;(journeyTypeFromArtifact as jest.MockedFunction<typeof journeyTypeFromArtifact>).mockReturnValue('applications')

    const application = applicationFactory.build()
    const sections = getSections(application)

    expect(sections).toEqual(Apply.sections.slice(0, -1))
  })

  it('returns Assess sections when given an assessment', () => {
    ;(journeyTypeFromArtifact as jest.MockedFunction<typeof journeyTypeFromArtifact>).mockReturnValue('assessments')

    const assessment = assessmentFactory.build()
    const sections = getSections(assessment)

    expect(sections).toEqual(Assess.sections)
  })

  it('returns PlacementApplication sections when given a placement application', () => {
    ;(journeyTypeFromArtifact as jest.MockedFunction<typeof journeyTypeFromArtifact>).mockReturnValue(
      'placement-applications',
    )

    const placementApplication = placementApplicationFactory.build()

    const sections = getSections(placementApplication)

    expect(sections).toEqual(PlacementRequest.sections)
  })
})
