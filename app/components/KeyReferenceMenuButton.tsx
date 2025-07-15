import { MenuProvider, Menu, MenuButton, MenuItem } from "@/app/components/primitives/Menu";
import { BookMarked, Trash2 } from "lucide-react";
import clsx from "clsx";
import { Reference } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";

type KeyReferenceMenuButtonProps = {
  type: string;
  localReferences: Reference[];
  setLocalReferences: Dispatch<SetStateAction<Reference[]>>;
  callback: (value: string, key: string) => void;
};

const KeyReferenceMenuButton = ({ type, localReferences, setLocalReferences, callback }: KeyReferenceMenuButtonProps) => {
  const setReference = (value: string, key: string) => {
    callback(key, value);
  };

  const deleteReference = (id: string) => {
    fetch(`/api/reference/delete/${id}`, {
      method: "DELETE",
    }).then(() => {
      setLocalReferences(localReferences.filter((reference) => reference.id !== id));
    });
  };

  const disabled = localReferences.filter(ref => ref.type === type).length === 0;
  return (
    <MenuProvider>
      <MenuButton disabled={disabled}>
        <BookMarked strokeWidth={1.5} size={24} className={clsx("text-gray-600", { "opacity-50": disabled })} />
      </MenuButton>
      <Menu>
        {localReferences
          .filter((reference) => reference.type === type)
          .map((ref) =>
            <MenuItem key={ref.id}>
              <button
                type="button"
                key={ref.id}
                onClick={() => setReference(ref.value, type)}
                className="truncate max-w-48 mr-2"
              >
                {ref.value}
              </button>
              <button 
                type="button" 
                onClick={() => deleteReference(ref.id)} 
                className="hover:bg-gray-300 rounded ml-auto"
                >
                <Trash2 strokeWidth={2} size={18} />
              </button>
            </MenuItem>
          )
        }
      </Menu>
    </MenuProvider>
  )
};

export default KeyReferenceMenuButton;
