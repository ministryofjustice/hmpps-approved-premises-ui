import { path } from 'static-path'

const assessmentsPath = path('/assessments')

const paths = {
  assessments: {
    index: assessmentsPath,
    show: assessmentsPath.path(':id'),
  },
}

export default paths
