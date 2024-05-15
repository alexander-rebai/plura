import BlurPage from "@/components/global/blur-page";
import InfoBar, { NotificationWithUser } from "@/components/global/info-bar";
import Sidebar from "@/components/sidebar/sidebar";
import {
  getNotificationAndUser,
  verifyAndAcceptInvitation,
} from "@/lib/actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  children: React.ReactNode;
  params: {
    agencyId: string;
  };
};

const Layout = async ({ children, params }: Props) => {
  const agencyId = await verifyAndAcceptInvitation();
  const user = await currentUser();

  if (!user || !agencyId) redirect("/");

  if (
    user.privateMetadata.role !== "AGENCY_OWNER" &&
    user.privateMetadata.role !== "AGENCY_ADMIN"
  )
    redirect("/agency/unauthorized");

  let allNotifications: NotificationWithUser[] = [];
  const notifications = await getNotificationAndUser(agencyId);

  if (notifications) allNotifications = notifications;

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar type="agency" id={params.agencyId} />
      <div className="md:pl-[300px]">
        <InfoBar notifications={allNotifications} />
        <div className="relative">
          <BlurPage>{children}</BlurPage>
        </div>
      </div>
    </div>
  );
};

export default Layout;
