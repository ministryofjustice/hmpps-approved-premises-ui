import type {
  ApArea,
  ApprovedPremisesApplication,
  ApprovedPremisesApplicationStatus,
  ApprovedPremisesAssessment,
  ApprovedPremisesAssessmentSummary as AssessmentSummary,
  ApprovedPremisesUser as User,
  ApprovedPremisesUserPermission,
  ApprovedPremisesUserRole,
  ApprovedPremisesUserRole as UserRole,
  ApType,
  AssessmentTask,
  Cas1ApplicationSummary,
  Cas1CruManagementArea,
  Cas1NewClarificationNote,
  Cas1OASysGroup,
  Cas1OASysGroupName,
  Cas1OASysMetadata,
  Cas1PremisesBasicSummary,
  Cas1SpaceBooking,
  Document,
  FlagsEnvelope,
  Mappa,
  OASysQuestion,
  PersonAcctAlert,
  PlacementApplication,
  PlacementApplicationTask,
  PlacementRequestDetail,
  PlacementRequestStatus,
  ReleaseTypeOption,
  RiskTier,
  RiskTierLevel,
  RoshRisks,
  UserQualification,
} from '@approved-premises/api'
import { ApTypeCriteria } from '../../utils/placementCriteriaUtils'
import { roomCharacteristicMap } from '../../utils/characteristicsUtils'
import { spaceSearchCriteriaApLevelLabels } from '../../utils/match/spaceSearchLabels'

interface TasklistPage {
  body: Record<string, unknown>
}

type PersonService = object

// A utility type that allows us to define an object with a date attribute split into
// date, month, year (and optionally, time) attributes. Designed for use with the GOV.UK
// date input
export type ObjectWithDateParts<K extends string | number> = { [P in `${K}-${'year' | 'month' | 'day'}`]?: string } & {
  [P in `${K}-time`]?: string
} & {
  [P in K]?: string
}

export type BookingStatus = 'arrived' | 'awaiting-arrival' | 'not-arrived' | 'departed' | 'cancelled'

export type TaskNames =
  | 'basic-information'
  | 'type-of-ap'
  | 'risk-management-features'
  | 'prison-information'
  | 'location-factors'
  | 'access-and-healthcare'
  | 'further-considerations'
  | 'move-on'
  | 'check-your-answers'
  | 'request-a-placement'
  | 'make-a-decision'

export type YesOrNoWithDetail<T extends string> = {
  [K in T]: YesOrNo
} & {
  [K in `${T}Detail`]: string
}

export type YesNoOrIDKWithDetail<T extends string> = {
  [K in T]: YesNoOrIDK
} & {
  [K in `${T}Detail`]: string
}

export type UiTask = {
  id: TaskNames
  title: string
  pages: Record<string, unknown>
}

export type TaskStatus = 'not_started' | 'in_progress' | 'complete' | 'cannot_start'

export type TaskWithStatus = UiTask & { status: TaskStatus }

export type FormSection = {
  title: string
  name: string
  tasks: Array<UiTask>
}

export type FormSections = Array<FormSection>

export type FormPages = { [key in TaskNames]: Record<string, unknown> }

export type PageResponse = Record<string, string | Array<Record<string, unknown>>>

export interface HtmlAttributes {
  [key: string]: string | number
}

export interface TextItem {
  text: string
}

export interface HtmlItem {
  html: string
}

export type TableCell = (TextItem | HtmlItem) & {
  attributes?: HtmlAttributes
  classes?: string
  format?: 'numeric'
  colspan?: number
  rowspan?: number
}

export type TableRow = Array<TableCell>

export type RadioItemButton = {
  text: string
  value: string
  checked?: boolean
  conditional?: HtmlItem
  hint?: TextItem | HtmlItem
}

export type RadioItem = RadioItemButton | Divider

export type CheckBoxItem =
  | {
      text: string
      value: string
      checked?: boolean
      hint?: TextItem | HtmlItem
      behaviour?: 'exclusive'
    }
  | Divider

export type Divider = { divider: string }

export interface SelectOption {
  text: string
  value: string | ReadonlyArray<string>
  selected?: boolean
}

export interface SelectGroup {
  label: string
  items: Array<SelectOption>
}

export interface SummaryList {
  classes?: string
  attributes?: HtmlAttributes
  rows: Array<SummaryListItem>
}

export type SummaryListWithCard = SummaryList & {
  card: {
    title: { text: string; headingLevel?: string }
    actions?: SummaryListActions
    attributes?: HtmlAttributes
  }
}

export interface SummaryListActionItem {
  href: string
  text: string
  visuallyHiddenText?: string
}

export interface SummaryListActions {
  items: Array<SummaryListActionItem>
}

export interface SummaryListItem {
  classes?: string
  key?: (TextItem | HtmlItem) & { classes?: string }
  value: (TextItem | HtmlItem) & { classes?: string }
  actions?: SummaryListActions
}

export interface IdentityBar {
  title: HtmlItem
  classes?: string
  menus?: Array<IdentityBarMenu>
}

