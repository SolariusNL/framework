import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { Game } from "../../util/prisma-types";
import GameCard from "../GameCard";
import LoadingIndicator from "../LoadingIndicator";
import ModernEmptyState from "../ModernEmptyState";
import ShadedCard from "../ShadedCard";
import { Section } from "./FriendsWidget";

const SubscriptionWidget: React.FC = () => {
  const [games, setGames] = useState<
    Array<
      Game & {
        _count: {
          likedBy: number;
          dislikedBy: number;
        };
      }
    >
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendedGames = async () => {
    setLoading(true);
    await fetch("/api/dashboard/recommended/games", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((data) => setGames(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecommendedGames();
  }, []);

  return (
    <>
      <Section title="Recommended games" description="Games you might like." />
      <ShadedCard>
        <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-4 gap-y-8">
          {loading ? (
            <ShadedCard className="col-span-full flex items-center justify-center py-8">
              <LoadingIndicator />
            </ShadedCard>
          ) : (
            <>
              {games.map((game, i) => (
                <GameCard game={game} key={game.id} />
              ))}
              {games.length == 0 && (
                <ShadedCard className="col-span-full flex items-center justify-center">
                  <ModernEmptyState
                    title="No games"
                    body="Nothing to see here yet."
                  />
                </ShadedCard>
              )}
            </>
          )}
        </div>
      </ShadedCard>
    </>
  );
};

export default SubscriptionWidget;
