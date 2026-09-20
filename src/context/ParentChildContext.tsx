/**
 * ParentChildContext
 *
 * Shared React context that tracks which child the logged-in parent is
 * currently viewing. A single place to manage selectedChildId so that
 * the Sidebar, Attendance, Results, and Dashboard screens stay in sync.
 *
 * Usage:
 *   const { children, selectedChildId, setSelectedChildId } = useParentChild();
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMyProfile } from '../services/profile';

export interface ChildInfo {
  id: string;
  name: string;
  email?: string;
  className?: string;
  section?: string;
  admission_number?: string;
  roll_number?: string;
  grade_level?: number;
  avatar_url?: string;
}

interface ParentChildContextValue {
  children: ChildInfo[];
  selectedChildId: string | null;
  setSelectedChildId: (id: string) => void;
  activeChild: ChildInfo | null;
  isLoading: boolean;
}

const ParentChildContext = createContext<ParentChildContextValue>({
  children: [],
  selectedChildId: null,
  setSelectedChildId: () => {},
  activeChild: null,
  isLoading: false,
});

export function ParentChildProvider({ children: reactChildren }: { children: ReactNode }) {
  const [childrenList, setChildrenList] = useState<ChildInfo[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profile = await getMyProfile();
        // Support both profile.parent_profile.children and profile.children shapes
        const rawChildren: any[] =
          profile?.parent_profile?.children ||
          (profile as any)?.children ||
          [];

        const mapped: ChildInfo[] = rawChildren.map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          className: c.className || c.student_profile?.class_name || c.class_name,
          section: c.student_profile?.section || c.section,
          admission_number: c.student_profile?.admission_number || c.admission_number,
          roll_number: c.student_profile?.roll_number || c.roll_number,
          grade_level: c.grade_level,
          avatar_url: c.avatar_url,
        }));

        if (!cancelled) {
          setChildrenList(mapped);
          // Default to first child if nothing selected
          if (mapped.length > 0) {
            setSelectedChildId((prev) => prev ?? mapped[0].id);
          }
        }
      } catch {
        // Profile fetch failed — leave empty, screens will show their own errors
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const activeChild = childrenList.find((c) => c.id === selectedChildId) ?? childrenList[0] ?? null;

  return (
    <ParentChildContext.Provider
      value={{
        children: childrenList,
        selectedChildId,
        setSelectedChildId,
        activeChild,
        isLoading,
      }}
    >
      {reactChildren}
    </ParentChildContext.Provider>
  );
}

export function useParentChild(): ParentChildContextValue {
  return useContext(ParentChildContext);
}
