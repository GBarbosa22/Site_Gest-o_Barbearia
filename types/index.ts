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
  upcomingAppointments: UpcomingAppointment[];
}

export interface UpcomingAppointment {
  id: string;
  clientName: string;
  barberName: string;
  serviceName: string;
  startsAt: string;
}
