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
    agencyId: string;
  };
  searchParams: {
    code: string;
  };
};

const LaunchpadPage = async ({ params, searchParams }: Props) => {
  const agencyDetails = await db.agency.findUnique({
    where: {
      id: params.agencyId,
    },
  });

  if (!agencyDetails) return;

  const allDetailsExist =
    agencyDetails?.address &&
    agencyDetails.name &&
    agencyDetails.companyEmail &&
    agencyDetails.agencyLogo &&
    agencyDetails.city &&
    agencyDetails.country &&
    agencyDetails.zipCode &&
    agencyDetails.state &&
    agencyDetails.companyPhone;

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="w-full h-full max-w-[800px]">
        <Card className="border-none">
          <CardHeader>
            <CardTitle>Let&apos;s get started</CardTitle>
            <CardDescription>
              Follow the steps below to get your account setup.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex justify-between items-center w-full border p-4 rounded-lg gap-2">
              <div className="flex md:items-center gap-4 flex-col md:!flex-row">
                <Image
                  src="/appstore.png"
                  alt="App Store"
                  width={80}
                  height={80}
                  className="rounded-lg object-contain"
                />
                <p>Save the website as a shortcut on your mobile device.</p>
              </div>
              <Button>Create Shortcut</Button>
            </div>
            <div className="flex justify-between items-center w-full border p-4 rounded-lg gap-2">
              <div className="flex md:items-center gap-4 flex-col md:!flex-row">
                <Image
                  src="/stripelogo.png"
                  alt="Stripe logo"
                  width={80}
                  height={80}
                  className="rounded-lg object-contain"
                />
                <p>
                  Connect your stripe account to accept payments and see your
                  dashboard.
                </p>
              </div>
              <Button>Start</Button>
            </div>
            <div className="flex justify-between items-center w-full border p-4 rounded-lg gap-2">
              <div className="flex md:items-center gap-4 flex-col md:!flex-row">
                <Image
                  src={agencyDetails.agencyLogo}
                  alt="Agency logo"
                  width={80}
                  height={80}
                  className="rounded-lg"
                />
                <p>Fill in all the missing information for your business.</p>
              </div>
              {allDetailsExist ? (
                <CheckCircleIcon
                  size={40}
                  className="text-primary p-2 flex-shrink-0"
                />
              ) : (
                <Link
                  href={`/agency/${params.agencyId}`}
                  className="bg-primary py-2 px-4 rounded-md text-white"
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

export default LaunchpadPage;
