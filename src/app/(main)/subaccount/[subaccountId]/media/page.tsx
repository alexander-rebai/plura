import MediaComponent from "@/components/global/media/index";
import { getMedia } from "@/lib/actions";

type Props = {
  params: {
    subaccountId: string;
  };
};

const MediaPage = async ({ params }: Props) => {
  const data = await getMedia(params.subaccountId);

  return (
    <MediaComponent
      data={data}
      subaccountId={params.subaccountId}
    ></MediaComponent>
  );
};

export default MediaPage;
