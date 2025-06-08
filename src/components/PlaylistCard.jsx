import { Link } from 'react-router-dom';
import { Play, Edit3, Trash2, Heart } from 'lucide-react';

const PlaylistCard = ({ playlist, onDelete, favorites, onToggleFavorite }) => {
  const handleEditClick = (e) => {
    e.stopPropagation();
    window.location.href = `/edit/${playlist.id_play}`;
  };

  return (
    <div className="playlist-card">
      {/* FAVORITE BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(playlist.id_play);
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
          onClick={handleEditClick}
        >
          <Edit3 size={12} />
        </button>
        <button
          className="delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(playlist.id_play);
          }}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

export default PlaylistCard;