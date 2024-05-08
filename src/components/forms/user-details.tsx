"use client";

import { useModal } from "@/hooks/use-modal";
import {
  changeUserPermissions,
  getAuthUserDetails,
  getUserPermissions,
  saveActivityLogsNotification,
  updateUser,
} from "@/lib/actions";
import {
  AuthUserWithAgencySidebarOptionsWithSubAccounts,
  UserWithPermissionsWithSubAccounts,
} from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { SubAccount, User } from "@prisma/client";
import { Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import FileUpload from "../global/file-upload";
import Loading from "../global/loading";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { useToast } from "../ui/use-toast";

type Props = {
  id: string | null;
  type: "agency" | "subaccount";
  userData?: Partial<User>;
  subAccounts?: SubAccount[];
};

const userDataSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  avatarUrl: z.string(),
  role: z.enum([
    "AGENCY_OWNER",
    "AGENCY_ADMIN",
    "SUBACCOUNT_USER",
    "SUBACCOUNT_GUEST",
  ]),
});

const UserDetails = ({ id, type, userData, subAccounts }: Props) => {
  const [subAccountPermissions, setSubAccountPermissions] =
    useState<UserWithPermissionsWithSubAccounts>();
  const [roleState, setRoleState] = useState("");
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [authUserData, setAuthUserData] =
    useState<AuthUserWithAgencySidebarOptionsWithSubAccounts>();

  const { data, setClose } = useModal();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!data.user) return;

    const fetchDetails = async () => {
      const response = await getAuthUserDetails();
      if (response) setAuthUserData(response);
    };

    fetchDetails();
  }, [data]);

  useEffect(() => {
    const getPermissions = async () => {
      if (!data.user) return;
      const permissions = await getUserPermissions(data.user.id);
      setSubAccountPermissions(permissions);
    };

    getPermissions();
  }, [data]);

  const form = useForm<z.infer<typeof userDataSchema>>({
    resolver: zodResolver(userDataSchema),
    defaultValues: {
      name: userData?.name || data.user?.name,
      email: userData?.email || data.user?.email,
      avatarUrl: userData?.avatarUrl || data.user?.avatarUrl,
      role: userData?.role || data.user?.role,
    },
  });

  const onChangePermission = async ({
    subAccountId,
    value,
    permissionId,
  }: {
    subAccountId: string;
    value: boolean;
    permissionId?: string;
  }) => {
    if (!data.user?.email) return;

    setLoadingPermissions(true);

    const response = await changeUserPermissions({
      permissionId: permissionId ? permissionId : createId(),
      userEmail: data.user.email,
      subAccountId: subAccountId,
      value,
    });

    if (type === "agency") {
      await saveActivityLogsNotification({
        agencyId: authUserData?.Agency?.id,
        description: `Gave ${data.user.name} access to ${
          subAccountPermissions?.Permissions.find(
            (p) => p.subAccountId === subAccountId
          )?.SubAccount.name
        }`,
        subaccountId: subAccountId,
      });
    }

    if (!response)
      return toast({
        variant: "destructive",
        title: "Failed",
        description: "Could not update permissions",
      });

    toast({
      title: "Success",
      description: "Updated permissions",
    });

    if (subAccountPermissions) {
      setSubAccountPermissions((prevState) => ({
        ...prevState,
        Permissions: prevState!.Permissions.map((permission) => {
          if (permission.subAccountId === subAccountId) {
            return { ...permission, access: value };
          }
          return permission;
        }),
      }));
    }

    setLoadingPermissions(false);
    router.refresh();
  };

  const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
    if (!id) return;
    if (!userData && !data?.user) throw new Error("Error could not submit");

    const updatedUser = await updateUser(values);

    authUserData?.Agency?.SubAccounts.filter((subacc) =>
      authUserData.Permissions.find(
        (p) => p.subAccountId === subacc.id && p.access
      )
    ).forEach(async (subaccount) => {
      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated ${userData?.name} information`,
        subaccountId: subaccount.id,
      });
    });

    if (!updatedUser) {
      toast({
        variant: "destructive",
        title: "Oops!",
        description: "Could not update user information",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Update User Information",
    });

    setClose();
    router.refresh();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Details</CardTitle>
        <CardDescription>Add or update your information</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile picture</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="avatar"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>User full name</FormLabel>
                  <FormControl>
                    <Input required placeholder="Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      readOnly={
                        userData?.role === "AGENCY_OWNER" ||
                        form.formState.isSubmitting
                      }
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>User Role</FormLabel>
                  {field.value === "AGENCY_OWNER" && (
                    <p className="text-muted-foreground flex gap-2">
                      <Info /> As an agency owner, you can&apos;t change your
                      role.
                    </p>
                  )}
                  <Select
                    disabled={field.value === "AGENCY_OWNER"}
                    onValueChange={(value) => {
                      if (
                        value === "SUBACCOUNT_USER" ||
                        value === "SUBACCOUNT_GUEST"
                      ) {
                        setRoleState(
                          "You need to have subaccounts to assign Subaccount access to team members."
                        );
                      } else {
                        setRoleState("");
                      }
                      field.onChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user role..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AGENCY_ADMING">
                        Agency Admin
                      </SelectItem>
                      {(data?.user?.role === "AGENCY_OWNER" ||
                        userData?.role === "AGENCY_OWNER") && (
                        <SelectItem value="AGENCY_OWNER">
                          Agency Owner
                        </SelectItem>
                      )}
                      <SelectItem value="SUBACCOUNT_USER">
                        Sub Account User
                      </SelectItem>
                      <SelectItem value="SUBACCOUNT_GUEST">
                        Sub Account Guest
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground">{roleState}</p>
                </FormItem>
              )}
            />

            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? <Loading /> : "Save User Details"}
            </Button>
            {authUserData?.role === "AGENCY_OWNER" && (
              <div>
                <Separator className="my-4" />
                <FormLabel> User Permissions</FormLabel>
                <FormDescription className="mb-4">
                  You can give Sub Account access to team members by turning on
                  access control for each Sub Account. This is only visible to
                  agency owners
                </FormDescription>
                <div className="flex flex-col gap-4">
                  {subAccounts?.map((subAccount) => {
                    const subAccountPermissionsDetails =
                      subAccountPermissions?.Permissions.find(
                        (p) => p.subAccountId === subAccount.id
                      );
                    return (
                      <div
                        key={subAccount.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p>{subAccount.name}</p>
                        </div>
                        <Switch
                          disabled={loadingPermissions}
                          checked={subAccountPermissionsDetails?.access}
                          onCheckedChange={(permission) => {
                            onChangePermission({
                              subAccountId: subAccount.id,
                              value: permission,
                              permissionId: subAccountPermissionsDetails?.id,
                            });
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UserDetails;
