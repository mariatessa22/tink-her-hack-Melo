import React, { useState, useEffect } from 'react';
import { Camera, Heart, Frown, Angry, Smile, Calendar, CheckSquare, DollarSign, Star, ChevronLeft, ChevronRight } from 'lucide-react';

// Database helper functions
const DB_KEY = 'melo_journal_data';

const saveToDatabase = (data) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
    console.log('✅ Data saved to database');
    return true;
  } catch (error) {
    console.error('❌ Error saving to database:', error);
    return false;
  }
};

const loadFromDatabase = () => {
  try {
    const data = localStorage.getItem(DB_KEY);
    if (data) {
      console.log('✅ Data loaded from database');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('❌ Error loading from database:', error);
    return null;
  }
};

const clearDatabase = () => {
  try {
    localStorage.removeItem(DB_KEY);
    console.log('✅ Database cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    return false;
  }
};

const MeloJournal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('photojournal');
  const [photos, setPhotos] = useState({
    happy: null,
    sad: null,
    angry: null,
    calm: null
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [plannerData, setPlannerData] = useState({
    dailyTasks: '',
    selfCare: {
      exercise: false,
      meditation: false,
      reading: false,
      sleep: false
    },
    habits: {
      water: [false, false, false, false, false, false, false],
      exercise: [false, false, false, false, false, false, false],
      journal: [false, false, false, false, false, false, false]
    },
    budget: {
      income: '',
      expenses: '',
      savings: ''
    },
    importantDates: ''
  });

  const moods = [
    { id: 'happy', icon: Smile, label: 'Happy Moments', color: '#8fbc8f', description: 'Capture joy ✨' },
    { id: 'sad', icon: Frown, label: 'Reflective Times', color: '#7a9b7a', description: 'Embrace feelings 🌧️' },
    { id: 'angry', icon: Angry, label: 'Release & Let Go', color: '#6b8e6b', description: 'Process emotions 🔥' },
    { id: 'calm', icon: Heart, label: 'Peaceful Moments', color: '#9db89d', description: 'Find serenity 🍃' }
  ];

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateKey = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isToday = (year, month, day) => {
    const today = new Date();
    return today.getFullYear() === year && 
           today.getMonth() === month && 
           today.getDate() === day;
  };

  const toggleDateMark = (year, month, day) => {
    const dateKey = formatDateKey(year, month, day);
    setMarkedDates(prev => {
      const newMarked = { ...prev };
      if (newMarked[dateKey]) {
        delete newMarked[dateKey];
      } else {
        newMarked[dateKey] = {
          note: '',
          emoji: '⭐'
        };
      }
      return newMarked;
    });
  };

  const changeMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Load data from database on component mount
  useEffect(() => {
    const savedData = loadFromDatabase();
    if (savedData) {
      if (savedData.photos) setPhotos(savedData.photos);
      if (savedData.plannerData) setPlannerData(savedData.plannerData);
      if (savedData.markedDates) setMarkedDates(savedData.markedDates);
      console.log('📖 Journal data restored from database');
    }
  }, []);

  // Auto-save data whenever it changes
  useEffect(() => {
    const dataToSave = {
      photos,
      plannerData,
      markedDates,
      lastSaved: new Date().toISOString()
    };
    saveToDatabase(dataToSave);
  }, [photos, plannerData, markedDates]);

  // Export data as JSON file
  const handleExportData = () => {
    const dataToExport = {
      photos,
      plannerData,
      markedDates,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `melo-journal-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    alert('✅ Journal exported successfully!');
  };

  // Import data from JSON file
  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          if (importedData.photos) setPhotos(importedData.photos);
          if (importedData.plannerData) setPlannerData(importedData.plannerData);
          if (importedData.markedDates) setMarkedDates(importedData.markedDates);
          alert('✅ Journal imported successfully!');
        } catch (error) {
          alert('❌ Error importing journal. Please check the file format.');
          console.error('Import error:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  // Clear all data
  const handleClearData = () => {
    if (window.confirm('⚠️ Are you sure you want to clear all journal data? This cannot be undone!')) {
      setPhotos({ happy: null, sad: null, angry: null, calm: null });
      setPlannerData({
        dailyTasks: '',
        selfCare: {
          exercise: false,
          meditation: false,
          reading: false,
          sleep: false
        },
        habits: {
          water: [false, false, false, false, false, false, false],
          exercise: [false, false, false, false, false, false, false],
          journal: [false, false, false, false, false, false, false]
        },
        budget: {
          income: '',
          expenses: '',
          savings: ''
        },
        importantDates: ''
      });
      setMarkedDates({});
      clearDatabase();
      alert('✅ All data cleared!');
    }
  };

  const handlePhotoUpload = (mood, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => ({ ...prev, [mood]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleHabit = (habit, day) => {
    setPlannerData(prev => ({
      ...prev,
      habits: {
        ...prev.habits,
        [habit]: prev.habits[habit].map((val, idx) => idx === day ? !val : val)
      }
    }));
  };

  const toggleSelfCare = (item) => {
    setPlannerData(prev => ({
      ...prev,
      selfCare: { ...prev.selfCare, [item]: !prev.selfCare[item] }
    }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(135deg, #fdfcf0 0%, #f5f3e8 50%, #ede9d9 100%)',
      padding: '2rem',
      fontFamily: '"Cormorant Garamond", "Crimson Text", serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background elements */}
      <div style={{
        position: 'fixed',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        backgroundImage: 'radial-gradient(circle, rgba(143, 188, 143, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-15%',
        left: '-10%',
        width: '600px',
        height: '600px',
        backgroundImage: 'radial-gradient(circle, rgba(214, 232, 214, 0.2) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{ width: '100%', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Header with Logo */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '3rem',
          animation: 'fadeInDown 1s ease-out'
        }}>
          <div style={{
            display: 'inline-block',
            marginBottom: '1rem',
            animation: 'float 3s ease-in-out infinite'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundImage: 'linear-gradient(135deg, #d6e8d6 0%, #8fbc8f 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              boxShadow: '0 8px 24px rgba(85, 107, 47, 0.15)',
              transform: 'rotate(-5deg)'
            }}>
              <Heart size={40} color="#556b2f" fill="#556b2f" />
            </div>
          </div>
          <h1 style={{
            fontSize: '4rem',
            color: '#556b2f',
            margin: '0.5rem 0',
            fontWeight: '600',
            letterSpacing: '0.05em',
            textShadow: '2px 2px 4px rgba(0,0,0,0.05)'
          }}>
            Melo
          </h1>
          <p style={{
            fontSize: '1.3rem',
            color: '#6b8e6b',
            fontStyle: 'italic',
            margin: 0
          }}>
            Your mindful companion
          </p>
          
          {/* Auto-save indicator */}
          <div style={{
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            color: '#8fbc8f'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#8fbc8f',
              borderRadius: '50%',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
            <span>Auto-saving your memories</span>
          </div>
        </div>

        {/* Book Container */}
        <div style={{
          perspective: '2000px',
          display: 'flex',
          justifyContent: 'center',
          marginTop: '2rem'
        }}>
          <div
            onClick={() => !isOpen && setIsOpen(true)}
            style={{
              position: 'relative',
              width: isOpen ? '95vw' : '400px',
              maxWidth: isOpen ? '1800px' : '400px',
              height: '85vh',
              transformStyle: 'preserve-3d',
              transition: 'all 1s cubic-bezier(0.645, 0.045, 0.355, 1)',
              cursor: !isOpen ? 'pointer' : 'default'
            }}
          >
            {!isOpen ? (
              // Closed Book
              <div style={{
                width: '100%',
                height: '100%',
                backgroundImage: 'linear-gradient(135deg, #8fbc8f 0%, #6b8e6b 100%)',
                borderRadius: '12px',
                boxShadow: '20px 20px 60px rgba(85, 107, 47, 0.3), -10px -10px 40px rgba(255, 255, 255, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h60v60H0z" fill="none"/%3E%3Cpath d="M30 15c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15z" fill="rgba(255,255,255,0.03)"/%3E%3C/svg%3E")',
                  opacity: 0.3
                }} />
                
                <h2 style={{
                  fontSize: '4rem',
                  color: '#fdfcf0',
                  margin: '1rem 0',
                  fontFamily: '"Parisienne", cursive',
                  textShadow: '3px 3px 6px rgba(0,0,0,0.2)',
                  position: 'relative',
                  zIndex: 1
                }}>
                  Melo
                </h2>
                
                <div style={{
                  width: '200px',
                  height: '200px',
                  margin: '2rem 0',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
                    {/* Books */}
                    <rect x="60" y="80" width="30" height="60" fill="#fdfcf0" stroke="#556b2f" strokeWidth="2" rx="2"/>
                    <rect x="85" y="70" width="30" height="70" fill="#fdfcf0" stroke="#556b2f" strokeWidth="2" rx="2"/>
                    <rect x="110" y="75" width="30" height="65" fill="#fdfcf0" stroke="#556b2f" strokeWidth="2" rx="2"/>
                    
                    {/* Leaves and plants around books */}
                    <path d="M 50 100 Q 45 95 40 100 Q 45 105 50 100" fill="#d6e8d6" stroke="#556b2f" strokeWidth="1"/>
                    <path d="M 55 90 Q 50 85 45 90 Q 50 95 55 90" fill="#d6e8d6" stroke="#556b2f" strokeWidth="1"/>
                    <path d="M 150 95 Q 155 90 160 95 Q 155 100 150 95" fill="#d6e8d6" stroke="#556b2f" strokeWidth="1"/>
                    <path d="M 145 105 Q 150 100 155 105 Q 150 110 145 105" fill="#d6e8d6" stroke="#556b2f" strokeWidth="1"/>
                    
                    {/* Flowers */}
                    <circle cx="155" cy="85" r="5" fill="#fdfcf0" stroke="#556b2f" strokeWidth="1"/>
                    <circle cx="158" cy="88" r="3" fill="#556b2f"/>
                    <circle cx="42" cy="110" r="5" fill="#fdfcf0" stroke="#556b2f" strokeWidth="1"/>
                    <circle cx="45" cy="113" r="3" fill="#556b2f"/>
                    
                    {/* Coffee beans */}
                    {[...Array(15)].map((_, i) => (
                      <ellipse
                        key={i}
                        cx={70 + (i % 5) * 15}
                        cy={50 + Math.floor(i / 5) * 10}
                        rx="3"
                        ry="5"
                        fill="#556b2f"
                        opacity="0.6"
                        transform={`rotate(${i * 25} ${70 + (i % 5) * 15} ${50 + Math.floor(i / 5) * 10})`}
                      />
                    ))}
                  </svg>
                </div>
                
                {/* Music player controls */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2rem',
                  marginTop: '1rem',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <Heart size={28} color="#fdfcf0" style={{ opacity: 0.8 }}/>
                  <div style={{ fontSize: '2rem', color: '#fdfcf0', opacity: 0.8 }}>⏮</div>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    border: '2px solid #fdfcf0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.8
                  }}>
                    <div style={{ fontSize: '1.5rem', color: '#fdfcf0' }}>⏸</div>
                  </div>
                  <div style={{ fontSize: '2rem', color: '#fdfcf0', opacity: 0.8 }}>⏭</div>
                  <div style={{ fontSize: '1.5rem', color: '#fdfcf0', opacity: 0.8 }}>📻</div>
                </div>
                
                <div style={{
                  marginTop: '2rem',
                  height: '2px',
                  width: '80%',
                  backgroundColor: 'rgba(253, 252, 240, 0.3)',
                  position: 'relative',
                  borderRadius: '2px'
                }}>
                  <div style={{
                    position: 'absolute',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#fdfcf0',
                    borderRadius: '50%',
                    top: '-3px',
                    left: '50%',
                    boxShadow: '0 0 8px rgba(253, 252, 240, 0.6)'
                  }} />
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: '2rem',
                  right: '2rem',
                  color: '#fdfcf0',
                  fontSize: '3rem',
                  opacity: 0.5,
                  animation: 'sparkle 2s ease-in-out infinite'
                }}>
                  ✦
                </div>
                
                <p style={{
                  marginTop: '2rem',
                  color: '#fdfcf0',
                  fontSize: '1.1rem',
                  opacity: 0.9,
                  textAlign: 'center',
                  position: 'relative',
                  zIndex: 1
                }}>
                  Click to open your journal
                </p>
              </div>
            ) : (
              // Open Book
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                gap: '2px',
                backgroundColor: '#556b2f',
                borderRadius: '12px',
                boxShadow: '0 20px 60px rgba(85, 107, 47, 0.3)',
                overflow: 'hidden'
              }}>
                {/* Left Page - Photo Journal */}
                <div style={{
                  flex: 1,
                  backgroundImage: 'linear-gradient(to bottom right, #fdfcf0 0%, #f8f6eb 100%)',
                  padding: '3rem 2.5rem',
                  overflowY: 'auto',
                  borderRadius: '12px 0 0 12px',
                  boxShadow: 'inset -10px 0 20px rgba(0,0,0,0.05)',
                  animation: 'slideInLeft 0.8s ease-out'
                }}>
                  <div style={{
                    borderBottom: '3px dashed #8fbc8f',
                    paddingBottom: '1.5rem',
                    marginBottom: '2rem'
                  }}>
                    <h2 style={{
                      fontSize: '2.5rem',
                      color: '#556b2f',
                      margin: '0 0 0.5rem 0',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <Camera size={32} color="#8fbc8f" />
                      Photo Journal
                    </h2>
                    <p style={{
                      fontSize: '1.1rem',
                      color: '#6b8e6b',
                      margin: 0,
                      fontStyle: 'italic'
                    }}>
                      Capture your emotions through moments
                    </p>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1.5rem'
                  }}>
                    {moods.map((mood, index) => (
                      <div
                        key={mood.id}
                        style={{
                          backgroundColor: '#fdfcf0',
                          borderRadius: '16px',
                          padding: '1.5rem',
                          border: `2px dashed ${mood.color}`,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          transition: 'all 0.3s ease',
                          animation: `fadeInUp 0.6s ease-out ${index * 0.1}s backwards`
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-5px) rotate(1deg)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(85, 107, 47, 0.15)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0) rotate(0deg)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginBottom: '1rem'
                        }}>
                          <mood.icon size={24} color={mood.color} />
                          <div>
                            <h3 style={{
                              fontSize: '1.2rem',
                              color: '#556b2f',
                              margin: 0,
                              fontWeight: '600'
                            }}>
                              {mood.label}
                            </h3>
                            <p style={{
                              fontSize: '0.9rem',
                              color: '#8fbc8f',
                              margin: 0,
                              fontStyle: 'italic'
                            }}>
                              {mood.description}
                            </p>
                          </div>
                        </div>

                        <div style={{
                          position: 'relative',
                          width: '100%',
                          paddingTop: '100%',
                          backgroundImage: photos[mood.id] ? `url(${photos[mood.id]})` : 'none',
                          backgroundColor: photos[mood.id] ? 'transparent' : '#d6e8d6',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderRadius: '8px',
                          border: '3px solid #fdfcf0',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          transform: 'rotate(-2deg)'
                        }}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(mood.id, e)}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              opacity: 0,
                              cursor: 'pointer'
                            }}
                          />
                          {!photos[mood.id] && (
                            <div style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%) rotate(2deg)',
                              textAlign: 'center'
                            }}>
                              <Camera size={32} color="#8fbc8f" />
                              <p style={{
                                fontSize: '0.9rem',
                                color: '#6b8e6b',
                                margin: '0.5rem 0 0 0'
                              }}>
                                Add photo
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Decorative tape */}
                        <div style={{
                          position: 'relative',
                          marginTop: '-10px',
                          height: '20px',
                          backgroundColor: 'rgba(143, 188, 143, 0.3)',
                          borderLeft: '1px solid rgba(85, 107, 47, 0.2)',
                          borderRight: '1px solid rgba(85, 107, 47, 0.2)',
                          transform: 'rotate(2deg)',
                          width: '60%',
                          margin: '-10px auto 0',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }} />
                      </div>
                    ))}
                  </div>

                  {/* Decorative elements */}
                  <div style={{
                    marginTop: '2rem',
                    display: 'flex',
                    justifyContent: 'space-around',
                    opacity: 0.3
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>🌿</span>
                    <span style={{ fontSize: '1.5rem' }}>✨</span>
                    <span style={{ fontSize: '1.5rem' }}>🍃</span>
                  </div>
                </div>

                {/* Right Page - Planner */}
                <div style={{
                  flex: 1,
                  backgroundImage: 'linear-gradient(to bottom left, #fdfcf0 0%, #f8f6eb 100%)',
                  padding: '3rem 2.5rem',
                  overflowY: 'auto',
                  borderRadius: '0 12px 12px 0',
                  boxShadow: 'inset 10px 0 20px rgba(0,0,0,0.05)',
                  animation: 'slideInRight 0.8s ease-out'
                }}>
                  {/* Tab Navigation */}
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '2rem',
                    borderBottom: '2px solid #d6e8d6',
                    paddingBottom: '0.5rem'
                  }}>
                    {[
                      { id: 'planner', icon: CheckSquare, label: 'Daily' },
                      { id: 'selfcare', icon: Heart, label: 'Self-Care' },
                      { id: 'habits', icon: Star, label: 'Habits' },
                      { id: 'budget', icon: DollarSign, label: 'Budget' },
                      { id: 'dates', icon: Calendar, label: 'Dates' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          backgroundColor: activeTab === tab.id ? '#8fbc8f' : 'transparent',
                          color: activeTab === tab.id ? '#fdfcf0' : '#6b8e6b',
                          border: activeTab === tab.id ? '2px solid #556b2f' : '2px solid transparent',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontFamily: 'inherit'
                        }}
                        onMouseEnter={e => {
                          if (activeTab !== tab.id) {
                            e.currentTarget.style.backgroundColor = '#d6e8d6';
                          }
                        }}
                        onMouseLeave={e => {
                          if (activeTab !== tab.id) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <tab.icon size={18} />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Daily Planner */}
                  {activeTab === 'planner' && (
                    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                      <h2 style={{
                        fontSize: '2rem',
                        color: '#556b2f',
                        marginBottom: '1.5rem',
                        fontWeight: '600'
                      }}>
                        No Pressure Daily Planner
                      </h2>
                      <p style={{
                        fontSize: '1rem',
                        color: '#6b8e6b',
                        marginBottom: '1.5rem',
                        fontStyle: 'italic'
                      }}>
                        Just write what feels right today
                      </p>
                      <textarea
                        value={plannerData.dailyTasks}
                        onChange={(e) => setPlannerData(prev => ({ ...prev, dailyTasks: e.target.value }))}
                        placeholder="• Morning coffee ☕
• Take a walk 🌳
• Call a friend 💚
• Whatever brings you peace..."
                        style={{
                          width: '100%',
                          minHeight: '400px',
                          padding: '1.5rem',
                          backgroundColor: '#fdfcf0',
                          border: '2px dashed #8fbc8f',
                          borderRadius: '12px',
                          fontSize: '1.1rem',
                          color: '#000000',
                          fontFamily: '"Crimson Text", serif',
                          resize: 'vertical',
                          lineHeight: '1.8',
                          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.05)'
                        }}
                      />
                    </div>
                  )}

                  {/* Self-Care Checklist */}
                  {activeTab === 'selfcare' && (
                    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                      <h2 style={{
                        fontSize: '2rem',
                        color: '#556b2f',
                        marginBottom: '1.5rem',
                        fontWeight: '600'
                      }}>
                        Self-Care Checklist
                      </h2>
                      <p style={{
                        fontSize: '1rem',
                        color: '#6b8e6b',
                        marginBottom: '2rem',
                        fontStyle: 'italic'
                      }}>
                        Small acts of kindness to yourself
                      </p>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                      }}>
                        {[
                          { id: 'exercise', label: 'Movement & Exercise', emoji: '🏃‍♀️' },
                          { id: 'meditation', label: 'Meditation or Breathing', emoji: '🧘‍♀️' },
                          { id: 'reading', label: 'Reading or Learning', emoji: '📚' },
                          { id: 'sleep', label: '8 Hours of Sleep', emoji: '😴' }
                        ].map(item => (
                          <label
                            key={item.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              padding: '1.5rem',
                              backgroundColor: plannerData.selfCare[item.id] ? '#d6e8d6' : '#fdfcf0',
                              borderRadius: '12px',
                              border: `2px solid ${plannerData.selfCare[item.id] ? '#8fbc8f' : '#d6e8d6'}`,
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              boxShadow: plannerData.selfCare[item.id] ? '0 4px 12px rgba(143, 188, 143, 0.2)' : '0 2px 6px rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = 'translateX(5px)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = 'translateX(0)';
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={plannerData.selfCare[item.id]}
                              onChange={() => toggleSelfCare(item.id)}
                              style={{
                                width: '24px',
                                height: '24px',
                                cursor: 'pointer',
                                accentColor: '#8fbc8f'
                              }}
                            />
                            <span style={{ fontSize: '1.5rem' }}>{item.emoji}</span>
                            <span style={{
                              fontSize: '1.2rem',
                              color: '#556b2f',
                              fontWeight: '500'
                            }}>
                              {item.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Habit Tracker */}
                  {activeTab === 'habits' && (
                    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                      <h2 style={{
                        fontSize: '2rem',
                        color: '#556b2f',
                        marginBottom: '1.5rem',
                        fontWeight: '600'
                      }}>
                        Weekly Habit Tracker
                      </h2>
                      <p style={{
                        fontSize: '1rem',
                        color: '#6b8e6b',
                        marginBottom: '2rem',
                        fontStyle: 'italic'
                      }}>
                        Build your routine, one day at a time
                      </p>
                      {[
                        { id: 'water', label: 'Drink Water', emoji: '💧' },
                        { id: 'exercise', label: 'Exercise', emoji: '💪' },
                        { id: 'journal', label: 'Journal', emoji: '✍️' }
                      ].map(habit => (
                        <div
                          key={habit.id}
                          style={{
                            marginBottom: '2rem',
                            padding: '1.5rem',
                            backgroundColor: '#fdfcf0',
                            borderRadius: '12px',
                            border: '2px dashed #8fbc8f',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginBottom: '1rem'
                          }}>
                            <span style={{ fontSize: '1.5rem' }}>{habit.emoji}</span>
                            <h3 style={{
                              fontSize: '1.3rem',
                              color: '#556b2f',
                              margin: 0,
                              fontWeight: '600'
                            }}>
                              {habit.label}
                            </h3>
                          </div>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '0.75rem'
                          }}>
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                              <div
                                key={idx}
                                onClick={() => toggleHabit(habit.id, idx)}
                                style={{
                                  aspectRatio: '1',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: plannerData.habits[habit.id][idx] ? '#8fbc8f' : '#d6e8d6',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  border: plannerData.habits[habit.id][idx] ? '2px solid #556b2f' : '2px solid transparent',
                                  boxShadow: plannerData.habits[habit.id][idx] ? '0 4px 8px rgba(143, 188, 143, 0.3)' : 'none'
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.transform = 'scale(1.1)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                }}
                              >
                                <span style={{
                                  fontSize: '0.9rem',
                                  color: plannerData.habits[habit.id][idx] ? '#fdfcf0' : '#6b8e6b',
                                  fontWeight: '600'
                                }}>
                                  {day}
                                </span>
                                {plannerData.habits[habit.id][idx] && (
                                  <span style={{ fontSize: '1.2rem', marginTop: '0.25rem' }}>✓</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Budget Tracker */}
                  {activeTab === 'budget' && (
                    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                      <h2 style={{
                        fontSize: '2rem',
                        color: '#556b2f',
                        marginBottom: '1.5rem',
                        fontWeight: '600'
                      }}>
                        Budget Tracker
                      </h2>
                      <p style={{
                        fontSize: '1rem',
                        color: '#6b8e6b',
                        marginBottom: '2rem',
                        fontStyle: 'italic'
                      }}>
                        Simple money mindfulness
                      </p>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                      }}>
                        {[
                          { id: 'income', label: 'Income', emoji: '💰', color: '#8fbc8f' },
                          { id: 'expenses', label: 'Expenses', emoji: '💸', color: '#b8977f' },
                          { id: 'savings', label: 'Savings', emoji: '🐷', color: '#9db89d' }
                        ].map(item => (
                          <div
                            key={item.id}
                            style={{
                              padding: '1.5rem',
                              backgroundColor: '#fdfcf0',
                              borderRadius: '12px',
                              border: `2px solid ${item.color}`,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}
                          >
                            <label style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              marginBottom: '0.75rem'
                            }}>
                              <span style={{ fontSize: '1.5rem' }}>{item.emoji}</span>
                              <span style={{
                                fontSize: '1.2rem',
                                color: '#556b2f',
                                fontWeight: '600'
                              }}>
                                {item.label}
                              </span>
                            </label>
                            <input
                              type="text"
                              value={plannerData.budget[item.id]}
                              onChange={(e) => setPlannerData(prev => ({
                                ...prev,
                                budget: { ...prev.budget, [item.id]: e.target.value }
                              }))}
                              placeholder="$0.00"
                              style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1.3rem',
                                color: '#000000',
                                backgroundColor: '#d6e8d6',
                                border: 'none',
                                borderRadius: '8px',
                                fontFamily: '"Crimson Text", serif',
                                fontWeight: '600',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Important Dates */}
                  {activeTab === 'dates' && (
                    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                      <h2 style={{
                        fontSize: '2rem',
                        color: '#556b2f',
                        marginBottom: '1.5rem',
                        fontWeight: '600'
                      }}>
                        Important Dates
                      </h2>
                      <p style={{
                        fontSize: '1rem',
                        color: '#6b8e6b',
                        marginBottom: '1.5rem',
                        fontStyle: 'italic'
                      }}>
                        Remember what matters
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        gap: '1.5rem',
                        alignItems: 'flex-start'
                      }}>
                        <textarea
                          value={plannerData.importantDates}
                          onChange={(e) => setPlannerData(prev => ({ ...prev, importantDates: e.target.value }))}
                          placeholder="📅 Mom's birthday - March 15
🎉 Anniversary - June 20
✈️ Vacation - July 1-10
🎓 Graduation - May 30"
                          style={{
                            flex: 1,
                            minHeight: '500px',
                            padding: '1.5rem',
                            backgroundColor: '#fdfcf0',
                            border: '2px dashed #8fbc8f',
                            borderRadius: '12px',
                            fontSize: '1.1rem',
                            color: '#000000',
                            fontFamily: '"Crimson Text", serif',
                            resize: 'vertical',
                            lineHeight: '1.8',
                            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.05)'
                          }}
                        />
                        
                        {/* Interactive Calendar */}
                        <div style={{
                          width: '320px',
                          backgroundColor: '#fdfcf0',
                          borderRadius: '12px',
                          padding: '1.5rem',
                          border: '2px solid #8fbc8f',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          animation: 'slideInRight 0.6s ease-out 0.2s backwards'
                        }}>
                          {/* Calendar Header */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '1.5rem'
                          }}>
                            <button
                              onClick={() => changeMonth(-1)}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d6e8d6'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <ChevronLeft size={20} color="#556b2f" />
                            </button>
                            
                            <div style={{ textAlign: 'center' }}>
                              <h3 style={{
                                fontSize: '1.3rem',
                                color: '#556b2f',
                                margin: 0,
                                fontWeight: '600'
                              }}>
                                {monthNames[currentMonth.getMonth()]}
                              </h3>
                              <p style={{
                                fontSize: '0.9rem',
                                color: '#8fbc8f',
                                margin: '0.25rem 0 0 0'
                              }}>
                                {currentMonth.getFullYear()}
                              </p>
                            </div>
                            
                            <button
                              onClick={() => changeMonth(1)}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d6e8d6'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <ChevronRight size={20} color="#556b2f" />
                            </button>
                          </div>
                          
                          {/* Day names */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '0.25rem',
                            marginBottom: '0.5rem'
                          }}>
                            {dayNames.map(day => (
                              <div
                                key={day}
                                style={{
                                  textAlign: 'center',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  color: '#8fbc8f',
                                  padding: '0.5rem 0'
                                }}
                              >
                                {day}
                              </div>
                            ))}
                          </div>
                          
                          {/* Calendar days */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '0.25rem'
                          }}>
                            {/* Empty cells for days before month starts */}
                            {[...Array(getFirstDayOfMonth(currentMonth))].map((_, i) => (
                              <div key={`empty-${i}`} style={{ aspectRatio: '1' }} />
                            ))}
                            
                            {/* Actual days */}
                            {[...Array(getDaysInMonth(currentMonth))].map((_, i) => {
                              const day = i + 1;
                              const year = currentMonth.getFullYear();
                              const month = currentMonth.getMonth();
                              const dateKey = formatDateKey(year, month, day);
                              const isMarked = markedDates[dateKey];
                              const isTodayDate = isToday(year, month, day);
                              
                              return (
                                <div
                                  key={day}
                                  onClick={() => toggleDateMark(year, month, day)}
                                  style={{
                                    aspectRatio: '1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.85rem',
                                    fontWeight: isTodayDate ? '700' : '500',
                                    color: isMarked ? '#fdfcf0' : '#556b2f',
                                    backgroundColor: isMarked ? '#8fbc8f' : (isTodayDate ? '#d6e8d6' : 'transparent'),
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    border: isTodayDate && !isMarked ? '2px solid #8fbc8f' : 'none',
                                    position: 'relative'
                                  }}
                                  onMouseEnter={e => {
                                    if (!isMarked) {
                                      e.currentTarget.style.backgroundColor = '#e8f4e8';
                                    }
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                  }}
                                  onMouseLeave={e => {
                                    if (!isMarked) {
                                      e.currentTarget.style.backgroundColor = isTodayDate ? '#d6e8d6' : 'transparent';
                                    }
                                    e.currentTarget.style.transform = 'scale(1)';
                                  }}
                                >
                                  <span>{day}</span>
                                  {isMarked && (
                                    <div style={{
                                      position: 'absolute',
                                      top: '-2px',
                                      right: '-2px',
                                      fontSize: '0.7rem'
                                    }}>
                                      {isMarked.emoji}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Legend */}
                          <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            backgroundColor: '#d6e8d6',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            color: '#556b2f'
                          }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600' }}>
                              💡 Quick tip:
                            </p>
                            <p style={{ margin: 0, lineHeight: '1.5' }}>
                              Click any date to mark it as important. Click again to unmark.
                            </p>
                          </div>
                          
                          {/* Today's date display */}
                          <div style={{
                            marginTop: '1rem',
                            textAlign: 'center',
                            fontSize: '0.9rem',
                            color: '#6b8e6b',
                            fontStyle: 'italic'
                          }}>
                            Today: {new Date().toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {isOpen && (
          <div style={{
            textAlign: 'center',
            marginTop: '2rem',
            animation: 'fadeIn 1s ease-out 0.5s backwards'
          }}>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                padding: '1rem 2rem',
                backgroundImage: 'linear-gradient(135deg, #8fbc8f 0%, #6b8e6b 100%)',
                color: '#fdfcf0',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(85, 107, 47, 0.2)',
                transition: 'all 0.3s ease',
                fontFamily: 'inherit'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(85, 107, 47, 0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(85, 107, 47, 0.2)';
              }}
            >
              Close Journal
            </button>
            
            {/* Data Management Buttons */}
            <div style={{
              marginTop: '1.5rem',
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={handleExportData}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#d6e8d6',
                  color: '#556b2f',
                  border: '2px solid #8fbc8f',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#8fbc8f';
                  e.currentTarget.style.color = '#fdfcf0';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#d6e8d6';
                  e.currentTarget.style.color = '#556b2f';
                }}
              >
                📥 Export Backup
              </button>
              
              <label
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#d6e8d6',
                  color: '#556b2f',
                  border: '2px solid #8fbc8f',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'inherit',
                  display: 'inline-block'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#8fbc8f';
                  e.currentTarget.style.color = '#fdfcf0';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#d6e8d6';
                  e.currentTarget.style.color = '#556b2f';
                }}
              >
                📤 Import Backup
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  style={{ display: 'none' }}
                />
              </label>
              
              <button
                onClick={handleClearData}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#fdfcf0',
                  color: '#b8977f',
                  border: '2px solid #b8977f',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#b8977f';
                  e.currentTarget.style.color = '#fdfcf0';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#fdfcf0';
                  e.currentTarget.style.color = '#b8977f';
                }}
              >
                🗑️ Clear All Data
              </button>
            </div>
            
            <p style={{
              marginTop: '1rem',
              fontSize: '0.85rem',
              color: '#8fbc8f',
              fontStyle: 'italic'
            }}>
              💾 Your journal auto-saves in your browser
            </p>
          </div>
        )}
      </div>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Crimson+Text:wght@400;600&family=Parisienne&display=swap');
          
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-100px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(100px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              box-shadow: 20px 20px 60px rgba(85, 107, 47, 0.3), -10px -10px 40px rgba(255, 255, 255, 0.2);
            }
            50% {
              box-shadow: 20px 20px 80px rgba(85, 107, 47, 0.4), -10px -10px 50px rgba(255, 255, 255, 0.3);
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          
          @keyframes sparkle {
            0%, 100% {
              opacity: 0.3;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.2);
            }
          }
          
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #d6e8d6;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #8fbc8f;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #6b8e6b;
          }
        `}
      </style>
    </div>
  );
};

export default MeloJournal;

