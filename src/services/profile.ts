import { api } from './api';

export interface StudentProfileData {
  roll_number: string;
  admission_number: string;
  section: string;
  class_id?: string;
  class_name?: string;
}

export interface TeacherProfileData {
  employee_id: string;
  department: string;
  designation: string;
  is_class_teacher: boolean;
  class_teacher_of_id?: string;
  class_teacher_of_name?: string;
}

export interface ChildInfo {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  student_profile?: {
    roll_number?: string;
    admission_number?: string;
    section?: string;
    class_name?: string;
    grade_level?: number;
    date_of_birth?: string;
    gender?: string;
    blood_group?: string;
  };
}

export interface ParentProfileData {
  occupation?: string;
  alternate_phone?: string;
  children: ChildInfo[];
}

export interface FullProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: string;
  is_active: boolean;
  student_profile?: StudentProfileData;
  teacher_profile?: TeacherProfileData;
  parent_profile?: ParentProfileData;
}

export async function getMyProfile(): Promise<FullProfile> {
  return api.get<FullProfile>('/profile/me');
}
