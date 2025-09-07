export interface Activity {
  id: number;
  title: string;
  description: string;
  startTime: string; 
  endTime: string;   
  type: ActivityType;
  organizerId: number;
  organizerName: string;
  participantIds: number[];
  participantNames: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityRequest {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  type: ActivityType;
  participantIds: number[];
}

export interface UpdateActivityRequest {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  type: ActivityType;
  participantIds: number[];
}

export enum ActivityType {
  MEETING = 'MEETING',
  CALL = 'CALL',
  TASK = 'TASK',
  EVENT = 'EVENT',
  REMINDER = 'REMINDER'
}

export interface ActivityFilters {
  startDate?: Date;
  endDate?: Date;
  type?: ActivityType;
}