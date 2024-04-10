import type { Request, RequestHandler, Response } from 'express'

import { addErrorMessageToFlash, fetchErrorsAndUserInput } from '../../utils/validation'
import TasklistService from '../../services/tasklistService'
import { AssessmentService, FeatureFlagService, TaskService } from '../../services'
import informationSetAsNotReceived from '../../utils/assessments/informationSetAsNotReceived'

import paths from '../../paths/assess'
import { AssessmentSortField, AssessmentStatus, TaskSortField } from '../../@types/shared'
import { awaitingAssessmentStatuses } from '../../utils/assessments/utils'
import { getPaginationDetails } from '../../utils/getPaginationDetails'

export const tasklistPageHeading = 'Assess an Approved Premises (AP) application'

export default class AssessmentsController {
  constructor(
    private readonly assessmentService: AssessmentService,
    private readonly taskService: TaskService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { activeTab } = req.query
      const { pageNumber, sortBy, sortDirection, hrefPrefix } = getPaginationDetails<
        AssessmentSortField & TaskSortField
      >(req, paths.assessments.index({}), { activeTab })
      const pageHeading = 'Approved Premises applications'
      const statuses =
        activeTab === 'awaiting_assessment' || !activeTab
          ? awaitingAssessmentStatuses
          : ([activeTab] as Array<AssessmentStatus>)

      if (activeTab === 'requests_for_placement') {
        const placementApplications = await this.taskService.getAll({
          token: req.user.token,
          taskTypes: ['PlacementApplication'],
          page: pageNumber,
          allocatedFilter: 'allocated',
          sortBy,
          sortDirection,
          allocatedToUserId: res.locals?.user?.id,
        })

        res.render('assessments/index', {
          pageHeading,
          activeTab,
          placementApplications: placementApplications.data,
          pageNumber: Number(placementApplications.pageNumber),
          totalPages: Number(placementApplications.totalPages),
          hrefPrefix,
          sortBy,
          sortDirection,
        })
      } else {
        const assessments = await this.assessmentService.getAll(
          req.user.token,
          statuses,
          sortBy,
          sortDirection,
          pageNumber,
        )

        res.render('assessments/index', {
          pageHeading,
          activeTab,
          assessments: assessments.data,
          placementApplications: undefined,
          pageNumber: Number(assessments.pageNumber),
          totalPages: Number(assessments.totalPages),
          hrefPrefix,
          sortBy,
          sortDirection,
        })
      }
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const assessment = await this.assessmentService.findAssessment(req.user.token, req.params.id)
      const noteAwaitingResponse = assessment.status === 'awaiting_response' && !informationSetAsNotReceived(assessment)
      const { errors, errorSummary } = fetchErrorsAndUserInput(req)

      if (assessment.status === 'completed') {
        const referrer = req.headers.referer

        res.render('assessments/show', {
          assessment,
          referrer,
        })
      } else if (noteAwaitingResponse) {
        res.redirect(
          paths.assessments.pages.show({
            id: assessment.id,
            task: 'sufficient-information',
            page: 'information-received',
          }),
        )
      } else {
        const taskList = await TasklistService.initialize(assessment, this.featureFlagService)

        res.render('assessments/tasklist', {
          assessment,
          pageHeading: tasklistPageHeading,
          taskList,
          errorSummary,
          errors,
        })
      }
    }
  }

  submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const assessment = await this.assessmentService.findAssessment(req.user.token, req.params.id)
      const featureFlags = await this.featureFlagService.getAll()

      if (req.body?.confirmation !== 'confirmed') {
        addErrorMessageToFlash(
          req,
          'You must confirm the information provided is complete, accurate and up to date.',
          'confirmation',
        )

        return res.redirect(paths.assessments.show({ id: assessment.id }))
      }

      await this.assessmentService.submit(req.user.token, assessment, featureFlags)

      return res.render('assessments/confirm', {
        pageHeading: 'Assessment submission confirmed',
        assessment,
      })
    }
  }
}
