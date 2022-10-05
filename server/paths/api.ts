import { path } from 'static-path'

const premisesPath = path('/premises')
const singlePremisesPath = premisesPath.path(':premisesId')

const lostBedsPath = singlePremisesPath.path('lost-beds')

const premisesPaths = {
  premises: {
    create: premisesPath,
    index: premisesPath,
    show: singlePremisesPath,
  },
  lostBeds: {
    create: lostBedsPath,
  },
}

const applicationsPath = path('/applications')
const applicationPath = applicationsPath.path(':id')

const applicationPaths = {
  applications: {
    show: applicationPath,
    create: applicationsPath,
    index: applicationsPath,
    update: applicationPath,
  },
}

export default {
  premises: {
    index: premisesPaths.premises.index,
    show: premisesPaths.premises.show,
    capacity: premisesPaths.premises.show.path('capacity'),
    lostBeds: {
      create: premisesPaths.lostBeds.create,
    },
    staffMembers: {
      index: premisesPaths.premises.show.path('staff'),
    },
  },
  applications: {
    show: applicationPaths.applications.show,
    index: applicationPaths.applications.index,
    update: applicationPaths.applications.update,
    new: applicationPaths.applications.create,
  },
}
