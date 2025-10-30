export const validators = {
  uuid: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
  isoDate: /^[0-9]{4}-[01][0-9]-[0-3][0-9]/,
}

export const idValidator = { parameterValidators: { id: validators.uuid } }
export const premisesIdValidator = { parameterValidators: { premisesId: validators.uuid } }
