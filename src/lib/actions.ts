"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { createId } from "@paralleldrive/cuid2";
import { Agency, Plan, Role, SubAccount, User } from "@prisma/client";
import { redirect } from "next/navigation";
import { db } from "./db";
import { MediaCreateType } from "./types";

export const getAuthUserDetails = async () => {
  const user = await currentUser();
  if (!user) return;

  const userData = await db.user.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    include: {
      Agency: {
        include: {
          SidebarOptions: true,
          SubAccounts: {
            include: {
              SidebarOptions: true,
            },
          },
        },
      },
      Permissions: true,
    },
  });

  return userData;
};

export const saveActivityLogsNotification = async ({
  description,
  subaccountId,
  agencyId,
}: {
  description: string;
  subaccountId?: string;
  agencyId?: string;
}) => {
  const authUser = await currentUser();

  let userData;

  if (!authUser) {
    const response = await db.user.findFirst({
      where: {
        Agency: {
          SubAccounts: {
            some: { id: subaccountId },
          },
        },
      },
    });

    if (response) userData = response;
  } else {
    userData = await db.user.findUnique({
      where: {
        email: authUser.emailAddresses[0].emailAddress,
      },
    });
  }

  if (!userData) {
    console.error("SERVER ACTION: COULD NOT FIND USER");
    return;
  }

  if (!agencyId) {
    if (!subaccountId)
      throw new Error("NO AGENCY ID OR SUBACCOUNT ID PROVIDED");

    const response = await db.subAccount.findUnique({
      where: {
        id: subaccountId,
      },
    });

    if (response) agencyId = response.agencyId;
  }

  if (subaccountId) {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: agencyId,
          },
        },
        SubAccount: {
          connect: {
            id: subaccountId,
          },
        },
      },
    });
  } else {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: agencyId,
          },
        },
      },
    });
  }
};

const createTeamUser = async ({
  agencyId,
  user,
}: {
  agencyId: string;
  user: User;
}) => {
  if (user.role === "AGENCY_OWNER") return null;

  const response = await db.user.create({
    data: {
      ...user,
    },
  });

  return response;
};

