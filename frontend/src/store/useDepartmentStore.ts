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

const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: "DEP-001",
    code: "KF-DEP-FARM",
    name: "Farm Operations & Cultivation",
    lead_name: "Jean-Claude Mugisha",
    lead_email: "jc.mugisha@kainafresh.rw",
    staff_count: 2,
    capacity: 15,
    monthly_budget_rwf: 14500000,
    location: "Musanze Plots A & B",
    status: "Active",
    description: "Soil management, organic crop planting, irrigation, pest control, and plot yield optimization.",
  },
  {
    id: "DEP-002",
    code: "KF-DEP-POST",
    name: "Post-Harvest & Packaging",
    lead_name: "Alice Uwimana",
    lead_email: "alice.uwimana@kainafresh.rw",
    staff_count: 1,
    capacity: 10,
    monthly_budget_rwf: 6800000,
    location: "Kigali Packhouse Hub",
    status: "Active",
    description: "Quality control sorting, washing, cold storage preservation, eco-packaging, and EU compliance.",
  },
  {
    id: "DEP-003",
    code: "KF-DEP-LOG",
    name: "Logistics & Fleet Delivery",
    lead_name: "Emmanuel Habimana",
    lead_email: "e.habimana@kainafresh.rw",
    staff_count: 1,
    capacity: 10,
    monthly_budget_rwf: 4200000,
    location: "Kigali Logistics Hub",
    status: "Active",
    description: "Refrigerated transport fleet, route planning, B2B wholesale dispatch, and home delivery.",
  },
  {
    id: "DEP-004",
    code: "KF-DEP-SLS",
    name: "Sales & B2B Accounts",
    lead_name: "Solange Murekatete",
    lead_email: "s.murekatete@kainafresh.rw",
    staff_count: 1,
    capacity: 10,
    monthly_budget_rwf: 2100000,
    location: "Kigali Commercial Office",
    status: "Active",
    description: "Hotel & supermarket bulk supply contracts, export client relations, and digital marketplace management.",
  },
  {
    id: "DEP-005",
    code: "KF-DEP-ADM",
    name: "Admin, HR & Finance",
    lead_name: "Paul Ntaganda",
    lead_email: "paul.ntaganda@kainafresh.rw",
    staff_count: 0,
    capacity: 5,
    monthly_budget_rwf: 1800000,
    location: "Kigali HQ",
    status: "Active",
    description: "Human capital management, payroll processing, statutory compliance, audit, and legal affairs.",
  },
];

interface DepartmentState {
  departments: Department[];
  addDepartment: (dept: Omit<Department, "id">) => Department;
  updateDepartment: (dept: Department) => void;
  deleteDepartment: (id: string) => void;
  getDepartmentNames: () => string[];
}

export const useDepartmentStore = create<DepartmentState>((set, get) => ({
  departments: INITIAL_DEPARTMENTS,
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
