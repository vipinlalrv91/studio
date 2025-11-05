import { placeholderImages } from './placeholder-images.json';

export type User = {
  id: string;
  name: string;
  department: string;
  avatarUrl: string;
};

export type Ride = {
  id: string;
  driver: User;
  startLocation: string;
  destination: string;
  departureTime: Date;
  availableSeats: number;
  passengers: User[];
  status: 'upcoming' | 'active' | 'completed';
};

export type LeaderboardEntry = {
  rank: number;
  user: User;
  ridesShared: number;
  distanceCovered: number; // in km
};

const users: User[] = [
  { id: 'u1', name: 'Alex Johnson', department: 'Engineering', avatarUrl: placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl || '' },
  { id: 'u2', name: 'Maria Garcia', department: 'Marketing', avatarUrl: placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl || '' },
  { id: 'u3', name: 'David Smith', department: 'Sales', avatarUrl: placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl || '' },
  { id: 'u4', name: 'Sarah Chen', department: 'HR', avatarUrl: placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl || '' },
  { id: 'u5', name: 'Chen Wang', department: 'Engineering', avatarUrl: placeholderImages.find(p => p.id === 'user-avatar-5')?.imageUrl || '' },
];

export const mockUser = users[0];

export const rides: Ride[] = [
  {
    id: 'r1',
    driver: users[1],
    startLocation: 'Sunnyvale, CA',
    destination: 'San Francisco, CA',
    departureTime: new Date(new Date().getTime() - 15 * 60 * 1000), // 15 minutes ago
    availableSeats: 2,
    passengers: [users[0]],
    status: 'active',
  },
  {
    id: 'r2',
    driver: users[2],
    startLocation: 'Oakland, CA',
    destination: 'Palo Alto, CA',
    departureTime: new Date(new Date().getTime() + 4 * 60 * 60 * 1000), // 4 hours from now
    availableSeats: 3,
    passengers: [],
    status: 'upcoming',
  },
  {
    id: 'r3',
    driver: users[3],
    startLocation: 'San Jose, CA',
    destination: 'Mountain View, CA',
    departureTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // tomorrow
    availableSeats: 1,
    passengers: [users[4]],
    status: 'upcoming',
  },
  {
    id: 'r4',
    driver: users[0],
    startLocation: 'San Francisco, CA',
    destination: 'Sunnyvale, CA',
    departureTime: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // yesterday
    availableSeats: 0,
    passengers: [users[2], users[3]],
    status: 'completed',
  },
];

export const leaderboard: LeaderboardEntry[] = [
    { rank: 1, user: users[1], ridesShared: 42, distanceCovered: 1250 },
    { rank: 2, user: users[3], ridesShared: 38, distanceCovered: 1100 },
    { rank: 3, user: users[0], ridesShared: 35, distanceCovered: 980 },
    { rank: 4, user: users[2], ridesShared: 29, distanceCovered: 850 },
    { rank: 5, user: users[4], ridesShared: 25, distanceCovered: 720 },
];
