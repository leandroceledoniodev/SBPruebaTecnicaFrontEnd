export type UserRole = 'Administrator' | 'Analyst' | 'Requester'

export interface User {
  id: number
  fullName: string
  email: string
  role: UserRole
  isActive: boolean
}

export interface LoginResponse {
  token: string
  expiresAt: string
  user: User
}

export interface CatalogItem {
  id: number
  name: string
  isActive: boolean
}

export interface RequestType extends CatalogItem {
  description?: string
  slaDays: number
}

export interface RequestSummary {
  id: number
  code: string
  title: string
  priority: string
  status: string
  area: string
  requestType: string
  requester: string
  assignee?: string
  createdAt: string
  dueDate: string
  isOverdue: boolean
}

export interface StatusHistory {
  id: number
  previousStatus?: string
  newStatus: string
  changedAt: string
  comment?: string
  changedBy: string
}

export interface RequestComment {
  id: number
  text: string
  visibility: string
  createdAt: string
  author: string
  authorId: number
}

export interface RequestDetail extends RequestSummary {
  description: string
  areaId: number
  requestTypeId: number
  requesterId: number
  assigneeId?: number
  updatedAt: string
  closedAt?: string
  evidenceReference?: string
  resolutionComment?: string
  allowedTransitions: string[]
  history: StatusHistory[]
  comments: RequestComment[]
}

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface CountItem {
  name: string
  count: number
}

export interface DashboardSummary {
  totalRequests: number
  openRequests: number
  closedRequests: number
  overdueRequests: number
  byStatus: CountItem[]
  byPriority: CountItem[]
  latestRequests: RequestSummary[]
}

export interface Notification {
  id: number
  requestId?: number
  requestCode?: string
  channel: string
  subject: string
  message: string
  status: string
  createdAt: string
  isRead: boolean
}

export interface StatusCatalog {
  statuses: { value: number; name: string }[]
  priorities: { value: number; name: string }[]
  transitions: Record<string, string[]>
}
