export type CourseKind = "mandatory" | "elective" | "external" | "experimental";

export type Weekday = "seg" | "ter" | "qua" | "qui" | "sex";

export interface Course {
  id: string;
  name: string;
  period: number | null;
  workload: number;
  kind: CourseKind;
  prerequisites?: string[];
}

export interface Meeting {
  day: Weekday;
  start: string;
  end: string;
}

export interface PlannedCourse {
  id: string;
  courseId?: string;
  name: string;
  kind: CourseKind;
  meetings: Meeting[];
}

export interface PlannerData {
  completedCourseIds: string[];
  plannedCourses: PlannedCourse[];
}
