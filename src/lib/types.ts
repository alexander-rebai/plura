import { Prisma } from "@prisma/client";
import { getAuthUserDetails, getUserPermissions } from "./actions";

export type UserWithPermissionsWithSubAccounts = Prisma.PromiseReturnType<
  typeof getUserPermissions
>;

export type AuthUserWithAgencySidebarOptionsWithSubAccounts =
  Prisma.PromiseReturnType<typeof getAuthUserDetails>;
