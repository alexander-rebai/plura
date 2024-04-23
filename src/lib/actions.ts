"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { Agency, Plan, User } from "@prisma/client";
import { redirect } from "next/navigation";
import { db } from "./db";

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
          SidebarOption: true,
          SubAccount: {
            include: {
              SidebarOption: true,
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
          SubAccount: {
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

export const verifyAcceptInvitation = async () => {
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
      SidebarOption: {
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
