const logger = require('./utils/winston')
const isJSON = require('./utils/isJson')

const Kafka = require('node-rdkafka')

const producer = new Kafka.Producer({
  'metadata.broker.list': 'localhost:9092',
  'dr_cb': true, // Enable delivery report callback
})

let connection = false

const check_connect = () => {
  if (!connection) {
    logger.info('[KAFKA PRODUCER] Connecting to Kafka broker...')
    producer.connect()
  } else {
    logger.info('[KAFKA PRODUCER] Kafa broker has been connected')
  }
}

check_connect()

producer.on('ready', (payload) => {
  connection = true
  logger.info('[KAFKA PRODUCER] Producer connected and ready.')

  const message = isJSON(payload) ? payload : JSON.stringify(payload)
  const key = 'example-key'
  const topic = 'test-topic'

  // Log depending on type
  if (isJSON(message)) {
    logger.info(`[KAFKA PRODUCER] Sending JSON: ${JSON.stringify(message)}`)
  } else {
    logger.info(`[KAFKA PRODUCER] Sending Text: ${message}`)
  }

  try {
    producer.produce(
      topic,
      null, // Partition: null = let Kafka decide
      Buffer.from(message),
      key,
      Date.now(),
    )
  } catch (err) {
    connection = false
    logger.error(`[KAFKA PRODUCER] Error producing message: ${err.message || err}`)
  }
})

// Delivery report (confirmation from Kafka broker)
producer.on('delivery-report', (err, report) => {
  if (err) {
    logger.error(`[KAFKA PRODUCER] Delivery failed: ${err.message || JSON.stringify(err)}`)
  } else {
    logger.info(`[KAFKA PRODUCER] Delivery successful: ${JSON.stringify(report)}`)
  }
})

// Handle producer-level errors
producer.on('event.error', (err) => {
  connection = false
  logger.error(`[KAFKA PRODUCER] Producer error: ${err.message || err}`)
})

// Required: to get delivery reports
producer.setPollInterval(100)

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('[KAFKA PRODUCER] Shutting down...')
  producer.disconnect()
})
