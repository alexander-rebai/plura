import SendInvitation from "@/components/forms/send-invitation";
import { getAuthUserDetails } from "@/lib/actions";
import { db } from "@/lib/db";
import { Plus } from "lucide-react";
import { columns } from "./_components/columns";
import DataTable from "./_components/data-table";

type Props = {
  params: {
    agencyId: string;
  };
};

const TeamPage = async ({ params }: Props) => {
  const authUser = await getAuthUserDetails();

  if (!authUser) return null;

  const teamMembers = await db.user.findMany({
    where: {
      agencyId: params.agencyId,
    },
    include: {
      Agency: { include: { SubAccounts: true } },
      Permissions: { include: { SubAccount: true } },
    },
  });

  const agencyDetails = await db.agency.findUnique({
    where: {
      id: params.agencyId,
    },
    include: {
      SubAccounts: true,
    },
  });

  if (!agencyDetails) return null;

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Add
        </>
      }
      modalChildren={<SendInvitation agencyId={params.agencyId} />}
      filterValue="name"
      columns={columns}
      data={teamMembers}
    />
  );
};

export default TeamPage;
