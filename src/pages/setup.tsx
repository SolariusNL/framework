import LoadingIndicator from "@/components/loading-indicator";
import DatabaseStep from "@/components/setup/database";
import OuterUI from "@/layouts/OuterUI";
import { setStep } from "@/reducers/setup";
import { RootState } from "@/reducers/store";
import IResponseBase from "@/types/api/IResponseBase";
import fetchJson from "@/util/fetch";
import prisma from "@/util/prisma";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
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

const steps = {
  0: WelcomeStep,
  1: DatabaseStep,
};

const Setup: FC = () => {
  const setup = useSelector((state: RootState) => state.setup);
  const dispatch = useDispatch();

  const fetchStep = async () => {
    await fetchJson<IResponseBase<{ step: number }>>("/api/setup/step", {
      method: "GET",
    }).then((res) => {
      if (res.success && res.data) {
        dispatch(setStep(res.data.step));
      }
    });
  };
  const getStep = () => {
    if (setup.active in steps) {
      const Step = steps[setup.active as keyof typeof steps];
      return <Step />;
    }
    return <StepLoader />;
  };

  useEffect(() => {
    fetchStep();
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
