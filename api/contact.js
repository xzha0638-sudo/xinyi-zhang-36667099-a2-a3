const supportEmail = process.env.RESEND_TO_EMAIL || 'bridgewell.support@outlook.com'
const resendApiKey = process.env.RESEND_API_KEY || ''
const resendFromEmail = process.env.RESEND_FROM_EMAIL || ''

const buildSummaryText = ({ fullName, email, subject, message, preferredReply }) =>
  [
    'BridgeWell Health Connect Support Summary',
    `Name: ${fullName}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    `Preferred reply: ${preferredReply}`,
    '',
    message
  ].join('\n')

const encodeTextAttachment = (text) => Buffer.from(text, 'utf8').toString('base64')

const sendViaResend = async ({ fullName, email, subject, message, preferredReply, attachments }) => {
  const html = `
    <h2>BridgeWell Health Support Request</h2>
    <p><strong>Name:</strong> ${fullName}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Preferred reply:</strong> ${preferredReply}</p>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, '<br />')}</p>
  `

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: resendFromEmail,
      to: [supportEmail],
      reply_to: email,
      subject,
      text: buildSummaryText({ fullName, email, subject, message, preferredReply }),
      html,
      attachments
    })
  })

  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || 'Unable to send the support email through Resend.')
  }

  return payload
}

module.exports = async (req, res) => {
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
  const attachment = body.attachment || null

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

  const attachments = [
    {
      filename: 'bridgewell-support-summary.txt',
      content: encodeTextAttachment(
        buildSummaryText({
          fullName,
          email,
          subject,
          message,
          preferredReply
        })
      )
    }
  ]

  if (attachment?.filename && attachment?.content) {
    attachments.push({
      filename: String(attachment.filename),
      content: String(attachment.content)
    })
  }

  const referenceId = `BW-${Date.now()}`

  if (resendApiKey && resendFromEmail) {
    try {
      const payload = await sendViaResend({
        fullName,
        email,
        subject,
        message,
        preferredReply,
        attachments
      })

      return res.status(200).json({
        success: true,
        sent: true,
        supportEmail,
        referenceId: payload.id || referenceId,
        queuedAt: new Date().toISOString(),
        attachmentCount: attachments.length
      })
    } catch (error) {
      return res.status(502).json({
        success: false,
        error: error.message
      })
    }
  }

  return res.status(200).json({
    success: true,
    sent: false,
    supportEmail,
    referenceId,
    queuedAt: new Date().toISOString(),
    attachmentCount: attachments.length,
    note: 'Resend credentials are not configured yet, so the validated email package was prepared locally.'
  })
}
