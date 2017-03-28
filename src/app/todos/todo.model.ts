export interface Todo {
  text: string;
  done?: boolean;
  addedTimestamp?: Date | number;
  completedTimestamp?: Date | number;
}