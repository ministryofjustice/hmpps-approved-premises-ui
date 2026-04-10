import { ApprovedPremisesApplication, Cas1SpaceBooking, CaseDetail } from '@approved-premises/api'
import {
  HtmlItem,
  RequestWithSession,
  SummaryListItem,
  SummaryListWithCard,
  TabItem,
  Table,
  TextItem,
} from '@approved-premises/ui'
import nunjucks from 'nunjucks'
import type { Request } from 'express'
import { DateFormats } from '../dateUtils'
import { canonicalDates, placementStatusTag } from '../placements'
import { ApiOutcome, linkTo, objectClean } from '../utils'
import config from '../../config'
import { hasPermission } from '../users'
import managePaths from '../../paths/manage'
import { getPageBackLink } from '../backlinks'
import { displayName, isNotRestrictedPerson, PersonAny } from '../personUtils'
import { RenderAs, summaryListItem } from '../formUtils'

export type ResidentProfileTab = 'personal' | 'health' | 'placement' | 'risk' | 'sentence' | 'drugAndAlcohol'
export type ResidentProfileSubTab =
  | 'personalDetails'
  | 'healthDetails'
  | 'mentalHealth'
  | 'placementDetails'
  | 'allApPlacements'
  | 'application'
  | 'riskDetails'
  | 'offence'
  | 'licence'
  | 'orders'
  | 'parole'
  | 'prison'
  | 'contacts'

export type CsraClassification = 'STANDARD' | 'HI'

export const csraClassificationMapping: Record<CsraClassification, string> = { STANDARD: 'Standard', HI: 'High' }

export type ResidentHeader = {
  name: string
  photoUrl?: string
  statusBadge?: string
  badges: Array<string>
  attributes: Array<Array<{ title: string; description: string }>>
}

type TextOrHtml = TextItem | HtmlItem

type AccordionSection = {
  heading: TextOrHtml
  content: TextOrHtml
}

export type Accordion = {
  id: string
  headingLevel?: number
  classes?: string
  attributes?: Record<string, string>
  rememberExpanded?: boolean
  hideAllSectionsText?: string
  showAllSectionsText?: string
  items: Array<AccordionSection>
}

export type TabData = {
  cardList?: Array<SummaryListWithCard>
  subHeading?: string
  accordion?: Accordion
}

export const tabLabels: Record<
  ResidentProfileTab,
  { label: string; disableRestricted?: boolean; disableOffline?: boolean }
> = {
  personal: { label: 'Personal details' },
  health: { label: 'Health and wellbeing' },
  placement: { label: 'Placement' },
  risk: { label: 'Risk' },
  sentence: { label: 'Sentence' },
  drugAndAlcohol: { label: 'Drug and alcohol' },
}

export const residentTabItems = (placement: Cas1SpaceBooking, activeTab: ResidentProfileTab): Array<TabItem> => {
  const getSelfLink = (tab: ResidentProfileTab): string => {
    const pathRoot = managePaths.resident
    const pathParams = { placementId: placement.id, crn: placement.person.crn }
    return {
      personal: pathRoot.tabPersonal.personalDetails(pathParams),
      health: pathRoot.tabHealth.healthDetails(pathParams),
      drugAndAlcohol: pathRoot.tabDrugAndAlcohol.drugAndAlcohol(pathParams),
      placement: pathRoot.tabPlacement.placementDetails(pathParams),
      risk: pathRoot.tabRisk.riskDetails(pathParams),
      sentence: pathRoot.tabSentence.offence(pathParams),
    }[tab]
  }
  return Object.entries(tabLabels).map(([key, { label }]) => ({
    text: label,
    active: activeTab === key,
    href: getSelfLink(key as ResidentProfileTab),
  }))
}

