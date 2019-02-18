import commandLineArgs from 'command-line-args'
import { terminal } from 'terminal-kit'

export const getOptions = async (): Promise<{
  token: string
}> => {
  let {
    token
  } = commandLineArgs([
    {
      defaultValue: process.env['BOT_TOKEN'],
      defaultOption: true,
      name: 'token',
      alias: 'v',
      type: String
    }
  ])

  if (!token) {
    terminal('Enter bot token:')
    const { promise } = terminal.inputField()
    token = await promise

    if (!token) {
      terminal.error('Token not provided, exit')

      terminal.processExit(3)
    }
  }

  return {
    token
  }
}
