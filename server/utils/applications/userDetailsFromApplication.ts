import { ApprovedPremisesApplication as Application, Cas1ApplicationUserDetails } from '@approved-premises/api'
import CaseManagerInformation, {
  caseManagerKeys,
} from '../../form-pages/apply/reasons-for-placement/basic-information/caseManagerInformation'
import ConfirmYourDetails, {
  UserDetails,
} from '../../form-pages/apply/reasons-for-placement/basic-information/confirmYourDetails'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'

export const userDetailsFromConfirmYourDetailsPage = (application: Application): Cas1ApplicationUserDetails => {
  const detailsForConsumer: Cas1ApplicationUserDetails = {} as Cas1ApplicationUserDetails
  const detailsFromPage: UserDetails = {} as UserDetails

  const userDetailsFromDelius = retrieveOptionalQuestionResponseFromFormArtifact(
    application,
    ConfirmYourDetails,
    'userDetailsFromDelius',
  )
  const detailsToUpdate = retrieveOptionalQuestionResponseFromFormArtifact(
    application,
    ConfirmYourDetails,
    'detailsToUpdate',
  )

  caseManagerKeys.forEach(field => {
    detailsFromPage[field] =
      (detailsToUpdate?.includes(field) &&
        retrieveOptionalQuestionResponseFromFormArtifact(application, ConfirmYourDetails, field)) ||
      userDetailsFromDelius?.[field]
  })

  detailsForConsumer.name = detailsFromPage.name
  detailsForConsumer.email = detailsFromPage.emailAddress
  detailsForConsumer.telephoneNumber = detailsFromPage.phoneNumber

  return detailsForConsumer
}

export const userDetailsFromCaseManagerPage = (application: Application): Cas1ApplicationUserDetails => {
  const details: Cas1ApplicationUserDetails = {} as Cas1ApplicationUserDetails

  details.name = retrieveOptionalQuestionResponseFromFormArtifact(application, CaseManagerInformation, 'name')
  details.email = retrieveOptionalQuestionResponseFromFormArtifact(application, CaseManagerInformation, 'emailAddress')
  details.telephoneNumber = retrieveOptionalQuestionResponseFromFormArtifact(
    application,
    CaseManagerInformation,
    'phoneNumber',
  )

  return details
}
