export const printUserName = ({ first_name, last_name, username }: {first_name: string; last_name?: string; username?: string;}) => {
  if (username) {
    return `@${username}`
  } else {
    return [first_name, last_name].filter(Boolean).join(' ')
  }
}
