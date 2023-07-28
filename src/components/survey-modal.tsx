import Descriptive from "@/components/descriptive";
import Rating from "@/components/rating";
import Stateful from "@/components/stateful";
import useFeedback from "@/stores/useFeedback";
import { Button, Modal, Text, Textarea } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import { FC, useState } from "react";
import { HiArrowRight, HiCheckCircle } from "react-icons/hi";

const SurveyModal: FC = () => {
  const { opened: ratingModal, setOpened: setRatingModal } = useFeedback();
  const [loading, setLoading] = useState(false);

  const submitRating = async (stars: number, feedback: string = "") => {
    setLoading(true);
    await fetch("/api/users/@me/survey/" + stars, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({ feedback }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          if (stars !== 0) {
            showNotification({
              title: "Thank you",
              message:
                "Thank you for your feedback, we sincerely value your opinion and will use it to improve our platform.",
              icon: <HiCheckCircle />,
            });
          }
        }

        setRatingModal(false);
        setLoading(false);
      });
  };

  return (
    <Modal
      title="Experience survey"
      opened={ratingModal}
      onClose={() => setRatingModal(false)}
    >
      <Text size="sm" color="dimmed" mb="md">
        We would love to hear your feedback about Framework. Please, take a
        minute to fill out this survey, and be brutally honest with your
        answers. Your feedback will help us improve Framework.
      </Text>
      <Stateful
        initialState={{
          rating: 0,
          feedback: "",
        }}
      >
        {(data, setState) => (
          <>
            <Descriptive
              required
              title="Star rating"
              description="How would you rate your experience with Framework?"
            >
              <Rating
                value={data.rating}
                setValue={(rating) =>
                  setState({
                    ...data,
                    rating,
                  })
                }
              />
            </Descriptive>
            <Textarea
              label="Feedback"
              placeholder="What do you like about Framework? What could we improve?"
              description="Your feedback is completely anonymous and will help us improve Framework."
              mt="md"
              minRows={4}
              value={data.feedback}
              onChange={(event) =>
                setState({
                  ...data,
                  feedback: event.currentTarget.value,
                })
              }
            />
            <div className="flex justify-end mt-6">
              <Button
                leftIcon={<HiArrowRight />}
                onClick={() => {
                  submitRating(data.rating, data.feedback);
                  setRatingModal(false);
                }}
                loading={loading}
                disabled={!data.rating}
              >
                Submit
              </Button>
            </div>
          </>
        )}
      </Stateful>
    </Modal>
  );
};

export default SurveyModal;
