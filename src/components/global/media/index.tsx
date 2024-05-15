import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { MediaFiles } from "@/lib/types";
import { FolderSearch } from "lucide-react";
import MediaCard from "./media-card";
import MediaUploadButton from "./upload-button";

type Props = {
  data: MediaFiles;
  subaccountId: string;
};

const MediaComponent = ({ data, subaccountId }: Props) => {
  return (
    <div className="flex flex-col gap-4 h-full w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl">Media Bucket</h1>
        <MediaUploadButton subaccountId={subaccountId} />
      </div>
      <Command className="bg-transparant">
        <CommandInput placeholder="Search for file name..." />
        <CommandGroup heading="Media Files">
          <CommandList>
            {!!data.length && (
              <CommandEmpty>No Media Files Found.</CommandEmpty>
            )}
            <div className="flex flex-wrap gap-4 pt-4">
              {data.map((file) => (
                <CommandItem
                  key={file.id}
                  className="p-0 max-w-[300px] w-full rounded-lg !bg-transparant !font-medium !text-white"
                >
                  <MediaCard file={file} />
                </CommandItem>
              ))}
            </div>
          </CommandList>
        </CommandGroup>
        {!data.length && (
          <div className="flex items-center justify-center w-full flex-col">
            <FolderSearch
              size={200}
              className="dark:text-muted text-slate-300"
            />
            <p className="text-muted-foreground">
              Empty! No files found in the media bucket.
            </p>
          </div>
        )}
      </Command>
    </div>
  );
};

export default MediaComponent;
