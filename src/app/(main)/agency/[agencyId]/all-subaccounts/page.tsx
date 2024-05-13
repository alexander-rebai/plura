import { AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getAuthUserDetails } from "@/lib/actions";
import Image from "next/image";
import Link from "next/link";
import CreateSubaccountButton from "./_components/create-subaccount-button";
import DeleteButton from "./_components/delete-button";

type Props = {
  params: {
    agencyId: string;
  };
};

const AllSubaccountsPage = async ({ params }: Props) => {
  const user = await getAuthUserDetails();

  if (!user) return;

  return (
    <AlertDialog>
      <div className="flex flex-col">
        <CreateSubaccountButton
          user={user}
          classname="w-[200px] self-end m-6"
        />
        <Command className="rounded-lg bg-transparent">
          <CommandInput placeholder="Search Account..." />
          <CommandList>
            {!!user.Agency?.SubAccounts.length && (
              <CommandEmpty>No subaccounts found.</CommandEmpty>
            )}
            <CommandGroup heading="Sub Accounts">
              {!!user.Agency?.SubAccounts.length ? (
                user.Agency.SubAccounts.map((subaccount) => (
                  <CommandItem
                    key={subaccount.id}
                    className="h-32 !bg-background my-2 text-primary border-[1px] border-border p-4 rounded-lg hover:!bg-background cursor-pointer transition-all"
                  >
                    <Link
                      href={`/subaccount/${subaccount.id}`}
                      className="flex gap-4 w-full h-full"
                    >
                      <div className="relative w-32">
                        <Image
                          src={subaccount.subAccountLogo}
                          alt="Sub Account Logo"
                          fill
                          className="rounded-md object-contain bg-muted/50 p-4"
                        />
                      </div>
                      <div className="flex flex-col justify-between">
                        <div className="flex flex-col">
                          {subaccount.name}
                          <span className="text-muted-foreground text-xs">
                            {subaccount.address}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <AlertDialogTrigger>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-red-500 w-20 hover:bg-red-600 hover:text-white"
                      >
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-left">
                          Are you sure you want to delete this subaccount?
                        </AlertDialogTitle>
                        <AlertDescription className="text-left">
                          This action cannot be undone. This will permanently
                          delete the subaccount and all its data.
                        </AlertDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex items-center">
                        <AlertDialogCancel className="mb-2">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive">
                          <DeleteButton subaccountId={subaccount.id} />
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </CommandItem>
                ))
              ) : (
                <div className="text-muted-foreground text-center p-4">
                  No Subaccounts.
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </AlertDialog>
  );
};

export default AllSubaccountsPage;
