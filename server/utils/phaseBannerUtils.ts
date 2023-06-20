import assessPaths from '../paths/assess'
import applyPaths from '../paths/apply'
import managePaths from '../paths/manage'
import matchPaths from '../paths/match'

export const APPLY_FEEDBACK_LINK =
  'https://forms.office.com/Pages/ResponsePage.aspx?id=KEeHxuZx_kGp4S6MNndq2H0aht4jI_tEtV4d1X0VL3lUOEw5WlFaUVFEWTQwRUtSWURGRUtFNzRDTi4u'
export const ASSESS_FEEDBACK_LINK =
  'https://forms.office.com/Pages/ResponsePage.aspx?id=KEeHxuZx_kGp4S6MNndq2EXSevEnO7lHpH52Z5zJdrxUMElWTjU2NlhXMlZTNEJMMkk3TDMzOERRRi4u'
export const MANAGE_FEEDBACK_LINK =
  'https://forms.office.com/Pages/ResponsePage.aspx?id=KEeHxuZx_kGp4S6MNndq2EXSevEnO7lHpH52Z5zJdrxUNjgwNEgxRVIzRjE5RVM4WDhEQUZCUE5LUS4u'
export const MATCH_FEEDBACK_LINK =
  'https://forms.office.com/Pages/ResponsePage.aspx?id=KEeHxuZx_kGp4S6MNndq2EXSevEnO7lHpH52Z5zJdrxUOUpPMVZCQkhXWEFSQjVaUFJQUzhWMlQ4Ny4u'

export const getContent = (currentUrl: string) => {
  const feedbackLink = getFeedbackLink(currentUrl)

  return feedbackLink
    ? `This is a new service. <a class="govuk-link" href="${feedbackLink}">Give us your feedback</a> or <a class="govuk-link" href="mailto:APServiceSupport@digital.justice.gov.uk">email us</a> to report a bug`
    : 'This is a new service. <a class="govuk-link" href="mailto:APServiceSupport@digital.justice.gov.uk">Email us</a> to report a bug'
}

const getFeedbackLink = (currentUrl: string) => {
  if (currentUrl.startsWith(applyPaths.applications.index.pattern)) {
    return APPLY_FEEDBACK_LINK
  }
  if (currentUrl.startsWith(assessPaths.assessments.index.pattern)) {
    return ASSESS_FEEDBACK_LINK
  }
  if (currentUrl.startsWith(managePaths.premises.index.pattern)) {
    return MANAGE_FEEDBACK_LINK
  }
  if (currentUrl.startsWith(matchPaths.placementRequests.index.pattern)) {
    return MATCH_FEEDBACK_LINK
  }

  return null
}
