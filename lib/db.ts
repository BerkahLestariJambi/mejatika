// Simple in-memory database for mock data
// In production, this would be replaced with actual database queries

import {
  mockUsers,
  mockMenus,
  mockNewsCategories,
  mockNews,
  mockCourses,
  mockCourseSchedules,
  mockGallery,
  mockDownloads,
  mockAppSettings,
} from "./mock-data"

import type {
  User,
  Menu,
  NewsCategory,
  News,
  Course,
  CourseSchedule,
  Gallery,
  Download,
  AppSettings,
  Certificate,
  CourseRegistration,
  Material,
} from "./types"

// Database class to simulate database operations
class Database {
  users: User[] = [...mockUsers]
  menus: Menu[] = [...mockMenus]
  newsCategories: NewsCategory[] = [...mockNewsCategories]
  news: News[] = [...mockNews]
  courses: Course[] = [...mockCourses]
  courseSchedules: CourseSchedule[] = [...mockCourseSchedules]
  gallery: Gallery[] = [...mockGallery]
  downloads: Download[] = [...mockDownloads]
  appSettings: AppSettings[] = [...mockAppSettings]
  certificates: Certificate[] = []
  registrations: CourseRegistration[] = []
  materials: Material[] = []

  // User operations
  async getUsers() {
    return this.users
  }

  async getUserById(id: string) {
    return this.users.find((u) => u.id === id)
  }

  async getUserByEmail(email: string) {
    return this.users.find((u) => u.email === email)
  }

