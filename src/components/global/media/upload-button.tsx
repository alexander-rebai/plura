"use client";

import UploadMediaForm from "@/components/forms/upload-media";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import CustomModal from "../custom-modal";

type Props = {
  subaccountId: string;
};

const MediaUploadButton = ({ subaccountId }: Props) => {
  const { isOpen, setOpen, setClose } = useModal();

  return (
    <Button
      onClick={() => {
        setOpen(
          <CustomModal
            title="Upload media"
            subheading="Upload a file to your media bucket"
          >
            <UploadMediaForm subaccountId={subaccountId} />
          </CustomModal>
        );
      }}
    >
      Upload
    </Button>
  );
};

export default MediaUploadButton;
