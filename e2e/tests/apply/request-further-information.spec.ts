import { test } from '../../test'
import { createApplication } from '../../steps/apply'
import { requestAndAddAdditionalInformation } from '../../steps/assess'
import { signIn } from '../../steps/signIn'

test('Request further information on an Application, adds it and proceeds with the assessment', async ({
  page,

  person,
  oasysSections,
  assessor,
}) => {
  await signIn(page, assessor)
  const { id } = await createApplication({ page, person, oasysSections, applicationType: 'standard' }, false)
  await requestAndAddAdditionalInformation({ page, assessor, person }, id)
})
