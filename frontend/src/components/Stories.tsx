import { CardValue, CardValues, Story } from "../types";
import { useSessionContext } from "../contexts/SessionContext";
import { useEffect, useState } from "react";

function StoryCard({ story }: { story: Story }) {
  const { deleteStory, addTask, deleteTask } = useSessionContext();
  const [taskText, setTaskText] = useState("");
  const [taskEstimate, setTaskEstimate] = useState(0);

  return (
    <div className="flex justify-between items-center rounded-lg max-h-80 overflow-y-auto w-full p-4 bg-green-100">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <p className="font-bold">{story.summary}</p>
          <button
            className="text-red-500 hover:bg-red-200 py-1 px-2 rounded-md text-sm"
            onClick={() => deleteStory(story.id)}
          >
            Delete
          </button>
        </div>
        <p className="text-sm">{story.description}</p>
        <div className="flex gap-4">
          <input
            className="border-2 rounded-md p-2"
            placeholder="Task"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
          />

          <select
            className="border-2 rounded-md p-2"
            value={taskEstimate}
            onChange={(e) => setTaskEstimate(parseInt(e.target.value))}
          >
            {CardValues.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <button
            className="bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded-md"
            onClick={() => {
              addTask(story.id, taskText, taskEstimate as CardValue);
              setTaskText("");
              setTaskEstimate(0);
            }}
          >
            Add Task
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {story.tasks.map((task) => (
            <div className="flex gap-4">
              {task.summary}: {task.estimation}
              <button className="text-red-500 hover:bg-red-200 py-1 px-2 rounded-md text-sm">
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Stories() {
  const { stories, addStory, game } = useSessionContext();
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const handleAdd = () => {
    addStory(summary, description);
    setSummary("");
    setDescription("");
  };

  if (!game) {
    return null;
  }

  return (
    <div className="flex flex-col rounded-lg p-2 gap-2 max-h-96 overflow-y-auto relative">
      <div className="flex justify-between gap-4 items-center p-2 static top-0 w-full">
        <p className="text-center font-bold">Stories</p>
        <div className="flex gap-2">
          {/* input for summary and description */}
          <input
            className="border-2 rounded-md p-2"
            placeholder="Summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />

          <input
            className="border-2 rounded-md p-2"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button
            className="bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded-md"
            onClick={handleAdd}
          >
            Add Story
          </button>
        </div>
      </div>
      <div className="flex flex-row gap-4 flex-wrap p-2">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} setStory={setSelectedStory} />
        ))}
      </div>
    </div>
  );
}
