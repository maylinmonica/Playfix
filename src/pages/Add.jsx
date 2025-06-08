import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Menu, Search, Music, Heart, Plus, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Notification from '../pages/Notification';

const Add = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State sidebar dari URL parameter 
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    searchParams.get('sidebar') === 'open'
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk notification
  const [notification, setNotification] = useState({
    message: '',
    type: 'success',
    isVisible: false
  });
  
  const [form, setForm] = useState({
    play_name: '',
    play_url: '',
    play_thumbnail: '',
    play_genre: 'music',
    play_description: '',
  });

  const [playlists, setPlaylists] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetch('https://webfmsi.singapoly.com/api/playlist/32')
      .then((res) => res.json())
      .then((data) => {
        setPlaylists(data.datas || []);
      })
      .catch((err) => console.error(err));
  }, []);

  const updateSidebarState = (isOpen) => {
    setIsSidebarOpen(isOpen);
    const newSearchParams = new URLSearchParams(searchParams);
    if (isOpen) {
      newSearchParams.set('sidebar', 'open');
    } else {
      newSearchParams.delete('sidebar');
    }
    setSearchParams(newSearchParams);
  };

  // Fungsi untuk menampilkan notification
  const showNotification = (message, type = 'success') => {
    setNotification({
      message,
      type,
      isVisible: true
    });
  };

  // Fungsi untuk menutup notification
  const closeNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!form.play_name.trim()) {
        throw new Error('Playlist name is required');
      }
      if (!form.play_url.trim()) {
        throw new Error('YouTube URL is required');
      }
      if (!form.play_thumbnail.trim()) {
        throw new Error('Thumbnail URL is required');
      }
      if (!form.play_description.trim()) {
        throw new Error('Description is required');
      }

      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key].trim());
      });

      const response = await fetch('https://webfmsi.singapoly.com/api/playlist/32', {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text();

      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(`Server error: ${errorData.message || errorData.error || 'Unknown server error'}`);
        } catch (parseError) {
          throw new Error(`HTTP ${response.status}: ${responseText || 'Server error'}`);
        }
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        showNotification('Playlist berhasil ditambahkan!', 'success');
        // Tunggu sebentar sebelum navigate agar notification terlihat
        setTimeout(() => {
          // Navigate dengan mempertahankan sidebar state
          const currentParams = new URLSearchParams();
          if (isSidebarOpen) {
            currentParams.set('sidebar', 'open');
          }
          navigate(`/?${currentParams.toString()}`);
        }, 1000);
        return;
      }

      if (data.success !== false && !data.error) {
        showNotification('Playlist berhasil ditambahkan!', 'success');
        // Tunggu sebentar sebelum navigate agar notification terlihat
        setTimeout(() => {
          // Navigate dengan mempertahankan sidebar state
          const currentParams = new URLSearchParams();
          if (isSidebarOpen) {
            currentParams.set('sidebar', 'open');
          }
          navigate(`/?${currentParams.toString()}`);
        }, 1000);
      } else {
        throw new Error(data.message || data.error || 'Unknown error from API');
      }

    } catch (err) {
      console.error('Complete error details:', err);
      showNotification(`Gagal menambahkan playlist: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Yakin ingin membatalkan? Data yang diisi akan hilang.')) {
      // Navigate dengan mempertahankan sidebar state
      const currentParams = new URLSearchParams();
      if (isSidebarOpen) {
        currentParams.set('sidebar', 'open');
      }
      navigate(`/?${currentParams.toString()}`);
    }
  };

  // Handle sidebar toggle 
  const toggleSidebar = () => {
    updateSidebarState(!isSidebarOpen);
  };

  // Close sidebar when clicking overlay 
  const handleOverlayClick = () => {
    updateSidebarState(false);
  };

  // Handle navigation to Home with sidebar state 
  const handleNavigateToHome = (e) => {
    e.preventDefault();
    const currentParams = new URLSearchParams();
    if (isSidebarOpen) {
      currentParams.set('sidebar', 'open');
    }
    navigate(`/?${currentParams.toString()}`);
  };

  const genres = ['all', ...new Set(playlists.map(p => p.play_genre).filter(Boolean))];

  return (
    <div className="home-layout">
      {/* Notification Component */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={closeNotification}
      />

      {/* Overlay untuk mobile */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`}
        onClick={handleOverlayClick}
      ></div>

      {/* Header - Updated dengan design yang sama dengan Home.jsx */}
      <header className="main-header-fixed">
        <div className="header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#fff',
              }}
              onClick={toggleSidebar}
            >
              <Menu size={28} />
            </button>

            <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <PlayCircle size={32} />
              <h1 style={{ fontSize: '20px', margin: 0, fontWeight: '700' }}>
                Playlix
              </h1>
            </div>
          </div>
          
          <div style={{ fontSize: '14px', color: '#e0e0e0', textAlign: 'right' }}>
            <div>YouTube Playlist Manager</div>
          </div>
        </div>
      </header>

      {/* Sidebar - Updated dengan design yang sama dengan Home.jsx */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div>
          <h1>Your Library</h1>
          <div className="sidebar-nav">
            <a 
              href="#" 
              onClick={handleNavigateToHome}
              className="sidebar-link"
            >
              <PlayCircle size={20} />
              All Playlists
            </a>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                // Navigate to home with favorites filter
                const currentParams = new URLSearchParams();
                if (isSidebarOpen) {
                  currentParams.set('sidebar', 'open');
                }
                navigate(`/?${currentParams.toString()}`);
              }}
              className="sidebar-link"
            >
              <Heart size={20} />
              Favorite Playlists ({favorites.length})
            </a>
            <a href="#" className="active">
              <Plus size={20} />
              Create Playlist
            </a>
          </div>

          {/* Genre Filter */}
          <div className="genre-section">
            <h3>Browse by Genre</h3>
            <div className="genre-list">
              {genres.map((genre) => (
                <a
                  key={genre}
                  href="#"
                  className="genre-item"
                  onClick={(e) => {
                    e.preventDefault();
                    // Navigate to home with genre filter
                    const currentParams = new URLSearchParams();
                    if (isSidebarOpen) {
                      currentParams.set('sidebar', 'open');
                    }
                    if (genre !== 'all') {
                      currentParams.set('genre', genre);
                    }
                    navigate(`/?${currentParams.toString()}`);
                  }}
                >
                  {genre === 'all' ? 'All Genres' : genre}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="recently-played">
          <h3>Recently Played</h3>
          <div>
            {playlists.slice(0, 3).map((playlist) => (
              <div key={playlist.id_play}>
                <PlayCircle size={16} />
                {playlist.play_name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className={`main ${isSidebarOpen ? 'with-sidebar' : ''}`}>
        <div className="form-wrapper">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>
              Create New Playlist
            </h2>
            <p style={{ color: '#888', fontSize: '14px' }}>
              Fill in the details below to add a new playlist to your collection
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Playlist Name *</label>
              <input
                type="text"
                name="play_name"
                placeholder="Enter playlist name..."
                value={form.play_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>YouTube URL *</label>
              <input
                type="url"
                name="play_url"
                placeholder="https://youtube.com/playlist?list=..."
                value={form.play_url}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Thumbnail URL *</label>
              <input
                type="url"
                name="play_thumbnail"
                placeholder="https://example.com/thumbnail.jpg"
                value={form.play_thumbnail}
                onChange={handleChange}
                required
              />
              {form.play_thumbnail && (
                <div className="thumbnail-preview">
                  <h4>Preview:</h4>
                  <img 
                    src={form.play_thumbnail} 
                    alt="Thumbnail Preview"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Genre</label>
              <select 
                name="play_genre" 
                value={form.play_genre}
                onChange={handleChange}
              >
                <option value="Music">Music</option>
                <option value="Movie">Movie</option>
                <option value="Education">Education</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="play_description"
                placeholder="Add a description for your playlist..."
                value={form.play_description}
                onChange={handleChange}
                rows="4"
                required
              ></textarea>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Playlist'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Add;