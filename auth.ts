import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      emailVerificationStatus?: {
        isEmailVerified: boolean;
        emailVerifiedAt: string | null;
        requiresVerification: boolean;
      };
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User extends DefaultUser {
    role: string;
    emailVerificationStatus?: {
      isEmailVerified: boolean;
      emailVerifiedAt: string | null;
      requiresVerification: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: string;
    accessToken?: string;
    emailVerificationStatus?: {
      isEmailVerified: boolean;
      emailVerifiedAt: string | null;
      requiresVerification: boolean;
    };
  }
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  firstName: string;
  middleName?: string;
  surname: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: {
      _id: string;
      name: string;
      email: string;
      role: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
      profileImage?: string;
    };
    token: string;
  };
  error?: string;
  message?: string;
}
