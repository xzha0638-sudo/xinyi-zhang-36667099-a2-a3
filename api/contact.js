module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST for the contact workflow.'
    })
  }

  const body =
    typeof req.body === 'string'
      ? JSON.parse(req.body || '{}')
      : req.body || {}

  const fullName = String(body.fullName || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const subject = String(body.subject || '').trim()
  const message = String(body.message || '').trim()
  const preferredReply = String(body.preferredReply || 'Email').trim()

  if (fullName.length < 3) {
    return res.status(400).json({ success: false, error: 'Full name must be at least 3 characters.' })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'A valid email address is required.' })
  }

  if (subject.length < 5) {
    return res.status(400).json({ success: false, error: 'Subject must be at least 5 characters.' })
  }

  if (message.length < 15) {
    return res.status(400).json({ success: false, error: 'Message must be at least 15 characters.' })
  }

  return res.status(200).json({
    success: true,
    supportEmail: 'bridgewell.support@outlook.com',
    preferredReply,
    referenceId: `BW-${Date.now()}`,
    queuedAt: new Date().toISOString()
  })
}
