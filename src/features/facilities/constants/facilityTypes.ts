export const FACILITY_TYPE_LABELS: Record<string, string> = {
  // 노인요양시설
  'A01': '노인요양시설',
  'A02': '노인전문요양시설',
  'A03': '노인요양시설(개정법)',
  'A04': '노인요양공동생활가정',
  'A05': '노인요양시설(단기보호 전환)',
  'AAA': '입소시설',
  
  // 재가노인복지시설
  'B01': '재가노인복지시설 방문요양',
  'B02': '재가노인복지시설 방문목욕',
  'B03': '재가노인복지시설 주야간보호',
  'B04': '재가노인복지시설 단기보호',
  'B05': '재가노인복지시설 방문간호',
  
  // 재가장기요양기관
  'C01': '재가장기요양기관 방문요양',
  'C02': '재가장기요양기관 방문목욕',
  'C03': '재가장기요양기관 주야간보호',
  'C04': '재가장기요양기관 단기보호',
  'C05': '재가장기요양기관 방문간호',
  'C06': '재가장기요양기관 복지용구',
  
  // 기타
  'Z01': '기타',
  
  // 치매전담형
  'S41': '치매전담형 노인요양공동생활가정',
}

// 치매전담실 가형 (G31 ~ G99)
for (let i = 31; i <= 99; i++) {
  FACILITY_TYPE_LABELS[`G${i}`] = `치매전담실 가형 ${i - 30}실`
}

// 치매전담실 나형 (M31 ~ M99)
for (let i = 31; i <= 99; i++) {
  FACILITY_TYPE_LABELS[`M${i}`] = `치매전담실 나형 ${i - 30}실`
}

// 주야간보호 내 치매전담 H형 (H31 ~ H99)
for (let i = 31; i <= 99; i++) {
  FACILITY_TYPE_LABELS[`H${i}`] = `주야간보호 내 치매전담 ${i - 30}실`
}

// 주야간보호 내 치매전담 I형 (I31 ~ I99)
for (let i = 31; i <= 99; i++) {
  FACILITY_TYPE_LABELS[`I${i}`] = `주야간보호 내 치매전담 ${i - 30}실`
}

export const getFacilityTypeLabel = (code: string | null | undefined): string => {
  if (!code) return '미지정'
  return FACILITY_TYPE_LABELS[code] || code
}