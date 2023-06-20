import {
  APPLY_FEEDBACK_LINK,
  ASSESS_FEEDBACK_LINK,
  MANAGE_FEEDBACK_LINK,
  MATCH_FEEDBACK_LINK,
  getContent,
} from './phaseBannerUtils'

describe('when there is a feedback link', () => {
  const paths = [
    ['/applications/example', APPLY_FEEDBACK_LINK],
    ['/assessments/example', ASSESS_FEEDBACK_LINK],
    ['/premises/example', MANAGE_FEEDBACK_LINK],
    ['/placement-requests/example', MATCH_FEEDBACK_LINK],
  ]

  test.each(paths)('it returns correct feedback link for path', (path, link) => {
    const content = `This is a new service. <a class="govuk-link" href="${link}">Give us your feedback</a> or <a class="govuk-link" href="mailto:APServiceSupport@digital.justice.gov.uk">email us</a> to report a bug`
    expect(getContent(path)).toEqual(content)
  })
})

describe('when there is not a feedback link for the path', () => {
  it('returns just the email copy', () => {
    const content =
      'This is a new service. <a class="govuk-link" href="mailto:APServiceSupport@digital.justice.gov.uk">Email us</a> to report a bug'
    expect(getContent('/')).toEqual(content)
  })
})
