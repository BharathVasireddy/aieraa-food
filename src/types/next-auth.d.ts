import 'next-auth';

import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      status: string;
      universityId?: string | null;
      university?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    status: string;
    universityId?: string | null;
    university?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole;
    status: string;
    universityId?: string | null;
    university?: string | null;
  }
}
