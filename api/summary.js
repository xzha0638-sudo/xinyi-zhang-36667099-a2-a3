const fs = require('fs')
const path = require('path')

const readJson = (relativePath) => {
  const filePath = path.join(process.cwd(), relativePath)
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET for the cloud summary endpoint.'
    })
  }

  const books = readJson('src/assets/json/books.json')
  const catalogsByHub = books.reduce((collection, book) => {
    collection[book.branch] = (collection[book.branch] || 0) + 1
    return collection
  }, {})

  return res.status(200).json({
    success: true,
    totalResources: books.length,
    featuredResources: books.filter((book) => book.featured).length,
    branchCount: Object.keys(catalogsByHub).length,
    source: 'Vercel cloud function'
  })
}
