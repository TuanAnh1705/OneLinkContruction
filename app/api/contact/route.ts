import { NextResponse } from 'next/server'
import { google } from 'googleapis'

// Node runtime — googleapis (and the crypto used to sign the JWT) is not Edge-compatible.
export const runtime = 'nodejs'
// Never prerender / cache — this is a write endpoint.
export const dynamic = 'force-dynamic'

interface ContactPayload {
  fullname?: string
  email?: string
  company?: string
  phone?: string
  projectbrief?: string
}

function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = process.env.GOOGLE_PRIVATE_KEY
  if (!email || !key) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY')
  }
  const auth = new google.auth.JWT({
    email,
    // .env stores newlines as literal "\n" — restore them for the PEM parser.
    key: key.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

export async function POST(request: Request) {
  let body: ContactPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const fullname = (body.fullname ?? '').trim()
  const email = (body.email ?? '').trim()
  const company = (body.company ?? '').trim()
  const phone = (body.phone ?? '').trim()
  const projectbrief = (body.projectbrief ?? '').trim()

  // Minimal validation — name + email are required.
  if (!fullname || !email) {
    return NextResponse.json(
      { ok: false, error: 'Full name and email are required.' },
      { status: 400 }
    )
  }

  const spreadsheetId = process.env.GOOGLE_SHEET_ID
  const tab = process.env.GOOGLE_SHEET_TAB || 'Sheet1'
  if (!spreadsheetId) {
    return NextResponse.json(
      { ok: false, error: 'GOOGLE_SHEET_ID is not configured.' },
      { status: 500 }
    )
  }

  // Thời điểm gửi form — định dạng theo giờ Úc (DD/MM/YYYY, HH:mm:ss) cho dễ đọc trong sheet
  const time = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date())

  try {
    const sheets = getSheetsClient()
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      // Columns order: time | fullname | email | company | phone | projectbrief
      range: `${tab}!A:F`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[time, fullname, email, company, phone, projectbrief]],
      },
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact] Failed to append to Google Sheet:', err)
    return NextResponse.json(
      { ok: false, error: 'Could not save your submission. Please try again.' },
      { status: 502 }
    )
  }
}
