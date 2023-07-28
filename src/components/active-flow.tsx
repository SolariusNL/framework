import { Flow, Flows } from "@/stores/useFlow";
import { Modal } from "@mantine/core";
import { useRouter } from "next/router";

const ActiveFlow = () => {
  const router = useRouter();

  return (
    <Modal
      title={Flows[router.query.flow as Flow].title}
      opened={!!router.query.flow}
      onClose={() => {
        router.push(router.pathname, router.asPath.split("?")[0], {
          shallow: true,
        });
      }}
    >
      {Flows[router.query.flow as Flow].component}
    </Modal>
  );
};

export default ActiveFlow;
