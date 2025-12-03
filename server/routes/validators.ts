export type Validators = Record<string, RegExp>

const validators: Validators = {
  uuid: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
  isoDate: /^[0-9]{4}-[01][0-9]-[0-3][0-9]/,
  key: /^[0-9A-Za-z-]+$/,
  crn: /^[A-Z][0-9]{6}$/,
  taskType: /^assessment|placement-application$/,
}

export const fieldValidators: Validators = {
  id: validators.uuid,
  premisesId: validators.uuid,
  bedId: validators.uuid,
  placementRequestId: validators.uuid,
  date: validators.isoDate,
  placementId: validators.uuid,
  temporality: validators.key,
  changeRequestId: validators.uuid,
  category: validators.key,
  documentId: validators.uuid,
  crn: validators.crn,
  restrictionId: validators.uuid,
  appealId: validators.uuid,
  tab: validators.key,
  taskType: validators.taskType,
  section: validators.key,
}
