import { UserRole } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/signin")
  }
  return user
}

export async function requireRole(role: UserRole) {
  const user = await requireAuth()
  if (user.role !== role) {
    redirect("/unauthorized")
  }
  return user
}

export async function requireRoles(roles: UserRole[]) {
  const user = await requireAuth()
  if (!roles.includes(user.role)) {
    redirect("/unauthorized")
  }
  return user
}

export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole)
}

export function isAdmin(role: UserRole): boolean {
  return role === "ADMIN"
}

export function isManager(role: UserRole): boolean {
  return role === "MANAGER"
}

export function isStudent(role: UserRole): boolean {
  return role === "STUDENT"
}