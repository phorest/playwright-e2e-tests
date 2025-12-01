const breaks = {
  deleteBreak: `mutation DeleteBreak($breakId: ID!) {
    deleteBreak(breakId: $breakId)
  }`
}
module.exports = { breaks }
