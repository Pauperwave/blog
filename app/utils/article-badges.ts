const MS_PER_DAY = 8.64e7

export const isRecentArticle = (date: string, days = 7): boolean => {
  return Math.abs(Date.now() - new Date(date).getTime()) < MS_PER_DAY * days
}

export const getRecentArticleBadge = (date: string) => {
  return isRecentArticle(date) ? { label: 'Nuovo', color: 'primary' as const } : undefined
}
