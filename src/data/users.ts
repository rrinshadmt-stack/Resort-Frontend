import { User } from "@/types/user";

export const MOCK_USERS: User[] = [
  {
    id: "usr-01",
    name: "Demo User",
    email: "demo.user@example.com",
    phone: "+1 (555) 019-2834",
    role: "customer",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    joinedDate: "2024-01-15",
    status: "active",
  },
];

// Current logged in demo context
export const CURRENT_MOCK_USER = MOCK_USERS[0]; // Demo User (Customer)
