import type { FAQCategory } from '../constants'

export type { FAQCategory } from '../constants'

export interface Question {
  id: number
  created_at: string
  updated_at?: string
  category: FAQCategory
  title: string
  content: string
}

export interface CreateQuestionData {
  title: string
  content: string
  category: FAQCategory
}

export interface UpdateQuestionData {
  title: string
  content: string
  category: FAQCategory
}

export interface QuestionFilters {
  category?: FAQCategory
  search?: string
  page?: number
  pageSize?: number
}