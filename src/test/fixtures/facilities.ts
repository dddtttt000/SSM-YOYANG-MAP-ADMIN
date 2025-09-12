export const mockFacility = {
  basic: {
    admin_code: 'TEST001',
    admin_type_code: '01',
    admin_name: '테스트 요양원',
    post_code: '12345',
    sido_code: '11',
    sigungu_code: '1101',
    eupmyeondong_code: '11011',
    address: '서울특별시 종로구 테스트로 123',
    phone_number: '02-1234-5678',
    fax_number: '02-1234-5679',
    homepage: 'http://test.facility.com',
    total_capacity: 50,
    current_occupancy: 45,
    opening_date: '2020-01-01',
    final_rating: 'A',
    final_rating_date: '2023-12-31',
    establishment_status: '운영',
    operation_status: '정상',
    updated_at: '2024-01-01T00:00:00Z'
  },

  withoutRating: {
    admin_code: 'TEST002',
    admin_type_code: '02',
    admin_name: '테스트 데이케어센터',
    post_code: '54321',
    sido_code: '26',
    sigungu_code: '2601',
    eupmyeondong_code: '26011',
    address: '부산광역시 중구 테스트로 456',
    phone_number: '051-1234-5678',
    fax_number: null,
    homepage: null,
    total_capacity: 20,
    current_occupancy: 18,
    opening_date: '2022-06-01',
    final_rating: null,
    final_rating_date: null,
    establishment_status: '운영',
    operation_status: '정상',
    updated_at: '2024-01-01T00:00:00Z'
  },

  closed: {
    admin_code: 'TEST003',
    admin_type_code: '01',
    admin_name: '테스트 폐쇄시설',
    post_code: '98765',
    sido_code: '41',
    sigungu_code: '4111',
    eupmyeondong_code: '41111',
    address: '경기도 수원시 테스트로 789',
    phone_number: '031-1234-5678',
    fax_number: null,
    homepage: null,
    total_capacity: 30,
    current_occupancy: 0,
    opening_date: '2018-01-01',
    final_rating: 'C',
    final_rating_date: '2023-06-30',
    establishment_status: '폐업',
    operation_status: '운영중단',
    updated_at: '2024-01-01T00:00:00Z'
  }
}

export const mockFacilityStats = {
  totalCount: 150,
  activeCount: 135,
  nursingHomeCount: 80,
  dayCareCount: 70,
  ratingDistribution: {
    A: 45,
    B: 60,
    C: 25,
    D: 5,
    E: 0,
    unrated: 15
  },
  regionDistribution: {
    '11': 35, // 서울
    '26': 25, // 부산
    '27': 20, // 대구
    '28': 15, // 인천
    '기타': 55
  },
  averageCapacity: 45.5,
  averageOccupancy: 38.2,
  occupancyRate: 0.84
}

export const mockFacilityTypes = [
  { admin_type_code: '01', type_name: '노인요양원', count: 80 },
  { admin_type_code: '02', type_name: '노인요양공동생활가정', count: 25 },
  { admin_type_code: '03', type_name: '주야간보호센터', count: 45 },
  { admin_type_code: '04', type_name: '단기보호센터', count: 12 },
  { admin_type_code: '05', type_name: '방문요양센터', count: 18 }
]

export const mockFacilityFilters = {
  basic: {
    page: 1,
    limit: 10,
    search: '',
    sidoCode: '',
    sigunguCode: '',
    adminTypeCode: '',
    rating: '',
    showAll: false
  },
  
  withSearch: {
    page: 1,
    limit: 10,
    search: '테스트',
    sidoCode: '',
    sigunguCode: '',
    adminTypeCode: '',
    rating: '',
    showAll: false
  },

  withFilters: {
    page: 1,
    limit: 10,
    search: '',
    sidoCode: '11',
    sigunguCode: '1101',
    adminTypeCode: '01',
    rating: 'A',
    showAll: false
  }
}