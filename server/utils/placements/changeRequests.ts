import { NamedId } from '@approved-premises/api'
import { AppealSessionData, ObjectWithDateParts, RadioItem, SummaryListItem } from '@approved-premises/ui'
import nunjucks from 'nunjucks'
import { dateAndTimeInputsAreValidDates, DateFormats, datetimeIsInThePast } from '../dateUtils'
import { ValidationError } from '../errors'
import { summaryListItem } from '../formUtils'

export const appealReasonRadioDefinitions: Record<string, { text: string; conditionalQuestion: string }> = {
  staffConflictOfInterest: {
    text: 'Staff conflict of interest',
    conditionalQuestion:
      'Say whether a staff member knows or has had a previous experience with the person. Do not include personal information.',
  },
  exclusionZoneOrProximityToVictim: {
    text: 'Exclusion zone or proximity to victim',
    conditionalQuestion:
      'State how an exclusion zone or proximity to the victim applies. Do not include personal information.',
  },
  offenceNotAccepted: {
    text: 'Offence not accepted',
    conditionalQuestion: 'Say which offence is not accepted by the AP.',
  },
  apCannotMeetSpecificNeeds: {
    text: 'AP cannot meet specific needs (because the person’s needs have changed)',
    conditionalQuestion: 'How have the placement needs changed?',
  },
  residentMixOrNonAssociates: {
    text: 'Resident mix or non-associates',
    conditionalQuestion: 'Say which applies and give details. ',
  },
}

export const getConditionalHtml = (name: string, conditionalQuestion: string, context: Record<string, unknown>) => {
  const errors = context.errors as Record<string, string>
  const textboxContext = {
    name,
    value: context[name],
    conditionalQuestion,
    errorMessage: errors?.[name],
  }

  return nunjucks.render('manage/premises/placements/changeRequests/detailsTextarea.njk', textboxContext)
}

export const mapAppealReasonsToRadios = (
  appealReasons: Array<NamedId>,
  context: Record<string, unknown>,
): Array<RadioItem> => {
  const selectedValue = context.appealReason
  return appealReasons
    .map(({ name }) => {
      if (!appealReasonRadioDefinitions[name]) return null
      const { text, conditionalQuestion } = appealReasonRadioDefinitions[name]
      const conditionalHtml = getConditionalHtml(`${name}Detail`, conditionalQuestion, context)
      return { value: name, text, conditional: { html: conditionalHtml }, checked: selectedValue === name }
    })
    .filter(Boolean)
}

export const getAppealReasonId = (reasonName: string, reasonList: Array<NamedId>): string => {
  return reasonList.find(({ name }) => name === reasonName)?.id
}

export const getAppealReasonText = (body: AppealSessionData): string => {
  const { appealReason } = body
  const detailKey = `${appealReason}Detail` as keyof AppealSessionData
  const definition = appealReasonRadioDefinitions[appealReason]
  return definition ? `${definition.text}\n\n${body[detailKey]}` : ''
}

export const validateNewAppealResponse = (body: AppealSessionData): void => {
  const errors: Record<string, string> = {}
  const { areaManagerName, areaManagerEmail, appealReason } = body
  const { approvalDate } = DateFormats.dateAndTimeInputsToIsoString(
    body as ObjectWithDateParts<'approvalDate'>,
    'approvalDate',
  )

  if (!areaManagerName) {
    errors.areaManagerName = 'You must provide the name of the approving area manager'
  }
  if (!areaManagerEmail) {
    errors.areaManagerEmail = 'You must provide the email address of the approving area manager'
  }
  if (!approvalDate) {
    errors.approvalDate = 'You must enter the date of the approval'
  } else if (!dateAndTimeInputsAreValidDates(body as ObjectWithDateParts<'approvalDate'>, 'approvalDate')) {
    errors.approvalDate = 'You must enter a valid approval date'
  } else if (!datetimeIsInThePast(approvalDate)) {
    errors.approvalDate = 'The approval date must be today or in the past'
  }
  if (!appealReason) {
    errors.appealReason = 'You must select a reason for the appeal'
  } else if (!body[`${appealReason}Detail` as keyof AppealSessionData])
    errors[`${appealReason}Detail`] = 'You must enter more details'

  if (Object.keys(errors).length) {
    throw new ValidationError(errors)
  }
}

export const getConfirmationSummary = (sessionData: AppealSessionData): Array<SummaryListItem> => {
  const { areaManagerName, areaManagerEmail, notes } = sessionData
  const { approvalDate } = DateFormats.dateAndTimeInputsToIsoString(
    sessionData as ObjectWithDateParts<'approvalDate'>,
    'approvalDate',
  )
  const reasonText = getAppealReasonText(sessionData)

  return [
    summaryListItem('Name of area manager', areaManagerName),
    summaryListItem('Email address', areaManagerEmail),
    summaryListItem('Date they approved', DateFormats.isoDateToUIDate(approvalDate)),
    summaryListItem('Reason for appeal', reasonText, 'textBlock'),
    summaryListItem('Any other information', notes, 'textBlock'),
  ]
}
