import {promises as fs} from 'fs'

// The precision is the difference between the end of the commute and the start of the visit to consider they are linked
const TIME_PRECISION = 1200000 // ms -> 20mn
const SPACE_PRECISION = 10000 // ~cm -> 100m, the building is big

async function main() {
  const [nodeProcess, jsFile, jsonFile, workplaceName] = process.argv

  if (!jsonFile || !workplaceName) {
    console.error([
      'Missing arguments. Usage is',
      '$ node index.mjs <path to json file> <workplace name>'
    ].join('\n'))
    process.exit(1)
  }

  const file = await fs.readFile(jsonFile)
  const locationHistory = JSON.parse(file)

  const workplaceVisits = locationHistory.timelineObjects.flatMap(object =>
    'placeVisit' in object && object.placeVisit.location.name === workplaceName
    ? object.placeVisit : []
  )

  const bikeCommutes = locationHistory.timelineObjects.flatMap(object =>
    'activitySegment' in object && (
      object.activitySegment.activityType === 'CYCLING' ||
      object.activitySegment.activityType === 'IN_PASSENGER_VEHICLE' // I don't have a car, but sometime location will mistake my bike commute for a car commute.
    )
    ? object.activitySegment : []
  )

  const bikeCommuteToWorkplace = workplaceVisits.reduce((visits, visit) =>
    bikeCommutes.reduce((visits, commute) => {
      const visitDate = new Date(visit.duration.startTimestamp)
      const commuteDate = new Date(commute.duration.endTimestamp)


      // If a commute ended on the same date and close enough to a visit to the office, it's considered a commute to work
      if (visitDate.getDate() === commuteDate.getDate() &&
        Math.abs(visitDate - commuteDate) < TIME_PRECISION &&
        Math.abs(commute.endLocation.latitudeE7 - visit.location.latitudeE7) <= SPACE_PRECISION &&
        Math.abs(commute.endLocation.latitudeE7 - visit.location.latitudeE7) <= SPACE_PRECISION
      ) {
        return [...visits, visit]
      } else {
        return visits
      }
    }, visits)
  , [])

  const daysBikeCommuteToWorkplace = new Set(bikeCommuteToWorkplace.map(visit =>
    new Date(visit.duration.startTimestamp).getDate())
  )
  console.log(Array.from(daysBikeCommuteToWorkplace))
  console.log(daysBikeCommuteToWorkplace.size)
}

main()