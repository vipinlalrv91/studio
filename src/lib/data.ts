import { placeholderImages } from './placeholder-images.json';

export type User = {
  id: string;
  name: string;
  department: string;
  avatarUrl: string;
  token?: string;
};

export type Ride = {
  id: string;
  driver: User;
  startLocation: string;
  destination: string;
  startLocationCoords: { lat: number; lng: number };
  destinationCoords: { lat: number; lng: number };
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

export type Notification = {
  id: string;
  userId: string;
  read: boolean;
  message: string;
  timestamp: Date;
  type: 'ride-request' | 'ride-update' | 'new-ride-available';
  data: any;
}

export const users: User[] = [
  { id: 'u1', name: 'Alex Johnson', department: 'Engineering', avatarUrl: placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl || '' },
  { id: 'u2', name: 'Maria Garcia', department: 'Marketing', avatarUrl: placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl || '' },
  { id: 'u3', name: 'David Smith', department: 'Sales', avatarUrl: placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl || '' },
  { id: 'u4', name: 'Sarah Chen', department: 'HR', avatarUrl: placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl || '' },
  { id: 'u5', name: 'Chen Wang', department: 'Engineering', avatarUrl: placeholderImages.find(p => p.id === 'user-avatar-5')?.imageUrl || '' },
];

export const rides: Ride[] = [
  {
    id: 'r1',
    driver: users[1], // Maria Garcia
    startLocation: 'Sunnyvale, CA',
    destination: 'San Francisco, CA',
    startLocationCoords: { lat: 37.3688, lng: -122.0363 },
    destinationCoords: { lat: 37.7749, lng: -122.4194 },
    departureTime: new Date(new Date().getTime() - 15 * 60 * 1000), // 15 minutes ago
    availableSeats: 2,
    passengers: [users[0]], // Alex Johnson
    status: 'active',
  },
  {
    id: 'r2',
    driver: users[2], // David Smith
    startLocation: 'Oakland, CA',
    destination: 'Palo Alto, CA',
    startLocationCoords: { lat: 37.8044, lng: -122.2712 },
    destinationCoords: { lat: 37.4419, lng: -122.1430 },
    departureTime: new Date(new Date().getTime() + 4 * 60 * 60 * 1000), // 4 hours from now
    availableSeats: 3,
    passengers: [],
    status: 'upcoming',
  },
  {
    id: 'r3',
    driver: users[3], // Sarah Chen
    startLocation: 'San Jose, CA',
    destination: 'Mountain View, CA',
    startLocationCoords: { lat: 37.3382, lng: -121.8863 },
    destinationCoords: { lat: 37.3861, lng: -122.0838 },
    departureTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // tomorrow
    availableSeats: 1,
    passengers: [users[4]], // Chen Wang
    status: 'upcoming',
  },
  {
    id: 'r4',
    driver: users[0], // Alex Johnson
    startLocation: 'San Francisco, CA',
    destination: 'Sunnyvale, CA',
    startLocationCoords: { lat: 37.7749, lng: -122.4194 },
    destinationCoords: { lat: 37.3688, lng: -122.0363 },
    departureTime: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // yesterday
    availableSeats: 0,
    passengers: [users[2], users[3]],
    status: 'completed',
  },
   {
    id: 'r5',
    driver: users[4], // Chen Wang
    startLocation: 'Berkeley, CA',
    destination: 'San Francisco, CA',
    startLocationCoords: { lat: 37.8715, lng: -122.2730 },
    destinationCoords: { lat: 37.7749, lng: -122.4194 },
    departureTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
    availableSeats: 2,
    passengers: [],
    status: 'upcoming',
  },
];

export const leaderboard: LeaderboardEntry[] = [
    { rank: 1, user: users[1], ridesShared: 42, distanceCovered: 1250 },
    { rank: 2, user: users[3], ridesShared: 38, distanceCovered: 1100 },
    { rank: 3, user: users[0], ridesShared: 35, distanceCovered: 980 },
    { rank: 4, user: users[2], ridesShared: 29, distanceCovered: 850 },
    { rank: 5, user: users[4], ridesShared: 25, distanceCovered: 720 },
];

export const notifications: Notification[] = [
    {
        id: 'n1',
        userId: 'u1', // Alex Johnson
        read: true,
        message: "Your request to join Maria Garcia's ride was approved.",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        type: 'ride-update',
        data: { rideId: 'r1', status: 'approved' }
    },
    {
        id: 'n2',
        userId: 'u2', // Maria Garcia
        read: false,
        message: "David Smith wants to join your ride from Sunnyvale to San Francisco.",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        type: 'ride-request',
        data: { rideId: 'r1', requesterId: 'u3', status: 'pending' }
    }
];