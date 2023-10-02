export const limitURLWords = (url, limit = 100) => {
  return url.substring(0, Math.min(limit, url.length))
}