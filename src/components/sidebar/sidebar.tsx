import { getAuthUserDetails } from "@/lib/actions";
import MenuOptions from "./menu-options";

type Props = {
  id: string;
  type: "agency" | "subaccount";
};

const Sidebar = async ({ id, type }: Props) => {
  const user = await getAuthUserDetails();

  if (!user || !user.Agency) return;

  const details =
    type === "agency"
      ? user.Agency
      : user.Agency.SubAccounts.find((subaccount) => subaccount.id === id);

  if (!details) return;

  const isWhiteLabeledAgency = user.Agency.whiteLabel;
  let sideBarLogo = user.Agency.agencyLogo || "/assets/plura-logo.svg";

  if (!isWhiteLabeledAgency) {
    if (type === "subaccount")
      sideBarLogo =
        user.Agency.SubAccounts.find((subaccount) => subaccount.id === id)
          ?.subAccountLogo || user.Agency.agencyLogo;
  }

  const sidebarOptions =
    type === "agency"
      ? user.Agency.SidebarOptions || []
      : user.Agency.SubAccounts.find((subaccount) => subaccount.id === id)
          ?.SidebarOptions || [];

  const subAccounts = user.Agency.SubAccounts.filter((subaccount) =>
    user.Permissions.find(
      (permission) =>
        permission.subAccountId === subaccount.id && permission.access === true
    )
  );

  return (
    <>
      <MenuOptions
        defaultOpen
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOptions={sidebarOptions}
        subAccounts={subAccounts}
        user={user}
      />
      <MenuOptions
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOptions={sidebarOptions}
        subAccounts={subAccounts}
        user={user}
      />
    </>
  );
};

export default Sidebar;