  // User CRUD
  async createUser(user: Omit<User, "id" | "createdAt" | "updatedAt">) {
    const newUser: User = {
      ...user,
      id: String(this.users.length + 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.users.push(newUser)
    return newUser
  }

  async updateUser(id: string, updates: Partial<User>) {
    const index = this.users.findIndex((u) => u.id === id)
    if (index !== -1) {
      this.users[index] = {
        ...this.users[index],
        ...updates,
        updatedAt: new Date(),
      }
      return this.users[index]
    }
    return null
  }

  async deleteUser(id: string) {
    const index = this.users.findIndex((u) => u.id === id)
    if (index !== -1) {
      this.users.splice(index, 1)
      return true
    }
    return false
  }

  // Menu operations
  async getMenus() {
    return this.menus.filter((m) => m.isActive).sort((a, b) => a.order - b.order)
  }

  async getMenuById(id: string) {
    return this.menus.find((m) => m.id === id)
  }

  async getSubMenus(parentId: string) {
    return this.menus.filter((m) => m.parentId === parentId && m.isActive).sort((a, b) => a.order - b.order)
  }

  // Menu CRUD
  async createMenu(menu: Omit<Menu, "id" | "createdAt" | "updatedAt">) {
    const newMenu: Menu = {
      ...menu,
      id: String(this.menus.length + 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.menus.push(newMenu)
    return newMenu
  }

  async updateMenu(id: string, updates: Partial<Menu>) {
    const index = this.menus.findIndex((m) => m.id === id)
    if (index !== -1) {
      this.menus[index] = {
        ...this.menus[index],
        ...updates,
        updatedAt: new Date(),
      }
      return this.menus[index]
    }
    return null
  }

  async deleteMenu(id: string) {
    const index = this.menus.findIndex((m) => m.id === id)
    if (index !== -1) {
      this.menus.splice(index, 1)
      return true
    }
    return false
  }

  // News operations
  async getNews(limit?: number) {
    const published = this.news
      .filter((n) => n.status === "published")
      .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime())

    return limit ? published.slice(0, limit) : published
  }

  async getNewsById(id: string) {
    return this.news.find((n) => n.id === id)
  }

  async getNewsBySlug(slug: string) {
    return this.news.find((n) => n.slug === slug)
  }

  async getNewsByCategory(categoryId: string) {
    return this.news.filter((n) => n.categoryId === categoryId && n.status === "published")
  }

  // News CRUD
  async createNews(news: Omit<News, "id" | "createdAt" | "updatedAt">) {
    const newNews: News = {
      ...news,
      id: String(this.news.length + 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.news.push(newNews)
    return newNews
  }

  async updateNews(id: string, updates: Partial<News>) {
    const index = this.news.findIndex((n) => n.id === id)
    if (index !== -1) {
      this.news[index] = {
        ...this.news[index],
        ...updates,
        updatedAt: new Date(),
      }
      return this.news[index]
    }
    return null
  }

  async deleteNews(id: string) {
    const index = this.news.findIndex((n) => n.id === id)
    if (index !== -1) {
      this.news.splice(index, 1)
      return true
    }
    return false
  }

  // News Category operations
  async getNewsCategories() {
    return this.newsCategories
  }

  async getNewsCategoryById(id: string) {
    return this.newsCategories.find((c) => c.id === id)
  }

  // Category CRUD
  async createCategory(category: Omit<NewsCategory, "id" | "createdAt" | "updatedAt">) {
    const newCategory: NewsCategory = {
      ...category,
      id: String(this.newsCategories.length + 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.newsCategories.push(newCategory)
    return newCategory
  }

  async updateCategory(id: string, updates: Partial<NewsCategory>) {
    const index = this.newsCategories.findIndex((c) => c.id === id)
    if (index !== -1) {
      this.newsCategories[index] = {
        ...this.newsCategories[index],
        ...updates,
        updatedAt: new Date(),
      }
      return this.newsCategories[index]
    }
    return null
  }

  async deleteCategory(id: string) {
    const index = this.newsCategories.findIndex((c) => c.id === id)
    if (index !== -1) {
      this.newsCategories.splice(index, 1)
      return true
    }
    return false
  }

  // Course operations
  async getCourses() {
    return this.courses.filter((c) => c.status === "active")
  }

  async getCourseById(id: string) {
    return this.courses.find((c) => c.id === id)
  }

  // Course CRUD
  async createCourse(course: Omit<Course, "id" | "createdAt" | "updatedAt">) {
    const newCourse: Course = {
      ...course,
      id: String(this.courses.length + 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.courses.push(newCourse)
    return newCourse
  }

  async updateCourse(id: string, updates: Partial<Course>) {
    const index = this.courses.findIndex((c) => c.id === id)
    if (index !== -1) {
      this.courses[index] = {
        ...this.courses[index],
        ...updates,
        updatedAt: new Date(),
      }
      return this.courses[index]
    }
    return null
  }

  async deleteCourse(id: string) {
    const index = this.courses.findIndex((c) => c.id === id)
    if (index !== -1) {
      this.courses.splice(index, 1)
      return true
    }
    return false
  }

  // Course Schedule operations
  async getCourseSchedules() {
    return this.courseSchedules.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  }

  async getUpcomingSchedules(limit?: number) {
    const upcoming = this.courseSchedules
      .filter((s) => s.status === "upcoming")
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

    return limit ? upcoming.slice(0, limit) : upcoming
  }

  async getScheduleById(id: string) {
    return this.courseSchedules.find((s) => s.id === id)
  }

  // Schedule CRUD
  async createSchedule(schedule: Omit<CourseSchedule, "id" | "createdAt" | "updatedAt">) {
    const newSchedule: CourseSchedule = {
      ...schedule,
      id: String(this.courseSchedules.length + 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.courseSchedules.push(newSchedule)
    return newSchedule
  }

  async updateSchedule(id: string, updates: Partial<CourseSchedule>) {
    const index = this.courseSchedules.findIndex((s) => s.id === id)
    if (index !== -1) {
      this.courseSchedules[index] = {
        ...this.courseSchedules[index],
        ...updates,
        updatedAt: new Date(),
      }
      return this.courseSchedules[index]
    }
    return null
  }

  async deleteSchedule(id: string) {
    const index = this.courseSchedules.findIndex((s) => s.id === id)
    if (index !== -1) {
      this.courseSchedules.splice(index, 1)
      return true
    }
    return false
  }

  // Gallery operations
  async getGallery() {
    return this.gallery.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async getGalleryById(id: string) {
    return this.gallery.find((g) => g.id === id)
  }

  // Gallery CRUD
  async createGallery(gallery: Omit<Gallery, "id" | "createdAt" | "updatedAt">) {
    const newGallery: Gallery = {
      ...gallery,
      id: String(this.gallery.length + 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.gallery.push(newGallery)
    return newGallery
  }

  async updateGallery(id: string, updates: Partial<Gallery>) {
    const index = this.gallery.findIndex((g) => g.id === id)
    if (index !== -1) {
      this.gallery[index] = {
        ...this.gallery[index],
        ...updates,
        updatedAt: new Date(),
      }
      return this.gallery[index]
    }
    return null
  }

  async deleteGallery(id: string) {
    const index = this.gallery.findIndex((g) => g.id === id)
    if (index !== -1) {
      this.gallery.splice(index, 1)
      return true
    }
    return false
  }

  // Download operations
  async getDownloads() {
    return this.downloads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async getDownloadById(id: string) {
    return this.downloads.find((d) => d.id === id)
  }

  // Download CRUD
  async createDownload(download: Omit<Download, "id" | "createdAt" | "updatedAt">) {
    const newDownload: Download = {
      ...download,
      id: String(this.downloads.length + 1),
      downloadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.downloads.push(newDownload)
    return newDownload
  }

  async updateDownload(id: string, updates: Partial<Download>) {
    const index = this.downloads.findIndex((d) => d.id === id)
    if (index !== -1) {
      this.downloads[index] = {
        ...this.downloads[index],
        ...updates,
        updatedAt: new Date(),
      }
      return this.downloads[index]
    }
    return null
  }

  async deleteDownload(id: string) {
    const index = this.downloads.findIndex((d) => d.id === id)
    if (index !== -1) {
      this.downloads.splice(index, 1)
      return true
    }
    return false
  }

  async incrementDownloadCount(id: string) {
    const download = await this.getDownloadById(id)
    if (download) {
      return this.updateDownload(id, { downloadCount: download.downloadCount + 1 })
    }
    return null
  }

  // App Settings operations
  async getSettings() {
    return this.appSettings
  }

  async getSettingByKey(key: string) {
    return this.appSettings.find((s) => s.key === key)
  }

  async getSettingValue(key: string) {
    const setting = await this.getSettingByKey(key)
    return setting?.value
  }

  // Settings CRUD
  async updateSetting(key: string, value: string) {
    const index = this.appSettings.findIndex((s) => s.key === key)
    if (index !== -1) {
      this.appSettings[index] = {
        ...this.appSettings[index],
        value,
        updatedAt: new Date(),
      }
      return this.appSettings[index]
    }
    return null
  }

  // Registration operations
  async getRegistrations() {
    return this.registrations
  }

  async getRegistrationById(id: string) {
    return this.registrations.find((r) => r.id === id)
  }

  // Registration CRUD
  async createRegistration(registration: Omit<CourseRegistration, "id" | "registeredAt" | "updatedAt">) {
    const newRegistration: CourseRegistration = {
      ...registration,
      id: String(this.registrations.length + 1),
      registeredAt: new Date(),
      updatedAt: new Date(),
    }
    this.registrations.push(newRegistration)
    return newRegistration
  }

  async updateRegistration(id: string, updates: Partial<CourseRegistration>) {
    const index = this.registrations.findIndex((r) => r.id === id)
    if (index !== -1) {
      this.registrations[index] = {
        ...this.registrations[index],
        ...updates,
        updatedAt: new Date(),
      }
      return this.registrations[index]
    }
    return null
  }

  // Certificate operations
  async getCertificates() {
    return this.certificates
  }

  async getCertificateById(id: string) {
    return this.certificates.find((c) => c.id === id)
  }

  async getCertificatesByUser(userId: string) {
    return this.certificates.filter((c) => c.userId === userId)
  }

  // Certificate CRUD
  async createCertificate(certificate: Omit<Certificate, "id" | "createdAt">) {
    const newCertificate: Certificate = {
      ...certificate,
      id: String(this.certificates.length + 1),
      createdAt: new Date(),
    }
    this.certificates.push(newCertificate)
    return newCertificate
  }

  // Material operations
  async getMaterials(courseId?: string) {
    if (courseId) {
      return this.materials.filter((m) => m.courseId === courseId)
    }
    return this.materials
  }

  // Material CRUD
  async createMaterial(material: Omit<Material, "id" | "createdAt" | "updatedAt">) {
    const newMaterial: Material = {
      ...material,
      id: String(this.materials.length + 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.materials.push(newMaterial)
    return newMaterial
  }

  async updateMaterial(id: string, updates: Partial<Material>) {
    const index = this.materials.findIndex((m) => m.id === id)
    if (index !== -1) {
      this.materials[index] = {
        ...this.materials[index],
        ...updates,
        updatedAt: new Date(),
      }
      return this.materials[index]
    }
    return null
  }

  async deleteMaterial(id: string) {
    const index = this.materials.findIndex((m) => m.id === id)
    if (index !== -1) {
      this.materials.splice(index, 1)
      return true
    }
    return false
  }
}

// Export singleton instance
export const db = new Database()