export interface IdentityBarMenu {
  items: Array<IdentityBarMenuItem>
}

export interface IdentityBarMenuItem {
  classes?: string
  attributes?: HtmlAttributes
  href: string
  text: string
}

export type UiTimelineEvent = {
  label: { text: string }
  datetime: { timestamp: string; type?: 'datetime'; date: string }
  content: string
  associatedUrls?: Array<TimelineEventAssociatedUrl>
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Very High'

type GetRiskLevelLetter<T> = T extends `${infer RiskLetter}${string}` ? RiskLetter : never
type GetRiskLevelNumber<T> = T extends `${string}${infer RiskNumber}` ? RiskNumber : never

export type TierNumber = GetRiskLevelNumber<RiskTierLevel>
export type TierLetter = GetRiskLevelLetter<RiskTierLevel>

export type ApplicationType = 'Standard' | 'PIPE' | 'ESAP' | 'RFAP' | 'MHAP (Elliott House)' | 'MHAP (St Josephs)'

export interface ErrorMessage {
  text: string
  attributes: {
    [K: string]: boolean
  }
}

export interface ErrorMessages {
  [K: string]: ErrorMessage
}

export interface ErrorSummary {
  text?: string
  html?: string
  href?: string
}

export interface ErrorsAndUserInput {
  errorTitle?: string
  errors: ErrorMessages
  errorSummary: Array<ErrorSummary>
  userInput: Record<string, unknown>
}

export interface BespokeError {
  errorTitle: string
  errorSummary: Array<ErrorSummary>
}

export type TaskListErrors<K extends TasklistPage> = Partial<Record<keyof K['body'], unknown>>

export type YesOrNo = 'yes' | 'no'
export type YesNoOrIDK = YesOrNo | 'iDontKnow'

export interface ReferenceData {
  id: string
  name: string
  isActive: boolean
  serviceScope: string
}

export type Cas1ReferenceData = {
  id: string
  name: string
  isActive: boolean
}

export interface MappaUi extends Mappa {
  status?: RiskEnvelopeStatus
}

export interface PersonRisksUI {
  roshRisks: RoshRisks
  tier: RiskTier
  flags: FlagsEnvelope['value']
  mappa: MappaUi
}

type ManWoman = 'man' | 'woman'

export interface PremisesFilters {
  gender?: ManWoman
  cruManagementAreaId?: string
}

export type DataServices = Partial<{
  personService: {
    getPrisonCaseNotes: (token: string, crn: string) => Promise<Array<PrisonCaseNote>>
    getAdjudications: (token: string, crn: string) => Promise<Array<Adjudication>>
    getAcctAlerts: (token: string, crn: string) => Promise<Array<PersonAcctAlert>>
    getOasysMetadata: (token: string, crn: string) => Promise<Cas1OASysMetadata>
    getOasysAnswers: (
      token: string,
      crn: string,
      group: Cas1OASysGroupName,
      selectedSections?: Array<number>,
    ) => Promise<Cas1OASysGroup>
  }
  applicationService: {
    getDocuments: (token: string, application: ApprovedPremisesApplication) => Promise<Array<Document>>
    findApplication: (token: string, id: string) => Promise<ApprovedPremisesApplication>
  }
  userService: {
    getUserById: (token: string, id: string) => Promise<User>
  }
  premisesService: {
    getCas1All: (token: string, filters: PremisesFilters) => Promise<Array<Cas1PremisesBasicSummary>>
  }
  assessmentService: {
    createClarificationNote: (
      token: string,
      assessmentId: string,
      clarificationNote: Cas1NewClarificationNote,
    ) => Promise<void>
  }
  apAreaService: {
    getApAreas: (token: string) => Promise<Array<ApArea>>
  }
}>

export type GroupedAssessments = {
  completed: Array<AssessmentSummary>
  requestedFurtherInformation: Array<AssessmentSummary>
  awaiting: Array<AssessmentSummary>
}

export interface GroupedApplications {
  inProgress: Array<Cas1ApplicationSummary>
  requestedFurtherInformation: Array<Cas1ApplicationSummary>
  submitted: Array<Cas1ApplicationSummary>
  inactive: Array<Cas1ApplicationSummary>
}

export type CategorisedTask = AssessmentTask | BookingAppealTask | PlacementApplicationTask

export type OasysImportArrays = Array<OASysQuestion> | Array<OASysSupportingInformationQuestion>

export type OasysSummariesSection = { [index: string]: OasysImportArrays }

export type JourneyType = 'applications' | 'assessments' | 'placement-applications'

export type ServiceSection = {
  id: string
  title: string
  description: string
  shortTitle: string
  href: string
}

export type UserDetails = {
  id: string
  name: string
  displayName: string
  roles: Array<UserRole>
  permissions: Array<ApprovedPremisesUserPermission>
  active: boolean
  apArea: ApArea
  cruManagementArea: Cas1CruManagementArea
  version: string
}

export type PartnerAgencyDetails = {
  partnerAgencyName: string
  namedContact: string
  phoneNumber: string
  roleInPlan: string
}

export type ContingencyPlanQuestionId =
  | 'noReturn'
  | 'placementWithdrawn'
  | 'victimConsiderations'
  | 'unsuitableAddresses'
  | 'suitableAddresses'
  | 'breachInformation'
  | 'otherConsiderations'

export type ContingencyPlanQuestionsBody = Record<ContingencyPlanQuestionId, string>

type ContingencyPlanQuestion = {
  question: string
  hint?: string
  error: string
}

export type ContingencyPlanQuestionsRecord = Record<ContingencyPlanQuestionId, ContingencyPlanQuestion>

export type ReleaseTypeOptions = Record<ReleaseTypeOption, string>

export type FormArtifact = ApprovedPremisesApplication | ApprovedPremisesAssessment | PlacementApplication

export interface OasysPage extends TasklistPage {
  oasysCompleted: string
  risks: PersonRisksUI
  oasysSuccess: boolean
}

export type PaginatedRequestParams = {
  page: number
  perPage: number
}

export type SortedRequestParams = {
  sortBy: string
  sortDirection: string
}

export type PaginatedResponse<T> = {
  data: Array<T>
  pageNumber: string
  totalPages: string
  totalResults: string
  pageSize: string
}

export type RedirectAuditEventSpec = { path: string; auditEvent: string }

export type MiddlewareSpec = {
  auditEvent?: string
  auditBodyParams?: Array<string>
  redirectAuditEventSpecs?: Array<RedirectAuditEventSpec>
  additionalMetadata?: Record<string, string>
  allowedRoles?: Array<ApprovedPremisesUserRole>
  allowedPermissions?: Array<ApprovedPremisesUserPermission>
}

export type PlacementRequestDashboardSearchOptions = {
  crnOrName?: string
  tier?: RiskTierLevel
  arrivalDateStart?: string
  arrivalDateEnd?: string
  status?: PlacementRequestStatus
}

export type ApplicationDashboardSearchOptions = {
  crnOrName?: string
  status?: ApprovedPremisesApplicationStatus | ReadonlyArray<ApprovedPremisesApplicationStatus>
  cruManagementAreaId?: Cas1CruManagementArea['id'] | 'all'
  releaseType?: ReleaseTypeOption
}

export type AssessmentCurrentTab = 'awaiting_assessment' | 'awaiting_response' | 'completed'

export type KeyDetailsArgs = {
  header: {
    key: string
    value: string
    showKey: boolean
  }
  items: Array<{
    key?: HtmlItem | TextItem
    value: HtmlItem | TextItem
  }>
}

export type TaskSearchQualification = Exclude<UserQualification, 'lao'>

export type BackwardsCompatibleApplyApType = ApType | 'standard'

export type EntityType = 'booking' | 'lost-bed'

export type SpaceSearchApCriteria = keyof typeof spaceSearchCriteriaApLevelLabels

export type SpaceSearchRoomCriteria = keyof typeof roomCharacteristicMap

type SpaceSearchCommonFields = {
  postcode?: string
  apCriteria?: Array<SpaceSearchApCriteria>
  roomCriteria?: Array<SpaceSearchRoomCriteria>
  startDate?: string
  arrivalDate?: string
  durationDays?: number
}

export type NationalSpaceSearchFormData = SpaceSearchCommonFields & {
  apArea?: string
  apType?: ApType
}

export type SpaceSearchFormData = SpaceSearchCommonFields & {
  applicationId?: string
  departureDate?: string
  apType?: ApTypeCriteria
}

export type DepartureFormData = ObjectWithDateParts<'departureDate'> & {
  departureTime?: string
  reasonId?: string
  breachOrRecallReasonId?: string
  moveOnCategoryId?: string
  notes?: string
  apName?: string
}

export type TransferFormData = Partial<
  ObjectWithDateParts<'transferDate'> & ObjectWithDateParts<'placementEndDate'>
> & {
  destinationPremisesId?: string
  destinationPremisesName?: string
  isFlexible?: string
  transferReason?: string
  notes?: string
}

export type MultiPageFormData = {
  departures?: Record<Cas1SpaceBooking['id'], DepartureFormData>
  spaceSearch?: Record<PlacementRequestDetail['id'], SpaceSearchFormData>
  transfers?: Record<Cas1SpaceBooking['id'], TransferFormData>
  appeals?: Record<Cas1SpaceBooking[id], AppealFormData>
  nationalSpaceSearch?: Record<string, NationalSpaceSearchFormData>
}

export type ChangeRequestReason =
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
  | 'noSuitableApAvailable'
  | 'other'

export type AppealJson<K = ChangeRequestReason> = {
  areaManagerName: string
  areaManagerEmail: string
  appealReason: K
  notes: string
  approvalDate: string
} & {
  [P in `${K}Detail`]?: string
}

export type AppealFormData = ObjectWithDateParts<'approvalDate'> & AppealJson

export type DateRange = {
  from: string
  to?: string
  duration: number
}
