export function flatMap(twoDimensionArray) {
  return twoDimensionArray.reduce((result, next) => result.concat(next), [])
}

export function groupBy(array, key) {
  const result = {}

  array.forEach((element) => {
    /* eslint-disable prefer-destructuring */
    const keyValue = element[key]
    const valueInResult = result[keyValue]
    /* eslint-enable */

    if (valueInResult) {
      result[keyValue] = valueInResult.concat(element)
    } else {
      result[keyValue] = [element]
    }
  })

  return result
}
