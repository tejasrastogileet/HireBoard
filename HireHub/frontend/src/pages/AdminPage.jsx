import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import Navbar from "../components/Navbar";
import { problemApi } from "../api/problems";
import { adminApi } from "../api/admin";
import EditProblemModal from "../components/EditProblemModal";
import { toast } from "react-hot-toast";

function AdminPage() {
  const { getToken } = useAuth();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [starterCode, setStarterCode] = useState("{}");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("create");
  const [problems, setProblems] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingProblem, setEditingProblem] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchProblems();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await problemApi.getProblems();
      // problemApi returns the parsed response object: { problems: [...] }
      setProblems(res?.problems || []);
    } catch (err) {
      console.error("fetchProblems", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await adminApi.listUsers();
      // adminApi.listUsers returns { users: [...] }
      setUsers(res?.users || []);
    } catch (err) {
      console.error("fetchUsers", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
      try {
      const token = await getToken();
      let parsedStarter = {};
      try {
        parsedStarter = JSON.parse(starterCode || "{}");
      } catch (err) {
        toast.error("Starter code must be valid JSON");
        setLoading(false);
        return;
      }

      const payload = {
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        title,
        difficulty,
        category,
        description: { text: description, notes: [] },
        starterCode: parsedStarter,
      };

      await problemApi.createProblem(payload, { headers: { Authorization: `Bearer ${token}` } });
      await fetchProblems();
      toast.success("Problem created");
      setTitle("");
      setSlug("");
      setDifficulty("Easy");
      setCategory("");
      setDescription("");
      setStarterCode("{}");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed");
    }
    setLoading(false);
  };

  const handleDeleteProblem = async (id) => {
    if (!confirm("Delete this problem?")) return;
    try {
      const token = await getToken();
      await problemApi.deleteProblem(id, { headers: { Authorization: `Bearer ${token}` } });
      await fetchProblems();
      toast.success("Deleted problem");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  const handleEditProblem = (p) => {
    setEditingProblem(p);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (payload) => {
    if (!editingProblem) return;
    setSavingEdit(true);
    try {
      const token = await getToken();
      await problemApi.updateProblem(editingProblem._id, payload, { headers: { Authorization: `Bearer ${token}` } });
      await fetchProblems();
      toast.success("Problem updated");
      setIsEditOpen(false);
      setEditingProblem(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    }
    setSavingEdit(false);
  };

  const toggleUserAdmin = async (userId, isAdmin) => {
    try {
      const token = await getToken();
      await adminApi.updateUserAdmin(userId, { isAdmin }, { headers: { Authorization: `Bearer ${token}` } });
      await fetchUsers();
      toast.success("User updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user");
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

        <div className="tabs mb-6">
          <button className={`tab tab-lifted ${tab === "create" ? "tab-active" : ""}`} onClick={() => setTab("create")}>Create Problem</button>
          <button className={`tab tab-lifted ${tab === "manage" ? "tab-active" : ""}`} onClick={() => setTab("manage")}>Manage Problems</button>
          <button className={`tab tab-lifted ${tab === "users" ? "tab-active" : ""}`} onClick={() => setTab("users")}>Manage Users</button>
        </div>

        {tab === "create" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="input input-bordered w-full" />
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug (optional)" className="input input-bordered w-full" />
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="select select-bordered w-full">
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="input input-bordered w-full" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="textarea textarea-bordered w-full" rows={6} />

            <label className="block">Starter Code (JSON object per language)</label>
            <textarea value={starterCode} onChange={(e) => setStarterCode(e.target.value)} className="textarea textarea-bordered w-full" rows={6} />

            <div>
              <button className="btn btn-primary" disabled={loading}>
                {loading ? "Saving..." : "Create Problem"}
              </button>
            </div>
          </form>
        )}

        {tab === "manage" && (
          <div className="space-y-4">
            {problems.length === 0 && <div>No problems yet</div>}
            {problems.map((p) => (
              <div key={p._id} className="card bg-base-100 shadow-sm p-4 flex justify-between items-start">
                <div>
                  <div className="font-semibold">{p.title} <span className="text-sm text-base-content/60">({p.difficulty})</span></div>
                  <div className="text-sm text-base-content/70">{p.category}</div>
                </div>
                  <div className="flex gap-2">
                    {/* Copy ID removed per user preference */}
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEditProblem(p)}>Edit</button>
                    <button className="btn btn-error btn-sm" onClick={() => handleDeleteProblem(p._id)}>Delete</button>
                  </div>
              </div>
            ))}
          </div>
        )}

        <EditProblemModal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditingProblem(null); }} problem={editingProblem} onSave={handleSaveEdit} saving={savingEdit} />

        {tab === "users" && (
          <div className="space-y-4">
            {users.length === 0 && <div>No users</div>}
            {users.map((u) => (
              <div key={u._id} className="card bg-base-100 shadow-sm p-4 flex justify-between items-center">
                <div>
                  <div className="font-semibold">{u.name || u.clerkId}</div>
                  <div className="text-sm text-base-content/70">{u.email} • {u.clerkId}</div>
                </div>
                <div className="flex gap-2 items-center">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!u.isAdmin} onChange={(e) => toggleUserAdmin(u._id, e.target.checked)} className="checkbox" />
                    <span className="text-sm">Admin</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
