import {useState } from "react";
import {X} from "lucide-react";

type TagsInputProps = {
  tags: string[];
  onAddTags: (tag: string) => void;
  onRemoveTags: (index: number) => void;
};

const TagsInput = ({tags, onAddTags, onRemoveTags}:TagsInputProps) => {
  const [tagText, setTagText] = useState("");

  return (
    <div className="flex items-start flex-wrap w-full p-[2px] ml-1 rounded-md border border-gray-300">
      <ul className="flex flex-wrap p-0">
        {tags.map((tag, index) => tag !== "" && (
          <li key={index} className="flex items-center justify-center px-2 w-auto h-8 m-[2px] text-white text-sm rounded-md bg-blue-700">
            <div>{tag}</div>
            <div className='flex items-center justify-center w-4 h-4 text-sm ml-2 bg-white text-blue-700 cursor-pointer rounded-full'
              onClick={() => onRemoveTags(index)}
            >
              <X strokeWidth={2} size={12} />
            </div>
          </li>
        ))}
      </ul>
      <input
        type="text"
        className="h-8 text-sm px-1 outline-none"
        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
        onKeyUp={event => {
          event.preventDefault();
          if(event.key === "Enter") {
            onAddTags(tagText)
            setTagText("")
          } else {
            null
          }
        }}
        placeholder="Press enter to add tags"
        value={tagText}
        onChange={(e) => setTagText(e.target.value)}
      />
    </div>
  );
};

export default TagsInput;
