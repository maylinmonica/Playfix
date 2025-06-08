import { useEffect, useState } from 'react';
import { Menu, Search, Play, Edit3, Trash2, Heart, Plus, X, PlayCircle, Clock, Star } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import EditModal from './EditModal'; // Import komponen EditModal
import Notification from '../pages/Notification';
import AdvancedSearch from '../pages/AdvancedSearch';

const Home = () => {
  // URL search params untuk mengelola state sidebar
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [playlists, setPlaylists] = useState([]);
  const [originalPlaylists, setOriginalPlaylists] = useState([]); // Store original data
  const [filteredPlaylists, setFilteredPlaylists] = useState([]); // Results from AdvancedSearch
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);
  
  // State sidebar dari URL parameter
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    searchParams.get('sidebar') === 'open'
  );
  
  // State untuk Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);

  // State untuk delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingPlaylistId, setDeletingPlaylistId] = useState(null);
  const [deletingPlaylistName, setDeletingPlaylistName] = useState('');

  // State untuk notification
  const [notification, setNotification] = useState({
    message: '',
    type: 'success',
    isVisible: false
  });

  // State untuk mengontrol apakah menggunakan advanced search
  const [isUsingAdvancedSearch, setIsUsingAdvancedSearch] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});

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

  // Update URL ketika sidebar state berubah
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

  // Load favorites dari state (bukan localStorage untuk Claude artifacts)
  useEffect(() => {
    // Simulate loading favorites from storage
    // In real app, you would use localStorage here
    setFavorites([]);
  }, []);

  const fetchPlaylists = () => {
    setIsLoading(true);
    fetch('https://webfmsi.singapoly.com/api/playlist/32')
      .then((res) => res.json())
      .then((data) => {
        const playlistData = data.datas || [];
        setPlaylists(playlistData);
        setOriginalPlaylists(playlistData);
        setFilteredPlaylists(playlistData); // Set initial filtered results
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        showNotification('Gagal memuat playlist!', 'error');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  // Handle filtered results from AdvancedSearch
  const handleFilteredResults = (results, filters) => {
    setFilteredPlaylists(results);
    setCurrentFilters(filters);
    setIsUsingAdvancedSearch(
      filters.searchTerm !== '' ||
      filters.genre !== 'all' ||
      filters.dateFilter !== 'any' ||
      filters.isFavoriteOnly ||
      filters.sortBy !== 'name' ||
      filters.sortOrder !== 'asc'
    );
  };

  // Handle delete click - membuka modal konfirmasi
  const handleDeleteClick = (playlistId, playlistName) => {
    setDeletingPlaylistId(playlistId);
    setDeletingPlaylistName(playlistName);
    setIsDeleteModalOpen(true);
  };

  // Konfirmasi delete playlist
  const handleConfirmDelete = () => {
    if (deletingPlaylistId) {
      fetch(`https://webfmsi.singapoly.com/api/playlist/${deletingPlaylistId}`, {
        method: 'DELETE',
      })
        .then((res) => res.json())
        .then(() => {
          showNotification('Playlist berhasil dihapus!', 'success');
          fetchPlaylists();
          setFavorites(prev => prev.filter(favId => favId !== deletingPlaylistId));
          setIsDeleteModalOpen(false);
          setDeletingPlaylistId(null);
          setDeletingPlaylistName('');
        })
        .catch((err) => {
          console.error(err);
          showNotification('Gagal menghapus playlist!', 'error');
        });
    }
  };

  // Batal delete
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletingPlaylistId(null);
    setDeletingPlaylistName('');
  };

  const toggleFavorite = (id) => {
    console.log('Toggle favorite for ID:', id);
    setFavorites((prev) => {
      const newFavorites = prev.includes(id)
        ? prev.filter((favId) => favId !== id)
        : [...prev, id];
      console.log('New favorites:', newFavorites);
      
      // Show notification for favorite toggle
      const isAdding = !prev.includes(id);
      showNotification(
        isAdding ? 'Ditambahkan ke favorit!' : 'Dihapus dari favorit!',
        'success'
      );
      
      return newFavorites;
    });
  };

  // Handle Edit Modal
  const handleEditClick = (playlistId) => {
    setEditingPlaylistId(playlistId);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingPlaylistId(null);
  };

  const handleEditSuccess = () => {
    fetchPlaylists(); // Refresh playlist setelah edit berhasil
  };

  // Close sidebar when clicking overlay (mobile)
  const handleOverlayClick = () => {
    updateSidebarState(false);
  };

  // Handle sidebar toggle
  const toggleSidebar = () => {
    updateSidebarState(!isSidebarOpen);
  };

  // Handle navigation to Add page with sidebar state
  const handleNavigateToAdd = (e) => {
    e.preventDefault();
    const currentParams = new URLSearchParams();
    if (isSidebarOpen) {
      currentParams.set('sidebar', 'open');
    }
    navigate(`/add?${currentParams.toString()}`);
  };

  // Get unique genres
  const genres = ['all', ...new Set(originalPlaylists.map(p => p.play_genre).filter(Boolean))];

  // Legacy filter function (untuk sidebar navigation)
  const getLegacyFilteredPlaylists = () => {
    return originalPlaylists.filter((item) => {
      const matchesSearch = item.play_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // If showing favorites, only show favorited playlists
      if (showFavorites) {
        return matchesSearch && favorites.includes(item.id_play);
      }
      
      // Otherwise filter by genre
      const matchesGenre = selectedGenre === 'all' || item.play_genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });
  };

  // Determine which playlists to display
  const displayPlaylists = isUsingAdvancedSearch ? filteredPlaylists : getLegacyFilteredPlaylists();

  // Handle sidebar filter changes (disable advanced search when using sidebar)
  const handleSidebarFilterChange = (callback) => {
    setIsUsingAdvancedSearch(false);
    callback();
  };

  // Get current time for greeting
  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

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

      {/* Header - Updated with new design */}
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

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div>
          <h1>Your Library</h1>
          <div className="sidebar-nav">
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handleSidebarFilterChange(() => {
                  setShowFavorites(false);
                  setSelectedGenre('all');
                });
              }}
              className={!isUsingAdvancedSearch && !showFavorites && selectedGenre === 'all' ? 'active' : ''}
            >
              <PlayCircle size={20} />
              All Playlists
            </a>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handleSidebarFilterChange(() => {
                  setShowFavorites(true);
                  setSelectedGenre('all');
                });
              }}
              className={!isUsingAdvancedSearch && showFavorites ? 'active' : ''}
            >
              <Heart size={20} />
              Favorite Playlists ({favorites.length})
            </a>
            <a 
              href="#"
              onClick={handleNavigateToAdd}
              className="sidebar-link"
            >
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
                  onClick={(e) => {
                    e.preventDefault();
                    handleSidebarFilterChange(() => {
                      setSelectedGenre(genre);
                      setShowFavorites(false);
                    });
                  }}
                  className={`genre-item ${!isUsingAdvancedSearch && !showFavorites && selectedGenre === genre ? 'active' : ''}`}
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
            {originalPlaylists.slice(0, 3).map((playlist) => (
              <div key={playlist.id_play}>
                <PlayCircle size={16} />
                {playlist.play_name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={`main ${isSidebarOpen ? 'with-sidebar' : ''}`}>
        {/* Enhanced Welcome Section */}
        <div style={{ 
          marginBottom: '40px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background gradient overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 107, 107, 0.05))',
            borderRadius: '20px',
            zIndex: 0
          }} />
          
          {/* Content */}
          <div style={{ 
            position: 'relative',
            zIndex: 1,
            padding: '32px 28px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            background: 'rgba(255, 255, 255, 0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
              {/* Left side - Greeting */}
              <div>
                <h1 style={{ 
                  fontSize: '36px', 
                  marginBottom: '8px',
                  background: 'linear-gradient(135deg, #fff, #ff6b6b)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: '700',
                  lineHeight: '1.2'
                }}>
                  {getCurrentGreeting()} 👋
                </h1>
                
                <p style={{ 
                  fontSize: '16px', 
                  color: '#b0b0b0',
                  margin: 0,
                  maxWidth: '480px',
                  lineHeight: '1.5'
                }}>
                  Welcome to your personal YouTube playlist manager. Explore videos across any category: music, learning, lifestyle, and more — in one simple space.
                </p>
              </div>

              {/* Right side - Quick stats */}
              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ 
                  textAlign: 'center',
                  padding: '16px 20px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  minWidth: '80px'
                }}>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: '#ff0000',
                    marginBottom: '4px'
                  }}>
                    {originalPlaylists.length}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#888',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Playlists
                  </div>
                </div>
                
                <div style={{ 
                  textAlign: 'center',
                  padding: '16px 20px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  minWidth: '80px'
                }}>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: '#ff6b6b',
                    marginBottom: '4px'
                  }}>
                    {favorites.length}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#888',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Favorites
                  </div>
                </div>
                
                <div style={{ 
                  textAlign: 'center',
                  padding: '16px 20px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  minWidth: '80px'
                }}>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: '#ffa500',
                    marginBottom: '4px'
                  }}>
                    {genres.length - 1}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#888',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Genres
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ 
              marginTop: '24px', 
              display: 'flex', 
              gap: '12px', 
              flexWrap: 'wrap' 
            }}>
              <button
                onClick={handleNavigateToAdd}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, #ff0000, #cc0000)',
                  border: 'none',
                  borderRadius: '25px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(255, 0, 0, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(255, 0, 0, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(255, 0, 0, 0.3)';
                }}
              >
                <Plus size={16} />
                New Playlist
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleSidebarFilterChange(() => {
                    setShowFavorites(true);
                    setSelectedGenre('all');
                  });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '25px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.borderColor = 'rgba(255, 0, 0, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                <Heart size={16} />
                View Favorites
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Search Component */}
        <AdvancedSearch 
          playlists={originalPlaylists}
          onFilteredResults={handleFilteredResults}
          favorites={favorites}
          initialFilters={{}}
        />

        {/* Section Title */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600',
            textTransform: 'capitalize' 
          }}>
            {isUsingAdvancedSearch 
              ? 'Search Results'
              : showFavorites 
                ? 'Favorite Playlists' 
                : selectedGenre === 'all' 
                  ? 'Your Playlists' 
                  : `${selectedGenre} Playlists`
            }
          </h2>
          <span style={{ color: '#999', fontSize: '14px' }}>
            {displayPlaylists.length} playlists
          </span>
        </div>

        {/* Filter Status Indicator */}
        {isUsingAdvancedSearch && (
          <div style={{ 
            marginBottom: '16px', 
            padding: '8px 12px', 
            background: 'rgba(255, 0, 0, 0.1)', 
            border: '1px solid rgba(255, 0, 0, 0.2)',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#ff0000'
          }}>
            Using advanced search filters
          </div>
        )}

        {/* Playlist Grid */}
        {isLoading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            Loading playlists...
          </div>
        ) : displayPlaylists.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 0',
              color: '#888',
            }}
          >
            <PlayCircle size={64} />
            <p style={{ fontSize: '18px', marginTop: '16px' }}>
              {isUsingAdvancedSearch 
                ? 'No playlists match your search criteria'
                : showFavorites 
                  ? 'No favorite playlists yet' 
                  : 'No playlists found'
              }
            </p>
            <p
              style={{
                fontSize: '14px',
                color: '#666',
                marginTop: '8px',
              }}
            >
              {isUsingAdvancedSearch
                ? 'Try adjusting your search filters'
                : showFavorites 
                  ? 'Start adding playlists to your favorites by clicking the heart icon'
                  : 'Try adjusting your search terms or genre filter'
              }
            </p>
          </div>
        ) : (
          <div className="playlist-grid">
            {displayPlaylists.map((playlist) => (
              <div key={playlist.id_play} className="playlist-card">
                {/* FAVORITE BUTTON */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(playlist.id_play);
                  }}
                  className={`favorite-button ${
                    favorites.includes(playlist.id_play) ? 'active' : ''
                  }`}
                >
                  <Heart 
                    size={16} 
                    fill={favorites.includes(playlist.id_play) ? '#ff0000' : 'none'}
                  />
                </button>

                {/* PLAYLIST IMAGE */}
                <div style={{ marginBottom: '16px', position: 'relative' }}>
                  <img
                    src={playlist.play_thumbnail}
                    alt={playlist.play_name}
                    style={{
                      width: '100%',
                      height: '160px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                    }}
                  />
                  {/* PLAY BUTTON */}
                  <button
                    className="play-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(playlist.play_url, '_blank');
                    }}
                  >
                    <Play size={16} />
                  </button>
                </div>

                {/* PLAYLIST INFO */}
                <div style={{ marginBottom: '12px' }}>
                  <h3
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '4px',
                    }}
                  >
                    {playlist.play_name}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#aaa' }}>
                    {playlist.play_genre}
                  </p>
                </div>

                {/* ACTION BUTTONS */}
                <div className="action-buttons">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(playlist.play_url, '_blank');
                    }}
                  >
                    <Play size={12} />
                    Play
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(playlist.id_play);
                    }}
                  >
                    <Edit3 size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(playlist.id_play, playlist.play_name);
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      <EditModal 
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        playlistId={editingPlaylistId}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-container delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <p>Yakin ingin menghapus playlist ini?</p>
              
              <div className="form-actions">
                <button 
                  className="btn-secondary" 
                  onClick={handleCancelDelete}
                >
                  Cancel
                </button>
                <button 
                  className="btn-danger" 
                  onClick={handleConfirmDelete}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;