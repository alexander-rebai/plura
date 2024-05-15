import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/actions";
import { redirect } from "next/navigation";
import Unauthorized from "../agency/unauthorized/page";

type Props = {
  searchParams: {
    state: string;
    code: string;
  };
};

const SubaccountPage = async ({ searchParams }: Props) => {
  const agencyId = await verifyAndAcceptInvitation();

  if (!agencyId) return <Unauthorized />;

  const user = await getAuthUserDetails();

  if (!user) return null;

  const firstSubaccountWithAccess = user.Permissions.find(
    (permission) => permission.access === true
  );

  if (!searchParams.state && !firstSubaccountWithAccess)
    return <Unauthorized />;

  if (searchParams.state) {
    const statePath = searchParams.state.split("___")[0];
    const stateSubaccountId = searchParams.state.split("___")[1];

    if (!stateSubaccountId) return <Unauthorized />;

    return redirect(
      `/subaccount/${stateSubaccountId}/${statePath}?code=${searchParams.code}`
    );
  } else if (firstSubaccountWithAccess) {
    return redirect(`/subaccount/${firstSubaccountWithAccess.subAccountId}`);
  }
};

export default SubaccountPage;
