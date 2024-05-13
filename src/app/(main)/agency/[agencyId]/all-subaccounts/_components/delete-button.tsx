"use client";

import {
  deleteSubAccount,
  getSubaccountDetails,
  saveActivityLogsNotification,
} from "@/lib/actions";
import { useRouter } from "next/navigation";

type Props = {
  subaccountId: string;
};

const DeleteButton = ({ subaccountId }: Props) => {
  const router = useRouter();

  const handleDelete = async () => {
    const response = await getSubaccountDetails(subaccountId);

    if (!response) return;

    await saveActivityLogsNotification({
      subaccountId,
      description: `Subaccount ${response.name} has been deleted.`,
    });

    await deleteSubAccount(subaccountId);
  };

  return <div onClick={handleDelete}>DeleteButton</div>;
};

export default DeleteButton;
