// Database types for MEJATIKA application

export type UserRole = "admin" | "contributor" | "participant"

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Menu {
  id: string
  title: string
  url: string
  order: number
  parentId: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface NewsCategory {
  id: string
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

export interface News {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  image: string
  categoryId: string
  authorId: string
  status: "draft" | "published"
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Course {
  id: string
  title: string
  description: string
  image: string
  duration: string
  instructor: string
  price: number
  status: "active" | "inactive"
  createdAt: Date
  updatedAt: Date
}

export interface CourseSchedule {
  id: string
  courseId: string
  title: string
  startDate: Date
  endDate: Date
  time: string
  location: string
  maxParticipants: number
  currentParticipants: number
  status: "upcoming" | "ongoing" | "completed"
  createdAt: Date
  updatedAt: Date
}

export interface CourseRegistration {
  id: string
  courseId: string
  scheduleId: string
  userId: string
  status: "pending" | "approved" | "rejected" | "completed"
  paymentStatus: "pending" | "paid" | "refunded"
  registeredAt: Date
  updatedAt: Date
}

export interface Material {
  id: string
  courseId: string
  title: string
  description: string
  type: "video" | "document" | "link"
  url: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface Gallery {
  id: string
  title: string
  description: string
  image: string
  category: string
  createdAt: Date
  updatedAt: Date
}

export interface Download {
  id: string
  title: string
  description: string
  fileUrl: string
  fileSize: string
  fileType: string
  downloadCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Certificate {
  id: string
  userId: string
  courseId: string
  certificateNumber: string
  issuedAt: Date
  pdfUrl: string
  createdAt: Date
  updatedAt: Date
}

export interface AppSettings {
  id: string
  key: string
  value: string
  type: "text" | "number" | "boolean" | "json"
  description: string
  updatedAt: Date
}
