import { create } from "zustand";

export interface Department {
  id: string;
  code: string;
  name: string;
  lead_name: string;
  lead_email: string;
  staff_count: number;
  capacity: number;
  monthly_budget_rwf: number;
  location: string;
  status: "Active" | "Reorganizing" | "Inactive";
  description: string;
}

const INITIAL_DEPARTMENTS: Department[] = [];

interface DepartmentState {
  departments: Department[];
  setDepartments: (depts: Department[]) => void;
  addDepartment: (dept: Omit<Department, "id">) => Department;
  updateDepartment: (dept: Department) => void;
  deleteDepartment: (id: string) => void;
  getDepartmentNames: () => string[];
}

export const useDepartmentStore = create<DepartmentState>((set, get) => ({
  departments: INITIAL_DEPARTMENTS,
  setDepartments: (depts) => set({ departments: depts }),
  addDepartment: (deptData) => {
    const newDept: Department = {
      ...deptData,
      id: `DEP-00${get().departments.length + 1}`,
    };
    set((state) => ({ departments: [...state.departments, newDept] }));
    return newDept;
  },
  updateDepartment: (updatedDept) => {
    set((state) => ({
      departments: state.departments.map((d) =>
        d.id === updatedDept.id ? updatedDept : d
      ),
    }));
  },
  deleteDepartment: (id) => {
    set((state) => ({
      departments: state.departments.filter((d) => d.id !== id),
    }));
  },
  getDepartmentNames: () => {
    return get().departments.map((d) => d.name);
  },
}));
