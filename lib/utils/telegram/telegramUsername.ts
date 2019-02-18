export const telegramUsername = <U extends { first_name: string, last_name?: string, username?: string }>({ first_name, last_name, username }: U) => {
  if (first_name && last_name && username) {
    return `${first_name} @${username} ${last_name}`
  } else
    if (first_name && last_name) {
      return `${first_name} ${last_name}`
    } else
      if (first_name && username) {
        return `${first_name} @${username}`
      } else {
        return first_name
      }
}