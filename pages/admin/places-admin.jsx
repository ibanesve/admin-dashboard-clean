import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminLocations() {
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    description_es: '',
    coordinates: '',
    state: '',
    imageFile: null
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setLocations(data || []);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `locations/${fileName}`;

    let { error } = await supabase.storage.from('places-images').upload(filePath, file);

    if (error) {
      console.error('Image upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage.from('places-images').getPublicUrl(filePath);
    return publicUrl;
  };

  const addLocation = async () => {
    let imageUrl = null;
    if (form.imageFile) {
      imageUrl = await uploadImage(form.imageFile);
      if (!imageUrl) return;
    }

    const { error } = await supabase.from('places').insert({
      name: form.name,
      category: form.category,
      description: form.description,
      description_es: form.description_es,
      coordinates: form.coordinates,
      state: form.state,
      image_url: imageUrl,
      approved: false,
      featured: false
    });

    if (!error) {
      setForm({
        name: '',
        category: '',
        description: '',
        description_es: '',
        coordinates: '',
        state: '',
        imageFile: null
      });
      fetchLocations();
    }
  };

  const toggleField = async (id, field, currentValue) => {
    await supabase.from('places').update({ [field]: !currentValue }).eq('id', id);
    fetchLocations();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin: Manage Locations</h1>

      <div className="mb-6 space-y-2">
        <h2 className="text-lg font-semibold">➕ Add New Location</h2>
        <input className="border p-2 w-full" placeholder="Name" name="name" value={form.name} onChange={handleChange} />
        <input className="border p-2 w-full" placeholder="Category" name="category" value={form.category} onChange={handleChange} />
        <input className="border p-2 w-full" placeholder="Description (English)" name="description" value={form.description} onChange={handleChange} />
        <input className="border p-2 w-full" placeholder="Description (Spanish)" name="description_es" value={form.description_es} onChange={handleChange} />
        <input className="border p-2 w-full" placeholder="Coordinates [lat, lng]" name="coordinates" value={form.coordinates} onChange={handleChange} />
        <input className="border p-2 w-full" placeholder="State" name="state" value={form.state} onChange={handleChange} />
        <input type="file" name="imageFile" accept="image/*" onChange={handleChange} />
        <button onClick={addLocation} className="bg-green-600 text-white px-4 py-2 rounded mt-2">Add</button>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Approved</th>
            <th className="border p-2">Featured</th>
            <th className="border p-2">Image</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((loc) => (
            <tr key={loc.id}>
              <td className="border p-2">{loc.name}</td>
              <td className="border p-2">{loc.category}</td>
              <td className="border p-2 text-center">{loc.approved ? '✅' : '❌'}</td>
              <td className="border p-2 text-center">{loc.featured ? '⭐' : '—'}</td>
              <td className="border p-2">{loc.image_url ? <img src={loc.image_url} alt="" className="w-16 h-10 object-cover" /> : '—'}</td>
              <td className="border p-2 space-x-2">
                <button onClick={() => toggleField(loc.id, 'approved', loc.approved)} className="bg-blue-500 text-white px-2 py-1 rounded">
                  {loc.approved ? 'Unapprove' : 'Approve'}
                </button>
                <button onClick={() => toggleField(loc.id, 'featured', loc.featured)} className="bg-yellow-500 text-black px-2 py-1 rounded">
                  {loc.featured ? 'Unfeature' : 'Feature'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
