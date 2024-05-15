import { Prisma } from "@prisma/client";
import { getAuthUserDetails, getMedia, getUserPermissions } from "./actions";

export type UserWithPermissionsWithSubAccounts = Prisma.PromiseReturnType<
  typeof getUserPermissions
>;

export type AuthUserWithAgencySidebarOptionsWithSubAccounts =
  Prisma.PromiseReturnType<typeof getAuthUserDetails>;

export type UsersWithAgencyAndSubAccountPermissionsSidebarOptions =
  Prisma.UserGetPayload<{
    include: {
      Agency: {
        include: {
          SubAccounts: true;
        };
      };
      Permissions: {
        include: {
          SubAccount: true;
        };
      };
    };
  }>;

export type MediaFiles = Prisma.PromiseReturnType<typeof getMedia>;

export type MediaCreateType = Prisma.MediaCreateWithoutSubaccountInput;
