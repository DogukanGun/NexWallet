import pino from 'pino'

const logger = pino({
  browser: {
    asObject: true,
    write: {
      info: (...args) => console.log(...args),
      error: (...args) => console.error(...args),
      debug: (...args) => console.debug(...args),
      warn: (...args) => console.warn(...args)
    }
  },
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'error'
})

export default logger; 