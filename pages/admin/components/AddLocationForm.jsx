"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AddLocationForm() {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    description_es: "",
    state: "",
    rating: "",
    coordinates: "",
    featured: false,
    approved: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    if (!formData.name || !formData.description || !formData.coordinates) {
      setError("Name, description, and coordinates are required.");
      setLoading(false);
      return;
    }

    try {
      let image_url = "";

      // Upload image if present
      if (imageFile) {
        const filePath = `admin/${Date.now()}-${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("places-images")
          .upload(filePath, imageFile);

        if (uploadError) {
          throw new Error("Image upload failed: " + uploadError.message);
        }

        const { data: urlData } = supabase.storage
          .from("places-images")
          .getPublicUrl(filePath);

        image_url = urlData?.publicUrl || "";
      }

      const { error: insertError } = await supabase.from("places").insert([
        {
          ...formData,
          coordinates: formData.coordinates,
          rating: parseFloat(formData.rating || 0),
          image_url,
          status: "pending",
          added_by: null,
        },
      ]);

      if (insertError) {
        throw new Error("Insert failed: " + insertError.message);
      }

      setSuccess(true);
      setFormData({
        name: "",
        category: "",
        description: "",
        description_es: "",
        state: "",
        rating: "",
        coordinates: "",
        featured: false,
        approved: false,
      });
      setImageFile(null);
    } catch (err) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold">Add New Location</h2>

      <input type="file" accept="image/*" onChange={handleFileChange} />

      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        className="w-full border p-2"
        required
      />

      <input
        type="text"
        name="category"
        placeholder="Category"
        value={formData.category}
        onChange={handleChange}
        className="w-full border p-2"
      />

      <textarea
        name="description"
        placeholder="Description (English)"
        value={formData.description}
        onChange={handleChange}
        className="w-full border p-2"
        required
      />

      <textarea
        name="description_es"
        placeholder="Descripción (Español)"
        value={formData.description_es}
        onChange={handleChange}
        className="w-full border p-2"
      />

      <input
        type="text"
        name="state"
        placeholder="State"
        value={formData.state}
        onChange={handleChange}
        className="w-full border p-2"
      />

      <input
        type="number"
        step="0.1"
        name="rating"
        placeholder="Rating (e.g. 4.5)"
        value={formData.rating}
        onChange={handleChange}
        className="w-full border p-2"
      />

      <input
        type="text"
        name="coordinates"
        placeholder="Coordinates (e.g. [24.3, -110.3])"
        value={formData.coordinates}
        onChange={handleChange}
        className="w-full border p-2"
        required
      />

      <label className="block">
        <input
          type="checkbox"
          name="featured"
          checked={formData.featured}
          onChange={handleChange}
        />
        <span className="ml-2">Featured</span>
      </label>

      <label className="block">
        <input
          type="checkbox"
          name="approved"
          checked={formData.approved}
          onChange={handleChange}
        />
        <span className="ml-2">Approved</span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Submitting..." : "Submit"}
      </button>

      {success && <p className="text-green-600">Location added successfully!</p>}
      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
}
