import React, { useCallback } from "react";
import { BookmarkPlus } from "lucide-react";
import clsx from "clsx";
import { Reference } from "@prisma/client";


type KeyReferenceAddButtonProps = {
  type: string;
  value: string;
  localReferences: Reference[];
  setLocalReferences: React.Dispatch<React.SetStateAction<Reference[]>>;
};

const KeyReferenceAddButton = ({ type, value, localReferences, setLocalReferences }: KeyReferenceAddButtonProps) => {
  const disabled = !value ||
    !!localReferences
      .filter((reference) => reference.type === type)
      .find((reference) => reference.value === value);

  const setReferencePost = useCallback((value: string, type: string) => {
    fetch("/api/reference/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        referenceTitle: value.split(" ").slice(0, 2).join(" "),
        referenceValue: value,
        referenceType: type,
        publish: true,
      }),
    }).then(async (data) => {
      const newReference = await data.json();
      setLocalReferences([...localReferences, newReference]);
    });
  }, []);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setReferencePost(value, type)}
      className="hover:bg-gray-200 rounded-md p-1 disabled:opacity-50 h-fit disabled:bg-transparent"
    >
      <BookmarkPlus size={24} strokeWidth={1.5} className={clsx("text-gray-600", { "opacity-50": disabled })} />
    </button>
  );
};

export default KeyReferenceAddButton;