export function getResidentHeader(placement: Cas1SpaceBooking, caseDetail: CaseDetail): ResidentHeader {
  const { arrivalDate, departureDate } = canonicalDates(placement)
  const roshCodes = ['RVHR', 'RHRH', 'RMRH', 'RLRH']
  const mappaCode = 'MAPP'
  const excludedCodes = [...roshCodes, mappaCode]
  const renderCat = (catOrLevel: number): string => `${catOrLevel || '(TO BE DETERMINED)'}`

  const { registrations, mappaDetail } = caseDetail || {}
  const roshValue = registrations?.find(({ code }) => roshCodes.includes(code))?.description

  const badges: Array<string> = [
    getBadge(roshValue || 'No RoSH'),
    mappaDetail && getBadge(`MAPPA CAT ${renderCat(mappaDetail?.category)} LEVEL ${renderCat(mappaDetail?.level)}`),
    ...(registrations || []).map(({ code, description }) => !excludedCodes.includes(code) && getBadge(description)),
  ].filter(Boolean)

  const attribute = (title: string, description: string): { title: string; description: string } => ({
    title,
    description,
  })

  return {
    name: displayName(placement.person),
    photoUrl: undefined,
    statusBadge: placementStatusTag(placement),
    badges,
    attributes: [
      [
        attribute('CRN', placement.person.crn),
        attribute('AP', placement.premises.name),
        attribute('Arrival', DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' })),
        attribute('Departure', DateFormats.isoDateToUIDate(departureDate, { format: 'short' })),
        attribute('Length of stay', DateFormats.durationBetweenDates(arrivalDate, departureDate).ui),
      ],
    ],
  }
}

function getBadge(text: string): string {
  return `<span class="moj-badge moj-badge--black">${text}</span>`
}

export const card = ({
  title,
  rows,
  table,
  html,
  topHtml,
}: {
  title?: string
  rows?: Array<SummaryListItem>
  table?: Table
  html?: string
  topHtml?: string
}) =>
  objectClean<SummaryListWithCard>({
    card: title && {
      title: { text: title },
    },
    table,
    rows,
    html,
    topHtml,
  })

export const subHeadingH2 = (text: string): string => {
  return `<h2 class="govuk-heading-m">${text}</h2>`
}

export const subHeadingH3 = (text: string): string => {
  return `<h3 class="govuk-heading-s">${text}</h3>`
}

export const detailsBody = (summaryText: string, text: string) => {
  return nunjucks.render(`partials/detailsBlock.njk`, { summaryText, text })
}

export const insetText = (html: string): string => {
  return nunjucks.render(`partials/insetText.njk`, { html })
}

export const renderCardList = (cardListData: Array<SummaryListWithCard>) => {
  return nunjucks.render(`manage/resident/partials/cardList.njk`, { cardList: cardListData })
}

export const renderPersonDetails = (application: ApprovedPremisesApplication): string => {
  return nunjucks.render(`manage/resident/partials/personDetails.njk`, { application })
}

type AlertVariant = 'information' | 'success' | 'warning' | 'error'

export const alertBanner = (parameters: { variant: AlertVariant; title: string; html?: string }) => {
  return nunjucks.render(`manage/resident/partials/alert.njk`, parameters)
}

type NdeliusComponent =
  | 'CaseSummary'
  | 'PersonalContacts'
  | 'PersonalCircumstances'
  | 'AddressandAccommodation'
  | 'EqualityMonitoring'
  | 'RegisterSummary'
  | 'EventsList'

export const ndeliusDeeplink = (args: {
  component: NdeliusComponent
  crn: string
  text: string
  attributes?: Record<string, string>
  hiddenText?: string
  hiddenPrefix?: string
  openInNewTab?: boolean
}): string => {
  const basePath = config.paths.ndeliusDeeplink
  return basePath
    ? linkTo(basePath, { openInNewTab: true, ...args, query: { component: args.component as string, CRN: args.crn } })
    : ''
}

export const returnPath = (req: Request, placement: Cas1SpaceBooking) => {
  const defaultPath = hasPermission((req as RequestWithSession).session.user, ['cas1_ap_resident_profile'])
    ? managePaths.resident.show({ crn: placement.person.crn, placementId: placement.id })
    : managePaths.premises.placements.show({ premisesId: placement.premises.id, placementId: placement.id })

  return getPageBackLink(
    `${managePaths.premises.placements.show({ premisesId: placement.premises.id, placementId: placement.id })}:action`,
    req as RequestWithSession,
    [managePaths.premises.placements.show.pattern, `${managePaths.resident.show.pattern}{/*tab}`],
    defaultPath,
  )
}

export const summaryItemNd = (label: string, value: string, renderAs = undefined as RenderAs) => {
  return value ? summaryListItem(label, value, renderAs) : summaryListItem(label, 'Not entered in NDelius', renderAs)
}

type Service = 'nDelius' | 'dps' | 'oasys' | 'cvl'

const serviceNames: Record<Service, string> = {
  nDelius: 'NDelius',
  dps: 'Digital Prison Service (DPS)',
  oasys: 'OASys',
  cvl: 'Create and vary a licence',
}

export const cellMetaData = (service: Service, lastUpdated?: string) => {
  const lastUpdatedStr = lastUpdated
    ? `<p class="govuk-body-m govuk-hint">Last updated: ${DateFormats.isoDateToUIDate(lastUpdated)}</p>`
    : ''
  return `<p class="govuk-body-m govuk-hint govuk-!-margin-bottom-2">Imported from ${serviceNames[service]}</p>${lastUpdatedStr}`
}

/**
 * Alters the outcome of a request where there are no data, but the API request was successful.
 * If the outcome is 'success', it will be returned as 'notFound' if the content is falsy
 */
export const combineResultAndContent = (result: ApiOutcome, content: unknown): ApiOutcome => {
  if (content) return result
  return result === 'success' ? 'notFound' : result
}

export const loadingErrorMessage = (result: ApiOutcome, item: string, source: Service): string => {
  switch (result) {
    case 'success':
      return undefined
    case 'notFound':
      return `No ${item} information found in ${serviceNames[source]}`
    default:
      return `We cannot load ${item} information right now because ${serviceNames[source]} is not available.<br>Try again later`
  }
}

export const getPlacementLink = ({
  request,
  premisesId,
  placementId,
  person,
}: {
  request: RequestWithSession
  premisesId: string
  placementId: string
  person: PersonAny
}) => {
  const residentPermission = request?.session?.user && hasPermission(request.session.user, ['cas1_ap_resident_profile'])
  return residentPermission && isNotRestrictedPerson(person)
    ? managePaths.resident.show({ crn: person.crn, placementId })
    : managePaths.premises.placements.show({
        premisesId,
        placementId,
      })
}
