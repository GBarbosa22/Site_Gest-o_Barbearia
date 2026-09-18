export * from "./database.types";

export interface DashboardSummary {
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  cutsToday: number;
  clientsAttendedToday: number;
  newClientsToday: number;
  activeSubscriptions: number;
  lowStockCount: number;
  recentAttendances: RecentAttendance[];
}

export interface RecentAttendance {
  id: string;
  clientName: string;
  barberName: string;
  serviceName: string;
  startsAt: string;
  amount: number | null;
  paid: boolean | null;
}
