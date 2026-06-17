import { NextResponse } from 'next/server'

// Write endpoint — không prerender/cache.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ContactPayload {
  fullname?: string
  email?: string
  company?: string
  phone?: string
  projectbrief?: string
}

// Map field của form (trái) -> tên field NỘI BỘ trên HubSpot (phải).
// HubSpot Submission API yêu cầu tên phải khớp đúng field nội bộ của form, nếu sai sẽ trả lỗi.
// Nếu form HubSpot dùng tên khác (vd: firstname/lastname/message) thì chỉ cần sửa các giá trị bên phải.
const HUBSPOT_FIELDS: Record<keyof ContactPayload, string> = {
  fullname: 'fullname',
  email: 'email',
  company: 'company',
  phone: 'phone',
  projectbrief: 'projectbrief',
}

// Public (nằm trong embed script) — không phải secret. Cho phép override qua env nếu cần.
const PORTAL_ID = process.env.HUBSPOT_PORTAL_ID || '46681098'
const FORM_GUID = process.env.HUBSPOT_FORM_GUID || 'd4206b98-f717-4b50-bcae-a73045f15e3f'

export async function POST(request: Request) {
  let body: ContactPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const values: Record<keyof ContactPayload, string> = {
    fullname: (body.fullname ?? '').trim(),
    email: (body.email ?? '').trim(),
    company: (body.company ?? '').trim(),
    phone: (body.phone ?? '').trim(),
    projectbrief: (body.projectbrief ?? '').trim(),
  }

  // Minimal validation — name + email là bắt buộc.
  if (!values.fullname || !values.email) {
    return NextResponse.json(
      { ok: false, error: 'Full name and email are required.' },
      { status: 400 }
    )
  }

  // Chỉ gửi field có giá trị; map sang tên field nội bộ của HubSpot.
  const fields = (Object.keys(values) as (keyof ContactPayload)[])
    .filter((key) => values[key])
    .map((key) => ({ name: HUBSPOT_FIELDS[key], value: values[key] }))

  // Cookie hubspotutk (nếu HubSpot tracking có set) giúp gắn submission vào đúng visitor/contact.
  const hutk = request.headers.get('cookie')?.match(/hubspotutk=([^;]+)/)?.[1]

  const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_GUID}`

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields,
        context: {
          ...(hutk ? { hutk } : {}),
          pageUri: request.headers.get('referer') || undefined,
          pageName: 'OLCO — Contact',
        },
      }),
    })

    if (!res.ok) {
      // HubSpot trả lỗi chi tiết (kèm tên field sai) — log ra để dễ chỉnh HUBSPOT_FIELDS.
      const detail = await res.text()
      console.error('[contact] HubSpot submit failed:', res.status, detail)
      return NextResponse.json(
        { ok: false, error: 'Could not submit your inquiry. Please try again.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact] HubSpot request error:', err)
    return NextResponse.json(
      { ok: false, error: 'Could not submit your inquiry. Please try again.' },
      { status: 502 }
    )
  }
}
