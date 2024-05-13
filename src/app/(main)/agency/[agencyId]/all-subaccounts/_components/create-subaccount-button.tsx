"use client";

import SubAccountDetails from "@/components/forms/subaccount-details";
import CustomModal from "@/components/global/custom-modal";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { cn } from "@/lib/utils";
import { Agency, AgencySidebarOption, SubAccount, User } from "@prisma/client";
import { PlusCircleIcon } from "lucide-react";

type Props = {
  user: User & {
    Agency:
      | Agency
      | (null & {
          SubAccount: SubAccount[];
          SidebarOption: AgencySidebarOption[];
        })
      | null;
  };
  classname?: string;
};

const CreateSubaccountButton = ({ user, classname }: Props) => {
  const { setOpen } = useModal();

  const agencyDetails = user.Agency;

  if (!agencyDetails) return;

  return (
    <Button
      className={cn("w-full flex gap-4", classname)}
      onClick={() => {
        setOpen(
          <CustomModal
            title="Create a subaccount"
            subheading="You can switch between subaccounts to manage different clients."
          >
            <SubAccountDetails
              agencyDetails={agencyDetails}
              userId={user.id}
              userName={user.name}
            />
          </CustomModal>
        );
      }}
    >
      <PlusCircleIcon size={15} />
      Create Subaccount
    </Button>
  );
};

export default CreateSubaccountButton;
