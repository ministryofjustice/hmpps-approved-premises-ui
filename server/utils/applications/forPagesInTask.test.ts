import { TaskNames } from '@approved-premises/ui'
import Apply from '../../form-pages/apply'
import Assess from '../../form-pages/assess'
import PlacementRequest from '../../form-pages/placement-application'
import { applicationFactory } from '../../testutils/factories'
import { journeyTypeFromArtifact } from '../journeyTypeFromArtifact'
import { forPagesInTask } from './forPagesInTask'

jest.mock('../journeyTypeFromArtifact')
const FirstApplyPage = jest.fn()
const SecondApplyPage = jest.fn()
const ThirdApplyPage = jest.fn()
const AssessPage = jest.fn()
const PlacementRequestPage = jest.fn()

jest.mock('../../form-pages/apply', () => {
  return {
    pages: { 'basic-information': {}, 'type-of-ap': {} },
  }
})

jest.mock('../../form-pages/assess', () => {
  return {
    pages: { 'assess-page': {} },
  }
})

jest.mock('../personUtils')

const firstApplySectionTask1Id = 'first-apply-section-task-1' as TaskNames
const firstApplySectionTask2Id = 'first-apply-section-task-2' as TaskNames

const applySection1Task1 = {
  id: firstApplySectionTask1Id,
  title: 'First Apply section, task 1',
  actionText: '',
  pages: {
    first: FirstApplyPage,
    second: SecondApplyPage,
    third: ThirdApplyPage,
  },
}
const applySection1Task2 = {
  id: firstApplySectionTask2Id,
  title: 'First Apply section, task 2',
  actionText: '',
  pages: {},
}

const applySection2Task1 = {
  id: 'second-apply-section-task-1' as TaskNames,
  title: 'Second Apply section, task 1',
  actionText: '',
  pages: {},
}

const applySection2Task2 = {
  id: 'second-apply-section-task-2' as TaskNames,
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

Apply.pages[firstApplySectionTask1Id] = {
  first: FirstApplyPage,
  second: SecondApplyPage,
  third: ThirdApplyPage,
}

const assessSection1Task1 = {
  id: 'first-apply-section-task-1' as TaskNames,
  title: 'First Apply section, task 1',
  actionText: '',
  pages: {},
}
const assessSection1Task2 = {
  id: 'first-assess-section-task-2' as TaskNames,
  title: 'First Assess section, task 2',
  actionText: '',
  pages: {},
}

const assessSection2Task1 = {
  id: 'second-assess-section-task-1' as TaskNames,
  title: 'Second Assess section, task 1',
  actionText: '',
  pages: {},
}

const assessSection2Task2 = {
  id: 'second-assess-section-task-2' as TaskNames,
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

// @ts-expect-error Test page ids
Assess.pages['assess-page'] = {
  first: AssessPage,
}

// @ts-expect-error Test page ids
PlacementRequest.pages['placement-request-page'] = {
  first: PlacementRequestPage,
}

describe('forPagesInTask', () => {
  it('iterates through the pages of a task', () => {
    ;(journeyTypeFromArtifact as jest.MockedFunction<typeof journeyTypeFromArtifact>).mockReturnValue('applications')

    const firstApplyPageInstance = {
      next: () => 'second',
    }
    const secondApplyPageInstance = {
      next: () => '',
    }

    FirstApplyPage.mockReturnValue(firstApplyPageInstance)
    SecondApplyPage.mockReturnValue(secondApplyPageInstance)
    const spy = jest.fn()

    const application = applicationFactory.build({
      data: {
        [firstApplySectionTask1Id]: { first: { foo: 'bar' }, second: { bar: 'foo' } },
      },
    })

    forPagesInTask(application, applySection1Task1, spy)

    expect(spy).toHaveBeenCalledWith(firstApplyPageInstance, 'first')
    expect(spy).toHaveBeenCalledWith(secondApplyPageInstance, 'second')
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('skips tasks that are not part of the user journey', () => {
    ;(journeyTypeFromArtifact as jest.MockedFunction<typeof journeyTypeFromArtifact>).mockReturnValue('applications')

    const firstApplyPageInstance = {
      next: () => '',
    }

    FirstApplyPage.mockReturnValue(firstApplyPageInstance)
    const spy = jest.fn()

    const application = applicationFactory.build({
      data: {
        [firstApplySectionTask1Id]: { first: { foo: 'bar' }, second: { bar: 'foo' } },
      },
    })

    forPagesInTask(application, applySection1Task1, spy)

    expect(spy).toHaveBeenCalledWith(firstApplyPageInstance, 'first')
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('skips pages for which there is no data in the application', () => {
    ;(journeyTypeFromArtifact as jest.MockedFunction<typeof journeyTypeFromArtifact>).mockReturnValue('applications')

    const applyPageWithNoData = {
      next: () => '',
    }
    const secondApplyPageInstance = {
      next: () => '',
    }

    FirstApplyPage.mockReturnValue(applyPageWithNoData)
    SecondApplyPage.mockReturnValue(secondApplyPageInstance)
    const spy = jest.fn()

    const application = applicationFactory.build({
      data: {
        [firstApplySectionTask1Id]: { first: undefined, second: { bar: 'foo' } },
      },
    })

    forPagesInTask(application, applySection1Task1, spy)

    expect(spy).not.toHaveBeenCalledWith(applyPageWithNoData)
    expect(spy).toHaveBeenCalledWith(secondApplyPageInstance, 'second')
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('throws if the saved data creates an infinite loop', () => {
    ;(journeyTypeFromArtifact as jest.MockedFunction<typeof journeyTypeFromArtifact>).mockReturnValue('applications')

    const firstApplyPageInstance = {
      next: () => 'second',
    }
    const secondApplyPageInstance = {
      next: () => 'first',
    }

    FirstApplyPage.mockReturnValue(firstApplyPageInstance)
    SecondApplyPage.mockReturnValue(secondApplyPageInstance)
    const spy = jest.fn()

    const application = applicationFactory.build({
      data: {
        [firstApplySectionTask1Id]: { first: { foo: 'bar' }, second: { bar: 'foo' } },
      },
    })

    expect(() => forPagesInTask(application, applySection1Task1, spy)).toThrow(
      new Error('Page already visited while building task list: first. Visited pages: first, second'),
    )
  })

  it('prevents a page being visited again through lack of previous page data', () => {
    ;(journeyTypeFromArtifact as jest.MockedFunction<typeof journeyTypeFromArtifact>).mockReturnValue('applications')

    const firstApplyPageInstance = {
      next: () => 'third',
    }
    const secondApplyPageInstance = {
      next: () => '',
    }
    const thirdApplyPageInstance = {
      next: () => 'second',
    }

    FirstApplyPage.mockReturnValue(firstApplyPageInstance)
    SecondApplyPage.mockReturnValue(secondApplyPageInstance)
    ThirdApplyPage.mockReturnValue(thirdApplyPageInstance)
    const spy = jest.fn()

    const application = applicationFactory.build({
      data: {
        [firstApplySectionTask1Id]: { first: { foo: 'bar' }, second: undefined, third: { bar: 'foo' } },
      },
    })

    forPagesInTask(application, applySection1Task1, spy)

    expect(spy).toHaveBeenCalledWith(firstApplyPageInstance, 'first')
    expect(spy).toHaveBeenCalledWith(thirdApplyPageInstance, 'third')
    expect(spy).toHaveBeenCalledTimes(2)
  })
})
