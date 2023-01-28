import { Button, FileButton, Modal } from "@mantine/core";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { HiUpload } from "react-icons/hi";
import { Crop } from "react-image-crop";
import Stateful from "./Stateful";

interface ImageUploaderProps {
  button?: React.ReactNode;
  crop?: boolean;
  imgRef?: React.RefObject<HTMLImageElement>;
  onFinished?: (img: string) => void;
  ratio?: number;
  modalSize?: "sm" | "md" | "lg" | "xl";
}

const Cropper = dynamic(() => import("react-image-crop"), {
  ssr: false,
});

const ImageUploader = ({
  button,
  crop,
  imgRef,
  onFinished,
  ratio,
  modalSize,
}: ImageUploaderProps) => {
  const [img, setImg] = useState<File | null>(null);
  const [croppedImg, setCroppedImg] = useState<string | null>(null);
  const [cropData, setCropData] = useState<Crop>();

  const getImageFromFile = () => {
    if (!img) return null;

    const reader = new FileReader();

    reader.onload = () => {
      setCroppedImg(reader.result as string);
    };

    reader.readAsDataURL(img);
  };

  useEffect(() => {
    if (img) getImageFromFile();
  }, [img]);

  const onCropComplete = (crop: Crop) => {
    makeClientCrop(crop);
  };

  const makeClientCrop = async (crop: Crop) => {
    if (crop.width && crop.height) {
      const croppedImg = await getCroppedImg(
        imgRef!.current!,
        crop,
        "newFile.png"
      );
      setCroppedImg(String(croppedImg));
    }
  };

  const getCroppedImg = (image: any, crop: Crop, fileName: string) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      try {
        return new Promise((resolve, reject) => {
          resolve(canvas.toDataURL("image/png", 1));
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <Stateful>
      {(cropOpen, setCropOpen) => (
        <>
          <Modal
            title="Crop image"
            opened={cropOpen}
            onClose={() => setCropOpen(false)}
            size={modalSize || "lg"}
          >
            <Cropper
              onChange={(newCrop: Crop) => setCropData(newCrop)}
              onComplete={onCropComplete}
              crop={cropData}
              aspect={ratio}
              className="w-full flex justify-center"
            >
              <img
                ref={imgRef as any}
                src={String(img ? URL.createObjectURL(img) : croppedImg)}
                alt="avatar"
              />
            </Cropper>

            <Button
              mt={20}
              fullWidth
              onClick={() => {
                setCropOpen(false);
                setImg(null);
                if (onFinished) onFinished(croppedImg as string);
              }}
            >
              Finish
            </Button>
          </Modal>
          <FileButton
            onChange={(file) => {
              if (file) {
                setImg(file);
                if (crop) setCropOpen(true);
                else {
                  const reader = new FileReader();

                  reader.onload = () => {
                    if (onFinished) {
                      if (imgRef && imgRef.current) {
                        imgRef.current!.src = reader.result as string;
                      }
                      onFinished(reader.result as string);
                    }
                  };

                  reader.readAsDataURL(file);
                }
              } else {
                setImg(null);
                setCroppedImg(null);
              }
            }}
            accept="image/png,image/jpeg"
          >
            {(props) =>
              button ? (
                button
              ) : (
                <Button leftIcon={<HiUpload />} {...props}>
                  Upload image
                </Button>
              )
            }
          </FileButton>
        </>
      )}
    </Stateful>
  );
};

export default ImageUploader;
