import { useEffect, useState } from "react";
import type { PlannerData, PlannedCourse } from "../types/planner";

const STORAGE_KEY = "acervo_uabj_planner_v1";
const emptyData: PlannerData = { completedCourseIds: [], plannedCourses: [] };

const readStoredData = (): PlannerData => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as PlannerData) : emptyData;
  } catch {
    return emptyData;
  }
};

export function usePlanner() {
  const [data, setData] = useState<PlannerData>(readStoredData);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const toggleCompleted = (courseId: string) => {
    setData((current) => ({
      ...current,
      completedCourseIds: current.completedCourseIds.includes(courseId)
        ? current.completedCourseIds.filter((id) => id !== courseId)
        : [...current.completedCourseIds, courseId],
    }));
  };

  const addPlannedCourse = (plannedCourse: PlannedCourse) => {
    setData((current) => ({
      ...current,
      plannedCourses: [...current.plannedCourses, plannedCourse],
    }));
  };

  const removePlannedCourse = (id: string) => {
    setData((current) => ({
      ...current,
      plannedCourses: current.plannedCourses.filter((course) => course.id !== id),
    }));
  };

  return { data, setData, toggleCompleted, addPlannedCourse, removePlannedCourse };
}
