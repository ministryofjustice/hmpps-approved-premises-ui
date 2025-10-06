import {
  ApprovedPremisesApplication,
  ApprovedPremisesApplicationStatus,
  ApprovedPremisesAssessment,
  Cas1ApplicationSummary,
} from '@approved-premises/api'
import { GIVEN } from '../../helpers'
import {
  activeOffenceFactory,
  applicationFactory,
  assessmentFactory,
  cas1TimelineEventFactory,
  personFactory,
  risksFactory,
  tierEnvelopeFactory,
} from '../../../server/testutils/factories'
import { DateFormats } from '../../../server/utils/dateUtils'
import { defaultUserId } from '../../mockApis/auth'
import { signIn } from '../signIn'
import applicationDocument from '../../fixtures/applicationDocument.json'
import applicationData from '../../fixtures/applicationData.json'
import assessmentDocument from '../../fixtures/assessmentDocument.json'

export const setup = (
  settings: {
    application?: Partial<ApprovedPremisesApplication>
    assessment?: Partial<ApprovedPremisesAssessment>
  } = {},
) => {
  cy.task('reset')

  GIVEN('I am signed in as an applicant')
  signIn('applicant', { id: defaultUserId })

  const status: ApprovedPremisesApplicationStatus = settings?.application?.status || 'started'
  const person = personFactory.build()
  const isAssessed = [
    'awaitingPlacement',
    'placementAllocated',
    'inapplicable',
    'pendingPlacementRequest',
    'rejected',
  ].includes(status)
  const isSubmitted = !['started', 'withdrawn'].includes(status)
  const assessment =
    isAssessed &&
    assessmentFactory.build({
      decision: status === 'rejected' ? 'rejected' : 'accepted',
      document: assessmentDocument,
      ...(settings.assessment || {}),
    })
  const application = applicationFactory.build({
    person,
    status,
    createdAt: DateFormats.dateObjToIsoDate(new Date()),
    createdByUserId: defaultUserId,
    assessmentId: assessment?.id,
    assessmentDecision: assessment?.decision,
    assessmentDecisionDate: assessment?.createdAt,
    document: isSubmitted && applicationDocument,
    ...(settings.application || {}),
  })
  const risks = risksFactory.build({
    crn: person.crn,
    tier: tierEnvelopeFactory.build({ value: { level: 'A3' } }),
  })

  const offences = activeOffenceFactory.buildList(1)

  application.data = applicationData
  application.risks = risks

  const applicationSummary: Cas1ApplicationSummary = {
    ...application,
    hasRequestsForPlacement: true,
    isWithdrawn: status === 'withdrawn',
  }

  const timeline = cas1TimelineEventFactory.buildList(10)

  cy.wrap(person).as('person')
  cy.wrap(offences).as('offences')
  cy.wrap(application).as('application')
  cy.wrap(application.data).as('applicationData')
  cy.wrap(assessment).as('assessment')
  cy.task('stubApplicationGet', { application })
  cy.task('stubApplications', [application])
  if (assessment) {
    cy.task('stubAssessment', assessment)
  }
  cy.task('stubApplicationTimeline', { applicationId: application.id, timeline })

  return { application, assessment, timeline, applicationSummary, person, offences, applicationData }
}
