import dotenv from 'dotenv'
import logger from './logger.js'

// NOTE: Always check if `NODE_ENV` before anything else
if (!process.env.NODE_ENV) {
  logger.error(
    'Please define Your `NODE_ENV` variable using `cross-env` in package.json file'
  )
  process.exit(1)
}

logger.info('NODE_ENV:', process.env.NODE_ENV)

let envPath: string | undefined

if (process.env.NODE_ENV === 'production') {
  envPath = '.env'
}

if (process.env.NODE_ENV === 'development') {
  envPath = '.env.development'
}

if (!envPath) {
  logger.error('Please use a valid value of NODE_ENV variable.')
  process.exit(1)
}
// import env values from file `envPath`
dotenv.config({ path: envPath })

logger.info('Using env file:', envPath);



// Validation for environment variables from `envPath` file
if (!process.env.PORT) {
  logger.error('Please define PORT in your .env file.')
  process.exit(1)
}

if (!process.env.MONGO_URI) {
  logger.error('Please define MONGO_URI in your .env file.')
  process.exit(1)
}

if (!process.env.STRIPE_KEY) {
  logger.error('Please define STRIPE_KEY in your .env file.')
  process.exit(1)
}


export const MONGO_URI = process.env.MONGO_URI
export const NODE_ENV = process.env.NODE_ENV
export const PORT = Number(process.env.PORT)
export const STRIPE_KEY = process.env.STRIPE_KEY
