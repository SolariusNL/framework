import { next } from "@/reducers/setup";
import { Button, Text, Title } from "@mantine/core";
import { FC } from "react";
import { HiArrowSmRight } from "react-icons/hi";
import { useDispatch } from "react-redux";

const WelcomeStep: FC = () => {
  const dispatch = useDispatch();
  return (
    <>
      <Title order={2} mb="sm">
        🎉 Welcome!
      </Title>
      <Text size="sm" color="dimmed">
        Click &quot;Next&quot; to get started with your brand new Framework
        instance.
      </Text>
      <div className="flex justify-end">
        <Button
          mt="xl"
          leftIcon={<HiArrowSmRight />}
          onClick={() => dispatch(next())}
        >
          Next
        </Button>
      </div>
    </>
  );
};

export default WelcomeStep;
