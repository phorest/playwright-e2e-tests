const fs = require('fs')
const json = require('../../fixtures/feature_flags.json')

function addFeatureFlag (featureFlag) {
  return new Promise((resolve, reject) => {
    json.push(featureFlag)
    fs.writeFile('./fixtures/feature_flags.json', JSON.stringify(json), (err) => {
      if (err) reject(err)
      resolve('File saved.')
    })
  })
}

if (process.argv[2] !== undefined) {
  process.argv[2].split(',').map((featureFlag) => (

    addFeatureFlag(featureFlag)
      .then(result => {
        console.log(result)
      })

  ))
} else {
  console.log('No feature flags to add!')
}
