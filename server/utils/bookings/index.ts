import type { EntityType, BespokeError, SelectOption } from '@approved-premises/ui'
import paths from '../../paths/manage'
import { SanitisedError } from '../../sanitisedError'
import { convertObjectsToRadioItems } from '../formUtils'

type ConflictingEntityType = EntityType

type ParsedConflictError = {
  conflictingEntityId: string
  conflictingEntityType: ConflictingEntityType
}

export const generateConflictBespokeError = (
  err: SanitisedError,
  premisesId: string,
  datesGrammaticalNumber: 'plural' | 'singular',
  bedId?: string,
): BespokeError => {
  const { detail } = err.data as { detail: string }
  const { conflictingEntityId, conflictingEntityType } = parseConflictError(detail)

  const title = (
    conflictingEntityType === 'lost-bed'
      ? 'Out of service bed record cannot be created for the $date$ entered'
      : 'This bedspace is not available for the $date$ entered'
  ).replace('$date$', datesGrammaticalNumber === 'plural' ? 'dates' : 'date')

  const link =
    conflictingEntityType === 'lost-bed' && bedId
      ? `<a href="${paths.outOfServiceBeds.show({
          premisesId,
          bedId,
          id: conflictingEntityId,
          tab: 'details',
        })}">existing out of service beds record</a>`
      : `<a href="${paths.premises.placements.show({
          premisesId,
          placementId: conflictingEntityId,
        })}">existing booking</a>`
  const message = datesGrammaticalNumber === 'plural' ? `They conflict with an ${link}` : `It conflicts with an ${link}`

  return { errorTitle: title, errorSummary: [{ html: message }] }
}

const parseConflictError = (detail: string): ParsedConflictError => {
  /**
   *  Return the entity type and id by parsing an error detail string
   *  @param detail - string is text containing the entity id at the end preceded by ': '
   *    e.g. "An out-of-service bed already exists for dates from 2024-10-01 to 2024-10-14 which overlaps with the desired dates: 220a71da-bf5c-424d-94ff-254ecac5b857"
   */
  const [message, conflictingEntityId] = detail.split(':').map((s: string) => s.trim())
  const conflictingEntityType = message.includes('out-of-service bed') ? 'lost-bed' : 'booking'
  return { conflictingEntityId, conflictingEntityType }
}

export const cancellationReasonsRadioItems = (
  cancellationReasons: Array<Record<string, string>>,
  otherHtml: string,
  context: Record<string, unknown>,
): Array<SelectOption> => {
  const items = convertObjectsToRadioItems(cancellationReasons, 'name', 'id', 'cancellation[reason]', context)

  return items.map(item => {
    if (item.text === 'Other') {
      item.conditional = {
        html: otherHtml,
      }
    }

    return item
  })
}
