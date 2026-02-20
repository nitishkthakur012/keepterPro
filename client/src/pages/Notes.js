// client/src/pages/Notes.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Notes() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/notes', { withCredentials: true });
        setNotes(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Error fetching notes');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [navigate]); // ← navigate is stable → safe dependency

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let updatedNotes;
      if (editingId) {
        const res = await axios.put(
          `/api/notes/${editingId}`,
          { title, content },
          { withCredentials: true }
        );
        updatedNotes = notes.map((note) =>
          note.id === editingId ? res.data : note
        );
        setEditingId(null);
      } else {
        const res = await axios.post(
          '/api/notes',
          { title, content },
          { withCredentials: true }
        );
        updatedNotes = [...notes, res.data];
      }

      setNotes(updatedNotes);
      setTitle('');
      setContent('');
      setError(''); // clear error on success
    } catch (err) {
      setError('Error saving note');
    }
  };

  const handleEdit = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/notes/${id}`, { withCredentials: true });
      setNotes(notes.filter((note) => note.id !== id));
      setError(''); // clear error on success
    } catch (err) {
      setError('Error deleting note');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      navigate('/login');
    } catch (err) {
      setError('Error logging out');
    }
  };

  if (loading) return <p>Loading notes...</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Your Notes</h2>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          required
          rows={5}
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <button
          type="submit"
          style={{
            padding: '10px',
            background: editingId ? '#ffc107' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          {editingId ? 'Update Note' : 'Create Note'}
        </button>
      </form>

      {error && (
        <p style={{ color: 'red', margin: '10px 0' }}>{error}</p>
      )}

      {notes.length === 0 && !loading && (
        <p style={{ color: '#666', fontStyle: 'italic' }}>No notes yet. Create your first one!</p>
      )}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {notes.map((note) => (
          <li
            key={note.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0' }}>{note.title}</h3>
            <p style={{ margin: '0 0 12px 0', whiteSpace: 'pre-wrap' }}>{note.content}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleEdit(note)}
                style={{
                  padding: '6px 12px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(note.id)}
                style={{
                  padding: '6px 12px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Notes;