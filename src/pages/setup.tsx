import LoadingIndicator from "@/components/loading-indicator";
import OuterUI from "@/layouts/OuterUI";
import { fetchStep } from "@/reducers/setup";
import { AppDispatch, RootState } from "@/reducers/store";
import prisma from "@/util/prisma";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { FC, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const StepLoader = () => (
  <div className="py-8 flex items-center justify-center">
    <LoadingIndicator />
  </div>
);

const WelcomeStep = dynamic(() => import("@/components/setup/welcome"), {
  ssr: false,
  loading: StepLoader,
});
const DatabaseStep = dynamic(() => import("@/components/setup/database"), {
  ssr: false,
  loading: StepLoader,
});
const SettingUpDatabaseStep = dynamic(
  () => import("@/components/setup/setting-up-database"),
  {
    ssr: false,
    loading: StepLoader,
  }
);
const AdminAccountStep = dynamic(() => import("@/components/setup/admin"), {
  ssr: false,
  loading: StepLoader,
});

const steps = {
  0: WelcomeStep,
  1: DatabaseStep,
  2: SettingUpDatabaseStep,
  3: AdminAccountStep,
};

const Setup: FC = () => {
  const setup = useSelector((state: RootState) => state.setup);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const getStep = () => {
    if (setup.active in steps) {
      const Step = steps[setup.active as keyof typeof steps];
      return <Step />;
    }
    return <StepLoader />;
  };

  useEffect(() => {
    dispatch(fetchStep());
    if (setup.active >= 5) {
      router.reload();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchStep());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <OuterUI
      title="Framework Setup"
      description="Congratulations! You've successfully installed Framework on your server. Now, let's get started."
    >
      {getStep()}
    </OuterUI>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const setup = await prisma.appConfig.findUnique({
    where: {
      id: "did-setup",
    },
  });

  if (setup && setup.value === "true") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default Setup;
