import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { useAsync } from "react-use";
import { ReactComponent as SSD } from "../assets/ssd.svg";
import { get_disks } from "../utils/tauri";

const Home: FC = () => {
  const navigate = useNavigate();
  const disks = useAsync(async () => await get_disks(), []);

  return (
    <div className="flex flex-row gap-8">
      {disks.value
        ?.filter((disk) => disk.mount_point !== "/")
        .map((disk, idx) => (
          <button
            key={idx}
            onClick={() =>
              navigate(`/disk/${disk.name.replaceAll(" ", "_").toLowerCase()}` + disk.mount_point, {
                state: { path: disk.mount_point },
              })
            }
            className="flex flex-row items-center text-sm hover:bg-gray-100 p-2 rounded-md gap-1"
          >
            <SSD className="w-12 h-12" />
            <div className="text-right">
              <p>{disk.name}</p>
              <p>{disk.available_space + "/" + disk.total_space}GB</p>
            </div>
          </button>
        ))}
    </div>
  );
};

export default Home;
