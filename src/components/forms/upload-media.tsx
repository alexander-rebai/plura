"use client";

import { createMedia, saveActivityLogsNotification } from "@/lib/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import FileUpload from "../global/file-upload";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";

type Props = {
  subaccountId: string;
};

const formschema = z.object({
  link: z.string().min(1, { message: "Media File is required" }),
  name: z.string().min(1, { message: "Name is required" }),
});

const UploadMediaForm = ({ subaccountId }: Props) => {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formschema>>({
    resolver: zodResolver(formschema),
    mode: "onSubmit",
    defaultValues: {
      link: "",
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formschema>) => {
    try {
      const response = await createMedia({
        subaccountId,
        media: values,
      });

      await saveActivityLogsNotification({
        description: `Uploaded media file | ${response.name}`,
        subaccountId,
      });

      toast({
        title: "Success",
        description: "Media file uploaded successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to upload media file",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Media Information</CardTitle>
        <CardDescription>
          Please enter the details for your file
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1 mb-4">
                  <FormLabel>File Name</FormLabel>
                  <FormControl>
                    <Input placeholder="File name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Media File</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="subaccountLogo"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="mt-4 w-full">
              Upload
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UploadMediaForm;
