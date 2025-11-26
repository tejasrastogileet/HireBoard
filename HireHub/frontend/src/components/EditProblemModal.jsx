import { useEffect, useState } from "react";

export default function EditProblemModal({ isOpen, onClose, problem, onSave, saving }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [starterCode, setStarterCode] = useState("{}");

  useEffect(() => {
    if (problem) {
      setTitle(problem.title || "");
      setCategory(problem.category || "");
      setDifficulty(problem.difficulty || "Easy");
      try {
        setStarterCode(JSON.stringify(problem.starterCode || {}, null, 2));
      } catch (e) {
        setStarterCode("{}");
      }
    }
  }, [problem]);

  if (!isOpen) return null;

  const handleSave = async () => {
    let parsed = {};
    try {
      parsed = JSON.parse(starterCode || "{}");
    } catch (err) {
      alert("Starter code must be valid JSON");
      return;
    }

    const payload = { title, category, difficulty, starterCode: parsed };
    await onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-base-100 rounded-md shadow-lg w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Problem</h3>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label">Title</label>
            <input className="input input-bordered w-full" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <input className="input input-bordered w-full" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div>
              <label className="label">Difficulty</label>
              <select className="select select-bordered w-full" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Starter Code (JSON)</label>
            <textarea rows={8} className="textarea textarea-bordered w-full font-mono text-sm" value={starterCode} onChange={(e) => setStarterCode(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2">
            <button className="btn" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
