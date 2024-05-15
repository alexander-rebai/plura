import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { CheckCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  params: {
    subaccountId: string;
  };
  searchParams: {
    state: string;
    code: string;
  };
};

const Launchpad = async ({ params, searchParams }: Props) => {
  const subaccountDetails = await db.subAccount.findUnique({
    where: {
      id: params.subaccountId,
    },
  });

  if (!subaccountDetails) return null;

  const allDetailsExist =
    subaccountDetails?.address &&
    subaccountDetails.name &&
    subaccountDetails.companyEmail &&
    subaccountDetails.subAccountLogo &&
    subaccountDetails.city &&
    subaccountDetails.country &&
    subaccountDetails.zipCode &&
    subaccountDetails.state &&
    subaccountDetails.companyPhone;

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="w-full h-full max-w-[800px]">
        <Card className="border-none ">
          <CardHeader>
            <CardTitle>Lets get started!</CardTitle>
            <CardDescription>
              Follow the steps below to get your account setup correctly.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex justify-between items-center w-full h-20 border p-4 rounded-lg ">
              <div className="flex items-center gap-4">
                <Image
                  src="/appstore.png"
                  alt="App logo"
                  height={80}
                  width={80}
                  className="rounded-md object-contain"
                />
                <p>Save the website as a shortcut on your mobile devide</p>
              </div>
              <Button>Start</Button>
            </div>
            <div className="flex justify-between items-center w-full h-20 border p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <Image
                  src="/stripelogo.png"
                  alt="App logo"
                  height={80}
                  width={80}
                  className="rounded-md object-contain "
                />
                <p>
                  Connect your stripe account to accept payments. Stripe is used
                  to run payouts.
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center w-full h-20 border p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <Image
                  src={subaccountDetails.subAccountLogo}
                  alt="App logo"
                  height={80}
                  width={80}
                  className="rounded-md object-contain p-4"
                />
                <p>Fill in all your business details.</p>
              </div>
              {allDetailsExist ? (
                <CheckCircleIcon
                  size={50}
                  className=" text-primary p-2 flex-shrink-0"
                />
              ) : (
                <Link
                  className="bg-primary py-2 px-4 rounded-md text-white"
                  href={`/subaccount/${subaccountDetails.id}/settings`}
                >
                  Start
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Launchpad;