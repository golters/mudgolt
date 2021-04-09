console.clear()

const logs: string[] = []

export const log = (...args: string[]) => {
  logs.push(...args)
  console.clear()
  process.stdout.write(`${logs.join('\n')}\n> `)
}