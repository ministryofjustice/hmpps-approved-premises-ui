import { NamedId } from '@approved-premises/api'
import { AppealFormData, ObjectWithDateParts, RadioItem, SummaryListItem } from '@approved-premises/ui'
import nunjucks from 'nunjucks'
import { isAfter } from 'date-fns'
import { dateAndTimeInputsAreValidDates, DateFormats } from '../dateUtils'
import { ValidationError } from '../errors'
import { summaryListItem } from '../formUtils'
import { sentenceCase } from '../utils'

export type AppealReason =
  | 'staffConflictOfInterest'
  | 'exclusionZoneOrProximityToVictim'
  | 'offenceNotAccepted'
  | 'apCannotMeetSpecificNeeds'
  | 'residentMixOrNonAssociates'
  | 'extendingThePlacementNoCapacityAtCurrentAp'
  | 'placementPrioritisation'
  | 'movingPersonCloserToResettlementArea'
  | 'conflictWithStaff'
  | 'localCommunityIssue'
  | 'riskToResident'
  | 'publicProtection'
  | 'apClosure'
  | 'other'

export const appealReasonRadioDefinitions: Record<AppealReason, { text: string; conditionalQuestion?: string }> = {
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

  extendingThePlacementNoCapacityAtCurrentAp: { text: 'Extending the placement (no capacity at current AP)' },
  placementPrioritisation: { text: 'Placement prioritisation ' },
  movingPersonCloserToResettlementArea: { text: 'Moving person closer to resettlement area' },
  conflictWithStaff: { text: 'Conflict with staff ' },
  localCommunityIssue: { text: 'Local community issue ' },
  riskToResident: { text: 'Risk to resident ' },
  publicProtection: { text: 'Public protection ' },
  apClosure: { text: 'AP closure ' },
  other: { text: 'Out of service bed or refurbishment' }, // TODO:Check that this is the right text for the code
}

export const getConditionalHtml = (name: string, conditionalQuestion: string, context: Record<string, unknown>) => {
  const errors = context.errors as Record<string, string>
  const textboxContext = {
    name,
    value: context[name],
    conditionalQuestion,
    errorMessage: errors?.[name],
  }

  return nunjucks.render('partials/detailsTextarea.njk', textboxContext)
}

export const mapChangeRequestReasonsToRadios = (
  appealReasons: Array<NamedId>,
  fieldName: string,
  context: Record<string, unknown>,
): Array<RadioItem> => {
  const selectedValue = context[fieldName]
  return appealReasons
    .map(({ name }) => {
      if (!appealReasonRadioDefinitions[name as AppealReason])
        return { value: name, text: sentenceCase(name), checked: selectedValue === name }
      const { text, conditionalQuestion } = appealReasonRadioDefinitions[name as AppealReason]
      const conditionalHtml = conditionalQuestion
        ? { html: getConditionalHtml(`${name}Detail`, conditionalQuestion, context) }
        : undefined
      return { value: name, text, conditional: conditionalHtml, checked: selectedValue === name }
    })
    .filter(Boolean)
}

export const getAppealReasonId = (reasonName: string, reasonList: Array<NamedId>): string => {
  return reasonList.find(({ name }) => name === reasonName)?.id
}

export const getChangeRequestReasonText = (changeRequestReason: AppealReason) => {
  return appealReasonRadioDefinitions[changeRequestReason]
    ? appealReasonRadioDefinitions[changeRequestReason].text
    : sentenceCase(changeRequestReason)
}

export const getAppealReasonText = (body: AppealFormData): string => {
  const { appealReason } = body
  const detailKey = `${appealReason}Detail` as keyof AppealFormData
  const definition = appealReasonRadioDefinitions[appealReason as AppealReason]
  return definition ? `${definition.text}\n\n${body[detailKey]}` : ''
}

export const validateNewAppealResponse = (body: AppealFormData): void => {
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
  } else if (isAfter(approvalDate, new Date())) {
    errors.approvalDate = 'The approval date must be today or in the past'
  }
  if (!appealReason) {
    errors.appealReason = 'You must select a reason for the appeal'
  } else if (!body[`${appealReason}Detail` as keyof AppealFormData])
    errors[`${appealReason}Detail`] = 'You must enter more details'

  if (Object.keys(errors).length) {
    throw new ValidationError(errors)
  }
}

export const getConfirmationSummary = (sessionData: AppealFormData): Array<SummaryListItem> => {
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
