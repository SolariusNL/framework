import { Anchor, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";

export const Links = {
  externalWarning(href: string) {
    openConfirmModal({
      title: "Confirm link",
      children: (
        <>
          <div className="flex justify-center flex-col gap-2 text-center">
            <Text size="sm" color="dimmed">
              Are you sure you want to visit this link?
            </Text>
            <Anchor href={href} target="_blank">
              {href}
            </Anchor>
          </div>
        </>
      ),
      labels: { cancel: "Cancel", confirm: "Open link" },
      onConfirm: () => {
        window.open(href, "_blank");
      },
    });
  },
};
