console.clear()

const logs = []

/**
 * @param  {...string} args 
 */
export const log = (...args) => {
  logs.push(...args)
  console.clear()
  process.stdout.write(`${logs.join('\n')}\n> `)
}