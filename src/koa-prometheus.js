import defaultConfig from './koa-prometheus.defaults.json'
import garbageStats from 'prometheus-gc-stats'
import { register } from 'prom-client'

import { removeBlanks } from './utils/s'

import buildMeters from './utils/build-meters'
import buildMarker from './utils/build-marker'
import printMeters from './utils/metrics-meter'

garbageStats(register).call({})

const middleware = (meters) => (ctx, next) => (ctx.state = { ...(ctx.state || {}), meters }) && next()

export default (userConfig = [], { loadDefaults = true } = {}) => {
  register.clear()

  const config = loadDefaults
    ? defaultConfig.concat(userConfig)
    : userConfig

  const meters = buildMeters(config)
  const automark = buildMarker(config)
  const print = buildPrinter(config, meters)

  return { ...meters, automark, print, middleware: middleware(meters) }
}

const buildPrinter = (config, meters) => () => removeBlanks([register.metrics(), ...printMeters(config, meters)].join('\n'))
