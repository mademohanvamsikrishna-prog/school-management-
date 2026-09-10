/**
 * routes.ts — Central role-to-route configuration.
 *
 * Single source of truth for which dashboard a user lands on after login,
 * and which roles are allowed into each section of the app.
 *
 * Used by:
 *  - src/app/index.tsx      (post-login navigation)
 *  - src/components/guards/AuthGuard.tsx (route protection)
 */

/** Every role the backend can return. Mirrors AuthUser.role in AuthContext. */
export type AppRole = 'admin' | 'teacher' | 'staff' | 'student' | 'parent';

/** Map each role to its home dashboard route. */
export const ROLE_HOME_ROUTES: Record<AppRole, string> = {
  admin:   '/admin/dashboard',
  teacher: '/teacher/dashboard',
  staff:   '/teacher/dashboard',  // staff share the teacher interface
  student: '/students/dashboard',
  parent:  '/parents/dashboard',
};

/**
 * Returns the home route for a given role, or null if the role is unknown.
 * Callers should handle null with a visible error — never silently misdirect.
 */
export function getRoleRoute(role: string | undefined | null): string | null {
  if (!role) return null;
  return ROLE_HOME_ROUTES[role as AppRole] ?? null;
}

/** Allowed roles per section — used by AuthGuard. */
export const SECTION_ALLOWED_ROLES: Record<string, AppRole[]> = {
  admin:    ['admin'],
  teacher:  ['teacher', 'staff', 'admin'],
  students: ['student', 'admin'],
  parents:  ['parent', 'admin'],
};
