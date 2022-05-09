const getExpeditiousCache = require ('express-expeditious')

const defaultOption = {
    namespace: 'expresscache',
    defaultTtl: '1 minute',
    statusCodeExpires: {
        404: '5 minutes',
        500: 0 // 1 minute in milliseconds
    }
}

const cacheInit = getExpeditiousCache(defaultOption)

module.exports =  { cacheInit }