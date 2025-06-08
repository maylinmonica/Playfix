import { useState, useEffect } from 'react';
import { X, Edit3 } from 'lucide-react';
import Notification from '../pages/Notification';


const EditModal = ({ isOpen, onClose, playlistId, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    play_name: '',
    play_url: '',
    play_thumbnail: '',
    play_genre: 'music',
    play_description: '',
  });

  // State untuk notification
  const [notification, setNotification] = useState({
    message: '',
    type: 'success',
    isVisible: false
  });

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

  // Load playlist data ketika modal dibuka
  useEffect(() => {
    if (isOpen && playlistId) {
      setIsLoading(true);
      // Reset notification saat modal dibuka
      setNotification({ message: '', type: 'success', isVisible: false });
      
      fetch(`https://webfmsi.singapoly.com/api/playlist/32`)
        .then((res) => res.json())
        .then((data) => {
          const playlist = data.datas?.find((p) => p.id_play === playlistId);
          if (playlist) {
            setForm({
              play_name: playlist.play_name || '',
              play_url: playlist.play_url || '',
              play_thumbnail: playlist.play_thumbnail || '',
              play_genre: playlist.play_genre || 'music',
              play_description: playlist.play_description || '',
            });
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          showNotification('Gagal memuat data playlist!', 'error');
          setIsLoading(false);
        });
    }
  }, [isOpen, playlistId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validasi: Description wajib diisi
    if (form.play_description.trim() === '') {
      showNotification('Description wajib diisi!', 'error');
      return;
    }

    setIsSubmitting(true);
    // Sembunyikan notifikasi lama saat mulai submit
    setNotification(prev => ({ ...prev, isVisible: false }));

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    // FIX: Gunakan endpoint yang benar sesuai dengan API
    fetch(`https://webfmsi.singapoly.com/api/playlist/update/${playlistId}`, {
      method: 'POST', // FIX: Gunakan POST bukan PUT
      body: formData,
    })
      .then((res) => res.json())
      .then(() => {
        // Panggil onSuccess terlebih dahulu
        onSuccess();
        
        // Tampilkan notifikasi sukses setelah form diupdate
        setTimeout(() => {
          showNotification('Playlist berhasil diupdate!', 'success');
          
          // Tunggu notifikasi muncul, lalu tutup modal
          setTimeout(() => {
            onClose();
          }, 2000); // Beri waktu lebih lama agar user bisa melihat notifikasi
        }, 100); // Delay kecil untuk memastikan UI sudah terupdate
      })
      .catch((err) => {
        console.error(err);
        // Untuk error, tampilkan langsung tanpa delay
        setTimeout(() => {
          showNotification('Gagal mengupdate playlist!', 'error');
        }, 100);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Reset notification saat modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setNotification({ message: '', type: 'success', isVisible: false });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        {/* Close Button */}
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="modal-header">
          <Edit3 size={24} />
          <h1>Edit Playlist</h1>
        </div>

        {/* Modal Content */}
        <div className="modal-content">
          {isLoading ? (
            <div className="modal-loading">
              <div className="loading-spinner"></div>
              <p>Loading playlist data...</p>
            </div>
          ) : (
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
                  <option value="music">Music</option>
                  <option value="song">Song</option>
                  <option value="movie">Movie</option>
                  <option value="education">Education</option>
                  <option value="others">Others</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="play_description"
                  placeholder="Add a description for your playlist..."
                  value={form.play_description}
                  onChange={handleChange}
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Playlist'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Notification Component - Pindah ke bawah agar tidak tabrakan dengan form */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={closeNotification}
      />
    </div>
  );
};

export default EditModal;