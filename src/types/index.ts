export interface TicketWithDetails {
  id: string;
  number: number;
  subject: string;
  status: string;
  priority: string;
  customerId: string;
  customer: {
    id: string;
    email: string;
    name: string | null;
  };
  assignedToId: string | null;
  labels: {
    id: string;
    name: string;
    color: string;
  }[];
  messages: MessageWithSender[];
  emailMessageId: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
}

export interface MessageWithSender {
  id: string;
  ticketId: string;
  senderType: string;
  senderClerkId: string | null;
  fromEmail: string;
  fromName: string | null;
  body: string;
  bodyText: string | null;
  isInternal: boolean;
  resendEmailId: string | null;
  createdAt: string;
}

export interface LabelData {
  id: string;
  name: string;
  color: string;
}

export interface CannedResponseData {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

export interface TeamMemberData {
  clerkUserId: string;
  isActive: boolean;
  createdAt: string;
  name?: string;
  email?: string;
  imageUrl?: string;
}

export interface ClerkUserInfo {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: { emailAddress: string }[];
  imageUrl: string;
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  assignedToId?: string;
  search?: string;
}
