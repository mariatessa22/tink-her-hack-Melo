import React, { useState } from 'react';
import { Image, Heart, Star, Camera } from 'lucide-react';

export default function Journal() {
  const [happyPhoto, setHappyPhoto] = useState(null);
  const [proudPhotos, setProudPhotos] = useState([]);
  const [journalEntries, setJournalEntries] = useState({
    proudMoment: '',
    favoritePerson: ''
  });

  const handleImageUpload = (event, type) => {
    const files = Array.from(event.target.files);
    
    if (type === 'happy') {
      setHappyPhoto(URL.createObjectURL(files[0]));
    } else if (type === 'proud') {
      const newPhotos = files.map(file => ({
        id: Date.now() + Math.random(),
        url: URL.createObjectURL(file),
        caption: ''
      }));
      setProudPhotos([...proudPhotos, ...newPhotos]);
    }
  };

  const updatePhotoCaption = (photoId, caption) => {
    setProudPhotos(proudPhotos.map(photo => 
      photo.id === photoId ? { ...photo, caption } : photo
    ));
  };

  const removePhoto = (photoId, type) => {
    if (type === 'happy') {
      setHappyPhoto(null);
    } else {
      setProudPhotos(proudPhotos.filter(photo => photo.id !== photoId));
    }
  };

  const handleEntryChange = (field, value) => {
    setJournalEntries(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="journal-container">
      {/* 1. HAPPY MOMENT PHOTO */}
      <div className="scrapbook-card photo-card">
        <div className="card-header">
          <Image size={20} />
          <h3>A Happy Moment</h3>
        </div>
        
        <div className="photo-upload-area">
          {happyPhoto ? (
            <div className="polaroid-container">
              <div className="polaroid">
                <img src={happyPhoto} alt="Happy memory" className="polaroid-photo" />
                <div className="polaroid-caption">Happy Moment</div>
                <button className="remove-photo" onClick={() => removePhoto(null, 'happy')}>×</button>
              </div>
            </div>
          ) : (
            <>
              <input 
                type="file" 
                accept="image/*" 
                id="happy-photo-upload" 
                onChange={(e) => handleImageUpload(e, 'happy')} 
                hidden 
              />
              <label htmlFor="happy-photo-upload" className="upload-label">
                <Camera size={24} />
                <span>Add Photo</span>
              </label>
            </>
          )}
        </div>
      </div>

      {/* 2. PROUD MOMENT - With Multiple Photos */}
      <div className="scrapbook-card proud-card">
        <div className="card-header">
          <Star size={20} />
          <h3>Proud Moments</h3>
        </div>
        
        {/* Photo Gallery */}
        <div className="polaroid-gallery">
          {proudPhotos.map((photo) => (
            <div key={photo.id} className="polaroid-container">
              <div className="polaroid">
                <img src={photo.url} alt="Proud moment" className="polaroid-photo" />
                <input
                  type="text"
                  placeholder="Add a caption..."
                  value={photo.caption}
                  onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                  className="polaroid-caption-input"
                />
                <button className="remove-photo" onClick={() => removePhoto(photo.id, 'proud')}>×</button>
              </div>
            </div>
          ))}
          
          {/* Upload Button */}
          <div className="polaroid-container upload-placeholder">
            <input 
              type="file" 
              accept="image/*" 
              multiple
              id="proud-photos-upload" 
              onChange={(e) => handleImageUpload(e, 'proud')} 
              hidden 
            />
            <label htmlFor="proud-photos-upload" className="upload-label polaroid-upload">
              <Camera size={32} />
              <span>Add Photos</span>
            </label>
          </div>
        </div>

        {/* Proud Moment Text Entry */}
        <textarea 
          placeholder="Tell us about your proud moments..."
          value={journalEntries.proudMoment}
          onChange={(e) => handleEntryChange('proudMoment', e.target.value)}
          className="proud-textarea"
        />
      </div>

      {/* 3. FAVORITE PERSON - No Photos */}
      <div className="scrapbook-card">
        <div className="card-header">
          <Heart size={20} />
          <h3>Favorite Person</h3>
        </div>
        <textarea 
          placeholder="Who made your day better?"
          value={journalEntries.favoritePerson}
          onChange={(e) => handleEntryChange('favoritePerson', e.target.value)}
        />
      </div>

      <style jsx>{`
        .journal-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .scrapbook-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid #f0f0f0;
        }

        .photo-card, .proud-card {
          background: linear-gradient(145deg, #ffffff, #f8f8f8);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          color: #4a5568;
        }

        .card-header h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 32px;
          border: 2px dashed #cbd5e0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #718096;
        }

        .upload-label:hover {
          border-color: #4299e1;
          color: #4299e1;
          background: #ebf8ff;
        }

        .polaroid-upload {
          min-height: 200px;
          padding: 20px;
        }

        /* Polaroid Styles */
        .polaroid-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 24px;
          margin-bottom: 24px;
        }

        .polaroid-container {
          position: relative;
          transition: transform 0.3s ease;
        }

        .polaroid-container:hover {
          transform: translateY(-8px);
        }

        .polaroid {
          background: white;
          padding: 12px 12px 20px 12px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          border-radius: 4px;
          position: relative;
          transform: rotate(0deg);
          transition: all 0.3s ease;
        }

        .polaroid:nth-child(even) {
          transform: rotate(2deg);
        }

        .polaroid:nth-child(odd) {
          transform: rotate(-1deg);
        }

        .polaroid:hover {
          transform: rotate(0deg) scale(1.05);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
        }

        .polaroid-photo {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 4px;
          margin-bottom: 12px;
        }

        .polaroid-caption {
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          color: #4a5568;
          text-align: center;
          padding: 4px 0;
          font-style: italic;
        }

        .polaroid-caption-input {
          width: 100%;
          border: none;
          border-bottom: 1px dashed #cbd5e0;
          padding: 8px 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          text-align: center;
          background: transparent;
          outline: none;
        }

        .polaroid-caption-input:focus {
          border-bottom-color: #4299e1;
        }

        .remove-photo {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #fc8181;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: all 0.3s ease;
          opacity: 0;
        }

        .polaroid-container:hover .remove-photo {
          opacity: 1;
        }

        .remove-photo:hover {
          background: #f56565;
          transform: scale(1.1);
        }

        textarea {
          width: 100%;
          min-height: 100px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-family: inherit;
          font-size: 1rem;
          resize: vertical;
          transition: all 0.3s ease;
        }

        textarea:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
        }

        .proud-textarea {
          margin-top: 20px;
        }

        .upload-placeholder {
          min-height: 240px;
        }

        @media (max-width: 768px) {
          .journal-container {
            padding: 12px;
          }
          
          .polaroid-gallery {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}