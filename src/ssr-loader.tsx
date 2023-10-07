import LoadingIndicator from "@/components/loading-indicator";
import ShadedCard from "@/components/shaded-card";

const SSRLoader = (
  <ShadedCard className="flex justify-center items-center py-8">
    <LoadingIndicator />
  </ShadedCard>
);

export default SSRLoader;
