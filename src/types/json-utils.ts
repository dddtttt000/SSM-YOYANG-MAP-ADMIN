import { Json } from './database.types'

// Type guard to check if Json is an object with specific properties
export function isJsonObject(json: Json): json is { [key: string]: Json | undefined } {
  return typeof json === 'object' && json !== null && !Array.isArray(json)
}

// Helper to safely get string value from Json
export function getStringFromJson(json: Json | null | undefined, key: string): string | undefined {
  if (!json || !isJsonObject(json)) return undefined
  const value = json[key]
  return typeof value === 'string' ? value : undefined
}

// Helper to safely convert Json contact_info to typed object
export interface ContactInfo {
  phone?: string
  email?: string
  website?: string
}

export function getContactInfo(json: Json | null | undefined): ContactInfo {
  if (!json || !isJsonObject(json)) return {}
  
  return {
    phone: getStringFromJson(json, 'phone'),
    email: getStringFromJson(json, 'email'),
    website: getStringFromJson(json, 'website'),
  }
}

// Helper for operating hours
export interface OperatingHours {
  weekday?: string
  weekend?: string
  holiday?: string
}

export function getOperatingHours(json: Json | null | undefined): OperatingHours {
  if (!json || !isJsonObject(json)) return {}
  
  return {
    weekday: getStringFromJson(json, 'weekday'),
    weekend: getStringFromJson(json, 'weekend'),
    holiday: getStringFromJson(json, 'holiday'),
  }
}