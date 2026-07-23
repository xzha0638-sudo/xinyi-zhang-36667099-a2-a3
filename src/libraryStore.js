import books from '@/assets/json/books.json'

const PROFILES_KEY = 'nomash-library-profiles'
const RATINGS_KEY = 'nomash-library-ratings'
const REQUESTS_KEY = 'nomash-library-requests'
const REQUEST_STATUSES = ['Pending', 'In review', 'Approved', 'Closed']

export const ACCESS_CODES = {
  Librarian: 'STACKS-2026',
  Manager: 'HARBOR-2026'
}

export const roles = ['Member', 'Librarian', 'Manager']

const emailKey = (email) => (email || '').trim().toLowerCase()

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const sanitizeText = (value) =>
  String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

export const getBooks = () => books.map((book) => ({ ...book }))

export const getProfiles = () => readJson(PROFILES_KEY, {})

export const getProfileByEmail = (email) => getProfiles()[emailKey(email)] || null

export const saveProfile = (profile) => {
  const normalizedEmail = emailKey(profile.email)
  const profiles = getProfiles()
  profiles[normalizedEmail] = {
    email: normalizedEmail,
    displayName: sanitizeText(profile.displayName || normalizedEmail.split('@')[0]),
    role: profile.role || 'Member',
    joinedAt: profile.joinedAt || new Date().toISOString(),
    favoriteBranch: sanitizeText(profile.favoriteBranch || 'Clayton'),
    accessCode: profile.accessCode || ''
  }
  writeJson(PROFILES_KEY, profiles)
  return profiles[normalizedEmail]
}

export const ensureProfileForUser = (user) => {
  if (!user?.email) {
    return null
  }

  const existing = getProfileByEmail(user.email)
  if (existing) {
    return existing
  }

  return saveProfile({
    email: user.email,
    displayName: user.displayName || user.email.split('@')[0],
    role: 'Member',
    favoriteBranch: 'Clayton'
  })
}

export const registerLibraryProfile = ({
  email,
  passwordRole,
  displayName,
  favoriteBranch,
  accessCode
}) => {
  const normalizedEmail = emailKey(email)
  const role = passwordRole || 'Member'

  if (!normalizedEmail) {
    throw new Error('Email is required.')
  }

  if (!roles.includes(role)) {
    throw new Error('Unsupported role selected.')
  }

  if (role !== 'Member' && ACCESS_CODES[role] !== accessCode) {
    throw new Error('The staff access code is not valid for that role.')
  }

  return saveProfile({
    email: normalizedEmail,
    displayName,
    role,
    favoriteBranch,
    accessCode: role === 'Member' ? '' : accessCode
  })
}

export const getRatings = () => readJson(RATINGS_KEY, {})

export const getBookRatingSummary = (bookId) => {
  const ratings = getRatings()[String(bookId)] || {}
  const entries = Object.values(ratings)
  const count = entries.length
  const average =
    count === 0 ? 0 : Number((entries.reduce((total, item) => total + item.rating, 0) / count).toFixed(1))

  return {
    count,
    average,
    myRating: (email) => ratings[emailKey(email)]?.rating || 0,
    latestReview:
      entries
        .filter((item) => item.note)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.note || ''
  }
}

export const getCatalog = () =>
  getBooks().map((book) => {
    const summary = getBookRatingSummary(book.id)

    return {
      ...book,
      ratingCount: summary.count,
      averageRating: summary.average,
      latestReview: summary.latestReview
    }
  })

export const rateBook = ({ bookId, email, rating, note }) => {
  const normalizedEmail = emailKey(email)
  if (!normalizedEmail) {
    throw new Error('Sign in before rating a book.')
  }

  const safeRating = Number(rating)
  if (!Number.isInteger(safeRating) || safeRating < 1 || safeRating > 5) {
    throw new Error('Rating must be between 1 and 5 stars.')
  }
  if (sanitizeText(note).length > 160) {
    throw new Error('Review notes must stay under 160 characters.')
  }

  const ratings = getRatings()
  const key = String(bookId)
  ratings[key] = ratings[key] || {}
  ratings[key][normalizedEmail] = {
    rating: safeRating,
    note: sanitizeText(note),
    createdAt: new Date().toISOString()
  }
  writeJson(RATINGS_KEY, ratings)
  return getBookRatingSummary(bookId)
}

export const getMyRating = ({ bookId, email }) => {
  const ratings = getRatings()[String(bookId)] || {}
  return ratings[emailKey(email)] || null
}

export const getRequestEntries = () =>
  readJson(REQUESTS_KEY, []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

export const submitLibraryRequest = ({ fullName, email, branch, requestType, reason, agreeToContact }) => {
  const safeEmail = emailKey(email)
  if (!fullName || fullName.trim().length < 3) {
    throw new Error('Name must be at least 3 characters long.')
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail)) {
    throw new Error('Please enter a valid email address.')
  }
  if (!reason || reason.trim().length < 15) {
    throw new Error('Please share a longer reason for your request.')
  }
  if (sanitizeText(reason).length > 280) {
    throw new Error('Request details must stay under 280 characters.')
  }
  if (!agreeToContact) {
    throw new Error('Please agree to be contacted about this request.')
  }

  const requests = readJson(REQUESTS_KEY, [])
  const request = {
    id: crypto.randomUUID(),
    fullName: sanitizeText(fullName),
    email: safeEmail,
    branch: sanitizeText(branch || 'Clayton'),
    requestType,
    reason: sanitizeText(reason),
    status: 'Pending',
    agreeToContact: true,
    createdAt: new Date().toISOString()
  }
  requests.unshift(request)
  writeJson(REQUESTS_KEY, requests)
  return request
}

export const updateRequestStatus = ({ id, status }) => {
  if (!REQUEST_STATUSES.includes(status)) {
    throw new Error('Unsupported request status.')
  }

  const requests = readJson(REQUESTS_KEY, [])
  const requestIndex = requests.findIndex((request) => request.id === id)

  if (requestIndex === -1) {
    throw new Error('Request could not be found.')
  }

  requests[requestIndex] = {
    ...requests[requestIndex],
    status,
    updatedAt: new Date().toISOString()
  }
  writeJson(REQUESTS_KEY, requests)
  return requests[requestIndex]
}

export const getLibraryStats = () => {
  const catalog = getCatalog()
  const requests = getRequestEntries()
  const ratings = getRatings()
  const totalRatings = Object.values(ratings).reduce((count, bookRatings) => count + Object.keys(bookRatings).length, 0)
  const averageRating =
    totalRatings === 0
      ? 0
      : Number(
          (
            Object.values(ratings).reduce(
              (total, bookRatings) =>
                total + Object.values(bookRatings).reduce((bookTotal, item) => bookTotal + item.rating, 0),
              0
            ) / totalRatings
          ).toFixed(1)
        )

  return {
    totalBooks: catalog.length,
    featuredBooks: catalog.filter((book) => book.featured).length,
    totalRequests: requests.length,
    pendingRequests: requests.filter((request) => request.status === 'Pending').length,
    reviewedRequests: requests.filter((request) => request.status !== 'Pending').length,
    totalRatings,
    averageRating
  }
}
