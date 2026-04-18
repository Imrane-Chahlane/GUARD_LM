import { Role } from "@prisma/client";
import { jwtVerify, SignJWT } from "jose";

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  companyName: string;
  role: Role;
};

function getSecretKey() {
  const secret = process.env.JWT_SECRET || "development-secret-change-me-guard-lm";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({
    email: payload.email,
    name: payload.name,
    companyName: payload.companyName,
    role: payload.role
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());

    if (!payload.sub || typeof payload.email !== "string") {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : "",
      companyName: typeof payload.companyName === "string" ? payload.companyName : "",
      role: payload.role === Role.ADMIN ? Role.ADMIN : Role.CLIENT
    };
  } catch {
    return null;
  }
}
