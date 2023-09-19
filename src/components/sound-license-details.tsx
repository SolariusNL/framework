import DataGrid from "@/components/data-grid";
import InlineError from "@/components/inline-error";
import {
  GetSoundLicenseHolderResponse,
  LicenseHolderDetails,
} from "@/pages/api/sounds/[[...params]]";
import { fetchAndSetData } from "@/util/fetch";
import { useState } from "react";
import { HiOutlineGlobe, HiOutlineTag } from "react-icons/hi";

type SoundLicenseDetailsProps = {
  licensee: string;
};

const SoundLicenseDetails: React.FC<SoundLicenseDetailsProps> = ({
  licensee,
}) => {
  const [licenseHolder, setLicenseHolder] = useState<LicenseHolderDetails>();
  const fetchAudioDetails = async () => {
    console.log("SHIT");
    await Promise.all([
      fetchAndSetData<GetSoundLicenseHolderResponse>(
        `/api/sounds/licenses/holders/${licensee}`,
        (data) => setLicenseHolder(data?.licenseHolder!)
      ),
    ]);
  };

  fetchAudioDetails();

  return (
    <div className="mt-4">
      <InlineError variant="info" title="Licensed content">
        This sound is subject to a licensing agreement, and its availability on
        Framework is contingent upon the discretion of the duly authorized
        license holder.
      </InlineError>
      <DataGrid
        defaultCols={1}
        mdCols={1}
        smCols={1}
        items={[
          {
            tooltip: "License holder",
            value: licenseHolder?.name,
            hoverTip: "The name of the license holder",
            icon: <HiOutlineTag />,
          },
          {
            tooltip: "Location",
            value: licenseHolder?.location,
            hoverTip: "The location of the license holder",
            icon: <HiOutlineGlobe />,
          },
          {
            tooltip: "Licensee ID",
            value: licenseHolder?.id,
            hoverTip: "The ID of the license holder",
            icon: <HiOutlineTag />,
          },
        ]}
      />
    </div>
  );
};

export default SoundLicenseDetails;
