import type { Request, Response, NextFunction } from 'express'
import type { GroupedAssessments } from '@approved-premises/ui'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import { Adjudication, ApprovedPremisesAssessment as Assessment, PrisonCaseNote } from '../../@types/shared'

import TasklistService from '../../services/tasklistService'
import AssessmentsController, { tasklistPageHeading } from './assessmentsController'
import { AssessmentService } from '../../services'

import assessmentFactory from '../../testutils/factories/assessment'
import adjudicationFactory from '../../testutils/factories/adjudication'
import prisonCaseNotesFactory from '../../testutils/factories/prisonCaseNotes'

import paths from '../../paths/assess'
import informationSetAsNotReceived from '../../utils/assessments/informationSetAsNotReceived'
import getSections from '../../utils/assessments/getSections'
import { DateFormats } from '../../utils/dateUtils'

jest.mock('../../utils/assessments/utils')
jest.mock('../../utils/assessments/informationSetAsNotReceived')
jest.mock('../../services/tasklistService')

describe('assessmentsController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const assessmentService = createMock<AssessmentService>({})

  let assessmentsController: AssessmentsController

  beforeEach(() => {
    assessmentsController = new AssessmentsController(assessmentService)
    response = createMock<Response>({})
    request = createMock<Request>({ user: { token } })
  })

  describe('index', () => {
    it('should list all the assessments for a user', async () => {
      const assessments = { completed: [], requestedFurtherInformation: [], awaiting: [] } as GroupedAssessments
      assessmentService.getAllForLoggedInUser.mockResolvedValue(assessments)
      const requestHandler = assessmentsController.index()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('assessments/index', {
        pageHeading: 'Approved Premises applications',
        assessments,
      })
      expect(assessmentService.getAllForLoggedInUser).toHaveBeenCalled()
    })
  })

  describe('show', () => {
    const assessment = assessmentFactory.build()
    const stubTaskList = jest.fn()

    beforeEach(() => {
      request.params.id = assessment.id

      assessmentService.findAssessment.mockResolvedValue(assessment)
      ;(TasklistService as jest.Mock).mockImplementation(() => {
        return stubTaskList
      })
    })

    it('fetches the assessment and renders the task list', async () => {
      const requestHandler = assessmentsController.show()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('assessments/show', {
        assessment,
        pageHeading: 'Assess an Approved Premises (AP) application',
        taskList: stubTaskList,
      })

      expect(assessmentService.findAssessment).toHaveBeenCalledWith(token, assessment.id)
    })

    it('redirects if the assessment is in a pending state and informationSetAsNotReceived is false', async () => {
      ;(informationSetAsNotReceived as jest.Mock).mockReturnValue(false)
      assessment.status = 'pending'

      const requestHandler = assessmentsController.show()

      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        paths.assessments.pages.show({
          id: assessment.id,
          task: 'sufficient-information',
          page: 'information-received',
        }),
      )

      expect(assessmentService.findAssessment).toHaveBeenCalledWith(token, assessment.id)
    })

    it('fetches the assessment and renders the task list  if the assessment is in a pending state and informationSetAsNotReceived is true', async () => {
      ;(informationSetAsNotReceived as jest.Mock).mockReturnValue(true)
      assessment.status = 'pending'

      const requestHandler = assessmentsController.show()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('assessments/show', {
        assessment,
        pageHeading: 'Assess an Approved Premises (AP) application',
        taskList: stubTaskList,
      })

      expect(assessmentService.findAssessment).toHaveBeenCalledWith(token, assessment.id)
    })
  })

  describe('submit', () => {
    const assessment = assessmentFactory.build()

    beforeEach(() => {
      request.params.id = assessment.id

      assessmentService.findAssessment.mockResolvedValue(assessment)
    })

    describe('if the "confirmation" input isnt "confirmed"', () => {
      it('renders the "show" view with errors', async () => {
        request.params.id = 'some-id'
        request.body.confirmation = 'some-id'

        const requestHandler = assessmentsController.submit()

        await requestHandler(request, response, next)

        expect(assessmentService.findAssessment).toHaveBeenCalledWith(token, request)
        expect(response.render).toHaveBeenCalledWith('assessments/show', {
          assessment,
          errorObject: {
            text: 'You must confirm the information provided is complete, accurate and up to date.',
          },
          errorSummary: [
            {
              href: '#confirmation',
              text: 'You must confirm the information provided is complete, accurate and up to date.',
            },
          ],
          pageHeading: tasklistPageHeading,
          sections: getSections(assessment),
        })
      })
    })

    describe('if the "confirmation" input is "confirmed"', () => {
      it('renders the success view', async () => {
        request.params.id = 'some-id'
        request.body.confirmation = 'confirmed'

        const requestHandler = assessmentsController.submit()

        await requestHandler(request, response, next)

        expect(assessmentService.findAssessment).toHaveBeenCalledWith(token, request)
        expect(response.render).toHaveBeenCalledWith('assessments/confirm', {
          pageHeading: 'Assessment submission confirmed',
          assessment,
        })
      })
    })
  })

  describe('prisonInformation', () => {
    let assessment: Assessment
    let adjudications: Array<Adjudication>
    let caseNotes: Array<PrisonCaseNote>

    beforeEach(() => {
      request.params.id = 'some-id'
      assessment = assessmentFactory.build()
      assessment.application.data = {
        'prison-information': {
          'case-notes': {
            adjudications: adjudicationFactory.buildList(2),
            selectedCaseNotes: prisonCaseNotesFactory.buildList(2),
          },
        },
      }
      assessmentService.findAssessment.mockResolvedValue(assessment)
    })

    it('renders the view', async () => {
      const requestHandler = assessmentsController.prisonInformation()

      await requestHandler(request, response, next)

      expect(response.render).toBeCalledWith('assessments/pages/risk-information/prison-information', {
        adjudications,
        caseNotes,
        assessmentId: assessment.id,
        dateOfImport: DateFormats.isoDateToUIDate(assessment.application.submittedAt),
        pageHeading: 'Prison information',
      })
      expect(assessmentService.findAssessment).toBeCalledWith(token, request.params.id)
    })
  })
})
