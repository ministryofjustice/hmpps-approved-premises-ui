import { FormSection, UiTask } from '../../@types/ui'
import { assessmentFactory } from '../../testutils/factories'
import informationSetAsNotReceived from './informationSetAsNotReceived'
import { filterSectionTasks } from './filterSectionTasks'
import AssessApplication from '../../form-pages/assess/assessApplication'

jest.mock('./informationSetAsNotReceived')

describe('filterSectionTasks', () => {
  const assessment = assessmentFactory.build()
  const task: UiTask = { id: 'task-id', title: 'task-title', pages: { page1: 'response' } }
  const section: FormSection = { name: 'section-name', title: 'section-title', tasks: [task] }
  const requiredActionsTask: UiTask = {
    id: 'required-actions',
    title: 'Provide any requirements to support placement',
    pages: { page1: 'response' },
  }
  const sectionWithRequiredActionsTask: FormSection = {
    name: AssessApplication.name,
    title: 'section-title',
    tasks: [requiredActionsTask],
  }

  beforeEach(() => {
    ;(informationSetAsNotReceived as jest.MockedFn<typeof informationSetAsNotReceived>).mockReset()
  })

  it('it returns the section without modification if it doesnt contain the RequiredActions task', () => {
    ;(informationSetAsNotReceived as jest.MockedFn<typeof informationSetAsNotReceived>).mockReturnValue(false)

    expect(filterSectionTasks(section, assessment)).toEqual(section)
  })

  it('returns the section with the RequiredActions task unchanged if informationSetAsNotReceived returns false', () => {
    ;(informationSetAsNotReceived as jest.MockedFn<typeof informationSetAsNotReceived>).mockReturnValue(false)

    expect(filterSectionTasks(sectionWithRequiredActionsTask, assessment)).toEqual(sectionWithRequiredActionsTask)
  })

  it('returns the section with the RequiredActions task removed if informationSetAsNotReceived returns true', () => {
    ;(informationSetAsNotReceived as jest.MockedFn<typeof informationSetAsNotReceived>).mockReturnValue(true)

    expect(filterSectionTasks(sectionWithRequiredActionsTask, assessment)).toEqual({
      ...sectionWithRequiredActionsTask,
      tasks: [],
    })
  })
})
