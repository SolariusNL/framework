import { useEffect, useRef, useState } from "react";
import clsx from "../util/clsx";

type PinInputProps = {
  length: number;
  onChange?: (value: string) => void;
  error?: string;
} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

const PinInput = (props: PinInputProps) => {
  const { length, onChange, error } = props;
  const [value, setValue] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const inputValue = e.target.value;
    if (!/^\d*$/.test(inputValue)) {
      return;
    }

    const newValue =
      value.slice(0, index) + inputValue + value.slice(index + 1);
    setValue(newValue);

    const nextIndex = index + 1;
    if (nextIndex < length) {
      inputRefs.current[nextIndex]?.focus();
    }

    if (newValue.length === length && onChange) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    const isBackspace = e.key === "Backspace" || e.key === "Delete";
    const isArrowLeft = e.key === "ArrowLeft";
    const isArrowRight = e.key === "ArrowRight";

    if (isBackspace && !value[index] && index > 0) {
      setValue(value.slice(0, index - 1) + value.slice(index));
      inputRefs.current[index - 1]?.focus();
      e.preventDefault();
    } else if (
      (isArrowLeft && index > 0) ||
      (isArrowRight && index < length - 1)
    ) {
      const nextIndex = isArrowLeft ? index - 1 : index + 1;
      inputRefs.current[nextIndex]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text");
    const sanitizedData = pasteData
      .replace(/[^\d]/g, "")
      .slice(0, length - value.length);
    const newValue = value + sanitizedData;
    setValue(newValue);
    inputRefs.current[newValue.length - 1]?.focus();
    if (newValue.length === length && onChange) {
      onChange(newValue);
    }
  };

  const renderInputs = () => {
    const inputs = [];
    for (let i = 0; i < length; i++) {
      inputs.push(
        <input
          key={i}
          ref={(ref) => (inputRefs.current[i] = ref)}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          className={clsx(
            "w-10 h-10 text-1xl text-center rounded-md dark:border-zinc-800 border-gray-200 dark:bg-mantine-paper-dark text-mantine-text dark:text-mantine-text-dark sm:text-sm mx-1",
            "focus:outline-none focus:ring-0 border-solid focus:border-blue-400",
            i === 0 && "ml-0",
            i === length - 1 && "mr-0"
          )}
          value={value[i] || ""}
          onChange={(e) => handleInputChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          style={{
            borderWidth: "1px",
          }}
        />
      );
    }
    return inputs;
  };

  return (
    <div className={props.className}>
      {renderInputs()}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default PinInput;
