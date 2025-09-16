import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface ServiceInquiry {
  id: number
  title: string
  content: string
  email: string
  phone: string | null
  member_id: number | null
  status: string | null
  created_at: string | null
  updated_at: string | null
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: ServiceInquiry
  schema: string
  old_record?: ServiceInquiry | null
}

// 슬랙 웹훅 URL을 환경에 따라 결정하는 함수
function getSlackWebhookUrl(): string {
  // 운영환경 전용 URL 사용
  return Deno.env.get('SLACK_WEBHOOK_URL_SERVICE_INQUIRY_PROD') ||
         Deno.env.get('SLACK_WEBHOOK_URL') || // 레거시 호환성
         ''
}

serve(async req => {
  try {
    const payload: WebhookPayload = await req.json()
    const { type, record, old_record } = payload

    // 슬랙 메시지 포맷 생성
    const message = formatSlackMessage(type, record, old_record)

    // 슬랙 웹훅 URL 결정
    const slackWebhookUrl = getSlackWebhookUrl()

    if (!slackWebhookUrl) {
      console.error('Slack webhook URL not configured for production environment')
      return new Response('Webhook URL not configured', { status: 500 })
    }
    const slackResponse = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })

    if (!slackResponse.ok) {
      throw new Error(`Slack API error: ${slackResponse.status}`)
    }

    return new Response('Success', { status: 200 })
  } catch (error) {
    // Log error for debugging
    return new Response('Error', { status: 500 })
  }
})

function formatSlackMessage(type: string, record: ServiceInquiry, oldRecord?: ServiceInquiry | null) {
  const baseMessage = {
    username: '서비스문의 알림봇',
    icon_emoji: ':bell:',
    channel: '#순시미네-서비스문의-알림', // 웹훅 설정 채널 오버라이드
  }

  switch (type) {
    case 'INSERT':
      return {
        ...baseMessage,
        text: ':new: 새로운 서비스 문의가 등록되었습니다.',
        attachments: [
          {
            color: 'good',
            fields: [
              { title: '작성자 ID', value: record.member_id?.toString() || '비회원', short: true },
              { title: '이메일', value: record.email, short: true },
              { title: '제목', value: record.title, short: false },
              {
                title: '내용',
                value: record.content.length > 100 ? record.content.substring(0, 100) + '...' : record.content,
                short: false,
              },
              { title: '전화번호', value: record.phone || '미제공', short: true },
              { title: '상태', value: record.status === 'pending' ? '대기중' : '답변완료', short: true },
              { title: '등록일', value: new Date(record.created_at!).toLocaleString('ko-KR'), short: true },
            ],
            footer: '순시미네 관리자 시스템',
          },
        ],
      }

    case 'UPDATE': {
      const statusChanged = oldRecord?.status !== record.status
      return {
        ...baseMessage,
        text: statusChanged
          ? ':white_check_mark: 서비스 문의 상태가 변경되었습니다.'
          : ':pencil2: 서비스 문의가 수정되었습니다.',
        attachments: [
          {
            color: 'warning',
            fields: [
              { title: '작성자 ID', value: record.member_id?.toString() || '비회원', short: true },
              { title: '이메일', value: record.email, short: true },
              { title: '제목', value: record.title, short: false },
              {
                title: '내용',
                value: record.content.length > 100 ? record.content.substring(0, 100) + '...' : record.content,
                short: false,
              },
              ...(statusChanged
                ? [
                    { title: '이전 상태', value: oldRecord?.status === 'pending' ? '대기중' : '답변완료', short: true },
                    { title: '현재 상태', value: record.status === 'pending' ? '대기중' : '답변완료', short: true },
                  ]
                : []),
              { title: '수정일', value: new Date(record.updated_at!).toLocaleString('ko-KR'), short: true },
            ],
            footer: '순시미네 관리자 시스템',
          },
        ],
      }
    }

    case 'DELETE':
      return {
        ...baseMessage,
        text: ':x: 서비스 문의가 삭제되었습니다.',
        attachments: [
          {
            color: 'danger',
            fields: [
              { title: '작성자 ID', value: record.member_id?.toString() || '비회원', short: true },
              { title: '이메일', value: record.email, short: true },
              { title: '제목', value: record.title, short: false },
              {
                title: '내용',
                value: record.content.length > 100 ? record.content.substring(0, 100) + '...' : record.content,
                short: false,
              },
              { title: '삭제일', value: new Date().toLocaleString('ko-KR'), short: true },
            ],
            footer: '순시미네 관리자 시스템',
          },
        ],
      }

    default:
      return {
        ...baseMessage,
        text: `알 수 없는 작업이 발생했습니다: ${type}`,
        attachments: [
          {
            color: 'warning',
            fields: [
              { title: '작업 유형', value: type, short: true },
              { title: '작성자 ID', value: record.member_id?.toString() || '비회원', short: true },
            ],
          },
        ],
      }
  }
}
