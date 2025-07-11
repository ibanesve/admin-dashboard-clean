
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function TestAdmin() {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `test/${fileName}`;

    const { error } = await supabase.storage.from('places-images').upload(filePath, file);
    if (error) {
      console.error('Image upload error:', error.message);
      return null;
    }

    const { data } = supabase.storage.from('places-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    console.log('Submitting:', name, image);
    let imageUrl = null;
    if (image) {
      imageUrl = await uploadImage(image);
      if (!imageUrl) return;
    }

    const { error } = await supabase.from('places').insert({
      name,
      image_url: imageUrl,
      approved: false,
      featured: false
    });

    if (error) {
      console.error('Insert error:', error.message);
    } else {
      alert('Place added!');
      setName('');
      setImage(null);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">🧪 Test Admin Page</h1>
      <input
        className="border p-2 block mb-2 w-full"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        className="mb-2"
      />
      <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">
        Submit
      </button>
    </div>
  );
}
