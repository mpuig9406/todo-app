export interface Task {
  id: string;
  title: string;
  notes: string;
  categoryId: string | null;
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  startDate: string | null;
  completed: boolean;
  completedAt: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  position: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export type TaskCreateInput = Pick<
  Task,
  "title" | "notes" | "categoryId" | "priority" | "dueDate" | "startDate"
>;

export type TaskUpdateInput = Partial<TaskCreateInput> & {
  completed?: boolean;
  position?: number;
};

export type FilterState = {
  category: string;
  completed: boolean;
  search: string;
  sort: "position" | "due_date" | "created" | "priority";
};
