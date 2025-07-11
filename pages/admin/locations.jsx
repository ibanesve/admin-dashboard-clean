import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminLocations() {
  const [locations, setLocations] = useState([]);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setLocations(data || []);
  };

  const addLocation = async () => {
    if (!newName) return;

    const { error } = await supabase.from("locations").insert({
      name: newName,
      description: newDescription,
      approved: false,
      featured: false,
    });

    if (!error) {
      setNewName("");
      setNewDescription("");
      fetchLocations();
    }
  };

  const toggleApproval = async (id, approved) => {
    await supabase.from("locations").update({ approved: !approved }).eq("id", id);
    fetchLocations();
  };

  const toggleFeatured = async (id, featured) => {
    await supabase.from("locations").update({ featured: !featured }).eq("id", id);
    fetchLocations();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin: Manage Locations</h1>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">➕ Add New Location</h2>
        <input
          className="border p-2 mr-2 w-64"
          placeholder="Location Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          className="border p-2 mr-2 w-96"
          placeholder="Description"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
        />
        <button onClick={addLocation} className="bg-green-600 text-white px-4 py-2 rounded">
          Add
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2 border">Name</th>
            <th className="text-left p-2 border">Description</th>
            <th className="text-center p-2 border">Approved</th>
            <th className="text-center p-2 border">Featured</th>
            <th className="text-center p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((loc) => (
            <tr key={loc.id} className="border-t">
              <td className="p-2">{loc.name}</td>
              <td className="p-2">{loc.description}</td>
              <td className="text-center">{loc.approved ? "✅" : "❌"}</td>
              <td className="text-center">{loc.featured ? "⭐" : "—"}</td>
              <td className="text-center space-x-2">
                <button
                  onClick={() => toggleApproval(loc.id, loc.approved)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  {loc.approved ? "Unapprove" : "Approve"}
                </button>
                <button
                  onClick={() => toggleFeatured(loc.id, loc.featured)}
                  className="bg-yellow-500 text-black px-2 py-1 rounded"
                >
                  {loc.featured ? "Unfeature" : "Feature"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
