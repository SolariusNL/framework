import ModernEmptyState from "@/components/modern-empty-state";
import ViewGameTab from "@/components/view-game/view-game";
import { useFrameworkUser } from "@/contexts/FrameworkUser";
import { GetGameGamepassesResponse } from "@/pages/api/experiences/[[...params]]";
import { fetchAndSetData } from "@/util/fetch";
import { Game } from "@/util/prisma-types";
import { AssetFrontend } from "@/util/types";
import { useEffect, useState } from "react";
import AssetCard from "../asset-card";

interface StoreProps {
  game: Game;
}

const Store: React.FC<StoreProps> = ({ game }) => {
  const user = useFrameworkUser()!;
  const [gamepasses, setGamepasses] = useState<AssetFrontend[]>([]);

  const fetchData = async () => {
    await Promise.all([
      fetchAndSetData<GetGameGamepassesResponse>(
        `/api/experiences/${game.id}/gamepasses`,
        (data) => setGamepasses(data?.gamepasses!)
      ),
    ]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ViewGameTab
      value="store"
      title="Store"
      description="Purchase gamepasses to unlock new features in the game."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 sm:grid-cols-3 gap-4 gap-y-8">
        {gamepasses.length === 0 ? (
          <div className="col-span-full">
            <ModernEmptyState
              title="No gamepasses"
              body="This game has no gamepasses."
            />
          </div>
        ) : (
          gamepasses.map((gamepass) => (
            <AssetCard key={gamepass.id} asset={gamepass} type="gamepass" />
          ))
        )}
      </div>
    </ViewGameTab>
  );
};

export default Store;
