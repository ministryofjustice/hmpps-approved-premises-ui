import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { TaskListErrors } from '@approved-premises/ui'
import { applicationFactory, assessmentFactory } from '../../testutils/factories'
import TasklistPage from '../tasklistPage'
import { getPageName, getTaskName, pageBodyShallowEquals } from './index'
import { updateFormArtifactData } from './updateFormArtifactData'
import AssessmentCheckYourAnswersPage from '../assess/checkYourAnswers/checkYourAnswersTask/checkYourAnswers'
import ApplicationCheckYourAnswersPage from '../apply/check-your-answers/review'

jest.mock('./index')

const formArtifacts = {
  assessment: {
    factory: assessmentFactory,
    pageClass: AssessmentCheckYourAnswersPage,
  },
  application: {
    factory: applicationFactory,
    pageClass: ApplicationCheckYourAnswersPage,
  },
}

describe('updateFormArtifactData', () => {
  describe.each([['assessment'], ['application']])('with an %s', (artifactType: keyof typeof formArtifacts) => {
    const artifact = formArtifacts[artifactType].factory.build()
    const PageClass = formArtifacts[artifactType].pageClass

    let page: DeepMocked<TasklistPage>

    beforeEach(() => {
      page = createMock<TasklistPage>({
        body: { foo: 'bar' },
      })
      ;(getPageName as jest.Mock).mockImplementation(pageClass => (pageClass === PageClass ? 'review' : 'some-page'))
      ;(getTaskName as jest.Mock).mockImplementation(pageClass =>
        pageClass === PageClass ? 'check-your-answers' : 'some-task',
      )
      ;(pageBodyShallowEquals as jest.Mock).mockReturnValue(false)
    })

    it('returns an assessment with an updated body', () => {
      artifact.data = { 'first-task': { page: { foo: 'bar' } } }

      const updatedArtifact = updateFormArtifactData(page, artifact, PageClass)

      expect(updatedArtifact.data).toEqual({
        'first-task': {
          page: {
            foo: 'bar',
          },
        },
        'some-task': {
          'some-page': {
            foo: 'bar',
          },
        },
      })
    })

    it('invalidates the check your answers task when saving a new page', async () => {
      artifact.data = {
        'some-task': { 'other-page': { question: 'answer' } },
        'check-your-answers': { review: { reviewed: '1' } },
      }

      const updatedArtifact = updateFormArtifactData(page, artifact, PageClass)

      expect(updatedArtifact.data).toEqual({
        'some-task': { 'other-page': { question: 'answer' }, 'some-page': { foo: 'bar' } },
      })
    })

    it('invalidates the check your answers task when changing an existing page', async () => {
      artifact.data = {
        'some-task': { 'some-page': { foo: 'baz' }, 'other-page': { question: 'answer' } },
        'check-your-answers': { review: { reviewed: '1' } },
      }

      const updatedArtifact = updateFormArtifactData(page, artifact, PageClass)

      expect(updatedArtifact.data).toEqual({
        'some-task': { 'other-page': { question: 'answer' }, 'some-page': { foo: 'bar' } },
      })
    })

    it('does not invalidate the check your answers task when saving an existing page with unchanged data', async () => {
      artifact.data = {
        'some-task': { 'some-page': { foo: 'bar' } },
        'check-your-answers': { review: { reviewed: '1' } },
      }
      ;(pageBodyShallowEquals as jest.Mock).mockReturnValue(true)

      const updatedArtifact = updateFormArtifactData(page, artifact, PageClass)

      expect(updatedArtifact.data).toEqual({
        'some-task': { 'some-page': { foo: 'bar' } },
        'check-your-answers': { review: { reviewed: '1' } },
      })
    })

    it('does not invalidate the check your answers task when saving a check your answers page', async () => {
      page = createMock<TasklistPage>({
        errors: () => {
          return {} as TaskListErrors<TasklistPage>
        },
        body: { reviewed: '1' },
      })

      artifact.data = {
        'some-task': { 'other-page': { question: 'answer' } },
      }
      ;(getTaskName as jest.Mock).mockReturnValue('check-your-answers')
      ;(getPageName as jest.Mock).mockReturnValue('review')

      const updatedArtifact = updateFormArtifactData(page, artifact, PageClass)

      expect(updatedArtifact.data).toEqual({
        'some-task': {
          'other-page': { question: 'answer' },
        },
        'check-your-answers': { review: { reviewed: '1' } },
      })
    })
  })
})