export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser();

  if (!user) redirect("/agency/sign-in");

  const invitation = await db.invitation.findFirst({
    where: {
      email: user.emailAddresses[0].emailAddress,
      status: "PENDING",
    },
  });

  if (!invitation) {
    const agency = await db.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
    });

    return agency?.agencyId || null;
  }

  const userDetails = await createTeamUser({
    agencyId: invitation.agencyId,
    user: {
      email: invitation.email,
      agencyId: invitation.agencyId,
      avatarUrl: user.imageUrl,
      id: user.id,
      name: "${user.firstName} ${user.lastName}",
      role: invitation.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await saveActivityLogsNotification({
    description: "Accepted invitation",
    agencyId: invitation.agencyId,
  });

  if (!userDetails) return null;

  await clerkClient.users.updateUserMetadata(user.id, {
    privateMetadata: {
      role: userDetails.role || "SUBACCOUNT_USER",
    },
  });

  await db.invitation.delete({
    where: {
      email: userDetails.email,
    },
  });

  return userDetails.agencyId;
};

export const updateAgencyDetails = async ({
  agencyId,
  agencyDetails,
}: {
  agencyId: string;
  agencyDetails: Partial<Agency>;
}) => {
  const response = await db.agency.update({
    where: {
      id: agencyId,
    },
    data: agencyDetails,
  });

  return response;
};

export const deleteAgency = async (agencyId: string) => {
  const response = await db.agency.delete({
    where: {
      id: agencyId,
    },
  });

  return response;
};

export const initUser = async (newUser: Partial<User>) => {
  const user = await currentUser();

  if (!user) return;

  const createdUser = await db.user.upsert({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    update: newUser,
    create: {
      id: user.id,
      avatarUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
      name: "${user.firstName} ${user.lastName}",
      role: newUser.role || "SUBACCOUNT_USER",
    },
  });

  await clerkClient.users.updateUserMetadata(user.id, {
    privateMetadata: {
      role: newUser.role || "SUBACCOUNT_USER",
    },
  });

  return createdUser;
};

export const upsertAgency = async (agency: Agency, price?: Plan) => {
  if (!agency.companyEmail) return null;

  const agencyDetails = await db.agency.upsert({
    where: {
      id: agency.id,
    },
    update: agency,
    create: {
      users: {
        connect: { email: agency.companyEmail },
      },
      ...agency,
      SidebarOptions: {
        create: [
          {
            name: "Dashboard",
            icon: "category",
            link: `/agency/${agency.id}`,
          },
          {
            name: "Launchpad",
            icon: "clipboardIcon",
            link: `/agency/${agency.id}/launchpad`,
          },
          {
            name: "Billing",
            icon: "payment",
            link: `/agency/${agency.id}/billing`,
          },
          {
            name: "Settings",
            icon: "settings",
            link: `/agency/${agency.id}/settings`,
          },
          {
            name: "Sub Accounts",
            icon: "person",
            link: `/agency/${agency.id}/all-subaccounts`,
          },
          {
            name: "Team",
            icon: "shield",
            link: `/agency/${agency.id}/team`,
          },
        ],
      },
    },
  });

  return agencyDetails;
};

export const upsertSubAccount = async (subAccount: SubAccount) => {
  if (!subAccount.companyEmail) return null;

  const agencyOwner = await db.user.findFirst({
    where: {
      Agency: {
        id: subAccount.agencyId,
      },
      role: "AGENCY_OWNER",
    },
  });

  if (!agencyOwner) return console.error("Could not create subaccount.");

  const permissionId = createId();

  const response = await db.subAccount.upsert({
    where: { id: subAccount.id },
    update: subAccount,
    create: {
      ...subAccount,
      Permissions: {
        create: {
          access: true,
          email: agencyOwner.email,
          id: permissionId,
        },
        connect: {
          subAccountId: subAccount.id,
          id: permissionId,
        },
      },
      Pipelines: {
        create: { name: "Lead Cycle" },
      },
      SidebarOptions: {
        create: [
          {
            name: "Launchpad",
            icon: "clipboardIcon",
            link: `/subaccount/${subAccount.id}/launchpad`,
          },
          {
            name: "Settings",
            icon: "settings",
            link: `/subaccount/${subAccount.id}/settings`,
          },
          {
            name: "Funnels",
            icon: "pipelines",
            link: `/subaccount/${subAccount.id}/funnels`,
          },
          {
            name: "Media",
            icon: "database",
            link: `/subaccount/${subAccount.id}/media`,
          },
          {
            name: "Automations",
            icon: "chip",
            link: `/subaccount/${subAccount.id}/automations`,
          },
          {
            name: "Pipelines",
            icon: "flag",
            link: `/subaccount/${subAccount.id}/pipelines`,
          },
          {
            name: "Contacts",
            icon: "person",
            link: `/subaccount/${subAccount.id}/contacts`,
          },
          {
            name: "Dashboard",
            icon: "category",
            link: `/subaccount/${subAccount.id}`,
          },
        ],
      },
    },
  });

  return response;
};

export const getNotificationAndUser = async (agencyId: string) => {
  const response = await db.notification.findMany({
    where: {
      agencyId,
    },
    include: {
      User: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return response;
};

export const getUserPermissions = async (userId: string) => {
  const response = await db.user.findUnique({
    where: { id: userId },
    select: { Permissions: { include: { SubAccount: true } } },
  });

  return response;
};

export const updateUser = async (user: Partial<User>) => {
  const response = await db.user.update({
    where: {
      email: user.email,
    },
    data: {
      ...user,
    },
  });

  await clerkClient.users.updateUserMetadata(response.id, {
    privateMetadata: {
      role: user.role || "SUBACCOUNT_USER",
    },
  });

  return response;
};

export const changeUserPermissions = async ({
  permissionId,
  userEmail,
  subAccountId,
  value,
}: {
  permissionId?: string;
  userEmail: string;
  subAccountId: string;
  value: boolean;
}) => {
  try {
    const response = await db.permission.upsert({
      where: {
        id: permissionId,
      },
      update: {
        access: value,
      },
      create: {
        access: value,
        email: userEmail,
        subAccountId,
      },
    });

    return response;
  } catch (error) {
    console.error(error);
  }
};

export const getSubaccountDetails = async (subaccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
  });

  return response;
};

export const deleteSubAccount = async (subaccountId: string) => {
  const response = await db.subAccount.delete({
    where: {
      id: subaccountId,
    },
  });

  return response;
};

export const deleteUser = async (userId: string) => {
  const response = await db.user.delete({
    where: {
      id: userId,
    },
  });

  return response;
};

export const getUser = async (userId: string) => {
  const response = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  return response;
};

export const sendInvitation = async (
  role: Role,
  email: string,
  agencyId: string
) => {
  const response = await db.invitation.create({
    data: {
      email,
      agencyId,
      role,
    },
  });

  try {
    await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: process.env.NEXT_PUBLIC_URL,
      publicMetadata: {
        throughInvitation: true,
        role,
      },
    });
  } catch (error) {
    console.error(error);
    throw new Error("Could not send invitation");
  }

  return response;
};

export const getMedia = async (subaccountId: string) => {
  const response = await db.media.findMany({
    where: {
      subAccountId: subaccountId,
    },
  });

  return response;
};

export const createMedia = async ({
  subaccountId,
  media,
}: {
  subaccountId: string;
  media: MediaCreateType;
}) => {
  const response = await db.media.create({
    data: {
      link: media.link,
      name: media.name,
      subAccountId: subaccountId,
    },
  });

  return response;
};

export const deleteMedia = async (mediaId: string) => {
  const response = await db.media.delete({
    where: {
      id: mediaId,
    },
  });

  return response;
};
