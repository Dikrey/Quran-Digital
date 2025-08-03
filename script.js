
        const QURAN_API_URL = 'https://equran.id/api/v2';
        const PRAYERS_API_URL = 'https://equran.id/api/doa';
        

        let currentSurah = null;
        let allSurahs = [];
        let allPrayers = [];
        let filteredSurahs = [];
        let filteredTafsir = [];
        let filteredPrayers = [];
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        let currentAudioPlayers = [];
        let currentFullAudio = null;
let scrollInterval;
let currentSpeed = 'normal';

const speedSettings = {
  slow: [1, 50],
  normal: [2, 30], 
  fast: [6, 10]
};

function startAutoScroll(speed = 'normal') {
  stopAutoScroll();
  
  currentSpeed = speed;
  const [scrollStep, delay] = speedSettings[speed];
  
  document.querySelectorAll('.scroll-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  scrollInterval = setInterval(() => {
    const currentPosition = window.scrollY;
    const maxPosition = document.body.scrollHeight - window.innerHeight;
    
    // Smooth scroll menggunakan requestAnimationFrame
    const smoothScroll = () => {
      window.scrollBy(0, scrollStep);
      
      if (window.scrollY < maxPosition && window.scrollY === currentPosition + scrollStep) {
        requestAnimationFrame(smoothScroll);
      }
    };
    
    requestAnimationFrame(smoothScroll);
    
    // Hentikan saat mencapai bawah
    if (window.scrollY >= maxPosition - 10) {
      stopAutoScroll();
      console.log("Auto scroll selesai");
    }
  }, delay);
}

function stopAutoScroll() {
  clearInterval(scrollInterval);
  document.querySelectorAll('.scroll-btn').forEach(btn => {
    btn.classList.remove('active');
  });
}

// Tambahan: Keyboard shortcut
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' && e.ctrlKey) {
    startAutoScroll(currentSpeed);
  }
  if (e.key === 'Escape') {
    stopAutoScroll();
  }
});

        
        // DOM elements
        const themeToggle = document.getElementById('theme-toggle');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const mainContent = document.getElementById('main-content');
        const sections = {
            home: document.getElementById('home'),
            quran: document.getElementById('quran'),
            tafsir: document.getElementById('tafsir'),
            prayers: document.getElementById('prayers'),
            favorites: document.getElementById('favorites'),
            surahDetail: document.getElementById('surah-detail'),
            tafsirDetail: document.getElementById('tafsir-detail'),
            prayerDetail: document.getElementById('prayer-detail')
        };
        
        // Initialize the page
        document.addEventListener('DOMContentLoaded', () => {
            // Check for saved theme preference
            if (localStorage.getItem('darkMode') === 'enabled') {
                document.body.classList.add('dark-mode');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
            
            // Show home by default
            showHome();
            
            // Load data
            loadSurahs();
            loadPrayers();
            
           mobileMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileMenu.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-actions')) {
        mobileMenu.classList.remove('active');
    }
});
            });

        
        // Theme toggle functionality
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('darkMode', 'enabled');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                localStorage.setItem('darkMode', 'disabled');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            }
        });
        
        // Navigation functions
        function showSection(section) {
            // Hide all sections
            Object.values(sections).forEach(sec => {
                sec.style.display = 'none';
            });
            
            // Show the requested section
            section.style.display = 'block';
            
            // Close mobile menu
            mobileMenu.classList.remove('active');
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        function showHome() {
            showSection(sections.home);
            updateActiveNav('home');
        }
        
        function showQuran() {
            showSection(sections.quran);
            updateActiveNav('quran');
        }
        
        function showTafsir() {
            showSection(sections.tafsir);
            updateActiveNav('tafsir');
        }
        
        function showPrayers() {
            showSection(sections.prayers);
            updateActiveNav('prayers');
        }
        
        function showFavorites() {
            showSection(sections.favorites);
            updateActiveNav('favorites');
            updateFavoritesDisplay();
        }
        
        function updateActiveNav(section) {
            const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu-links a');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.textContent.toLowerCase().includes(section) || 
                    (link.querySelector('i') && link.querySelector('i').className.includes(section))) {
                    link.classList.add('active');
                }
            });
        }
        
        // Load all surahs
        async function loadSurahs() {
            const loadingElement = document.getElementById('loading-quran');
            const quranListElement = document.getElementById('quran-list');
            
            loadingElement.style.display = 'flex';
            quranListElement.innerHTML = '';
            
            try {
                const response = await fetch(`${QURAN_API_URL}/surat`);
                const data = await response.json();
                
                if (data.code === 200) {
                    allSurahs = data.data;
                    filteredSurahs = [...data.data];
                    filteredTafsir = [...data.data];
                    renderSurahsList(data.data);
                    
                    // Also render the same list for tafsir
                    renderTafsirList(data.data);
                } else {
                    quranListElement.innerHTML = `<p>Error loading surahs: ${data.message}</p>`;
                }
            } catch (error) {
                quranListElement.innerHTML = `<p>Error: ${error.message}</p>`;
            } finally {
                loadingElement.style.display = 'none';
            }
        }
        
        // Load prayers
        async function loadPrayers() {
            const loadingElement = document.getElementById('loading-prayers');
            const prayersListElement = document.getElementById('prayers-list');
            
            loadingElement.style.display = 'flex';
            prayersListElement.innerHTML = '';
            
            try {
                const response = await fetch(PRAYERS_API_URL);
                const data = await response.json();
                
                if (data.status === 'success') {
                    allPrayers = data.data;
                    filteredPrayers = [...data.data];
                    renderPrayersList(data.data);
                } else {
                    prayersListElement.innerHTML = `<p>Error loading prayers: ${data.message}</p>`;
                }
            } catch (error) {
                prayersListElement.innerHTML = `<p>Error: ${error.message}</p>`;
            } finally {
                loadingElement.style.display = 'none';
            }
        }
        
        // Search surahs
        function searchSurahs() {
            const searchTerm = document.getElementById('quran-search').value.toLowerCase();
            
            if (searchTerm === '') {
                filteredSurahs = [...allSurahs];
            } else {
                filteredSurahs = allSurahs.filter(surah => 
                    surah.namaLatin.toLowerCase().includes(searchTerm) || 
                    surah.arti.toLowerCase().includes(searchTerm) ||
                    surah.nomor.toString().includes(searchTerm)
                );
            }
            
            renderSurahsList(filteredSurahs);
        }
        
        // Search tafsir
        function searchTafsir() {
            const searchTerm = document.getElementById('tafsir-search').value.toLowerCase();
            
            if (searchTerm === '') {
                filteredTafsir = [...allSurahs];
            } else {
                filteredTafsir = allSurahs.filter(surah => 
                    surah.namaLatin.toLowerCase().includes(searchTerm) || 
                    surah.arti.toLowerCase().includes(searchTerm) ||
                    surah.nomor.toString().includes(searchTerm)
            );
            }
            
            renderTafsirList(filteredTafsir);
        }
        
        // Search prayers
        function searchPrayers() {
            const searchTerm = document.getElementById('prayers-search').value.toLowerCase();
            
            if (searchTerm === '') {
                filteredPrayers = [...allPrayers];
            } else {
                filteredPrayers = allPrayers.filter(prayer => 
                    prayer.nama.toLowerCase().includes(searchTerm) || 
                    prayer.grup.toLowerCase().includes(searchTerm) ||
                    prayer.idn.toLowerCase().includes(searchTerm) ||
                    prayer.tag.some(tag => tag.toLowerCase().includes(searchTerm)))
            }
            
            renderPrayersList(filteredPrayers);
        }
        
        // Render surahs list for Quran section
        function renderSurahsList(surahs) {
            const quranListElement = document.getElementById('quran-list');
            quranListElement.innerHTML = '';
            
            if (surahs.length === 0) {
                quranListElement.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>No surahs found</h3>
                        <p>Try a different search term</p>
                    </div>
                `;
                return;
            }
            
            surahs.forEach(surah => {
                const isFavorite = favorites.some(fav => fav.type === 'surah' && fav.id === surah.nomor);
                const surahCard = document.createElement('div');
                surahCard.className = `card ${isFavorite ? 'favorite' : ''}`;
                surahCard.innerHTML = `
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                            onclick="toggleFavorite('surah', ${surah.nomor}, event)">
                        <i class="fas fa-heart"></i>
                    </button>
                    <div class="card-header">
                        <div class="card-number">${surah.nomor}</div>
                        <div class="surah-name">
                            <div class="surah-name-arabic arabic">${surah.nama}</div>
                            <div class="surah-name-latin">${surah.namaLatin}</div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="info-item">
                            <span class="info-label">Ayat</span>
                            <span>${surah.jumlahAyat}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Revelation</span>
                            <span>${surah.tempatTurun}</span>
                        </div>
                        <button class="btn btn-read" onclick="showSurahDetail(${surah.nomor}, event)">
                            <i class="fas fa-book-open"></i> Read Surah
                        </button>
                    </div>
                `;
                
                quranListElement.appendChild(surahCard);
            });
        }
        
        // Render surahs list for Tafsir section
        function renderTafsirList(surahs) {
            const tafsirListElement = document.getElementById('tafsir-list');
            tafsirListElement.innerHTML = '';
            
            if (surahs.length === 0) {
                tafsirListElement.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>No surahs found</h3>
                        <p>Try a different search term</p>
                    </div>
                `;
                return;
            }
            
            surahs.forEach(surah => {
                const isFavorite = favorites.some(fav => fav.type === 'tafsir' && fav.id === surah.nomor);
                const tafsirCard = document.createElement('div');
                tafsirCard.className = `card ${isFavorite ? 'favorite active' : ''}`;
                tafsirCard.innerHTML = `
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                            onclick="toggleFavorite('tafsir', ${surah.nomor}, event)">
                        <i class="fas fa-heart"></i>
                    </button>
                    <div class="card-header">
                        <div class="card-number">${surah.nomor}</div>
                        <div class="surah-name">
                            <div class="surah-name-arabic arabic">${surah.nama}</div>
                            <div class="surah-name-latin">${surah.namaLatin}</div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="info-item">
                            <span class="info-label">Ayat</span>
                            <span>${surah.jumlahAyat}</span>
                        </div>
                        <button class="btn" onclick="showTafsirDetail(${surah.nomor}, event)" style="width: 100%; margin-top: 1rem;">
                            <i class="fas fa-graduation-cap"></i> View Tafsir
                        </button>
                    </div>
                `;
                
                tafsirListElement.appendChild(tafsirCard);
            });
        }
        
        // Render prayers list
        function renderPrayersList(prayers) {
            const prayersListElement = document.getElementById('prayers-list');
            prayersListElement.innerHTML = '';
            
            if (prayers.length === 0) {
                prayersListElement.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>No prayers found</h3>
                        <p>Try a different search term</p>
                    </div>
                `;
                return;
            }
            
            prayers.forEach(prayer => {
                const isFavorite = favorites.some(fav => fav.type === 'prayer' && fav.id === prayer.id);
                const prayerCard = document.createElement('div');
                prayerCard.className = `card ${isFavorite ? 'favorite active' : ''}`;
                prayerCard.innerHTML = `
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                            onclick="toggleFavorite('prayer', ${prayer.id}, event)">
                        <i class="fas fa-heart"></i>
                    </button>
                    <div class="card-header">
                        <div class="card-number">${prayer.id}</div>
                        <div class="surah-name">
                            <div class="surah-name-latin">${prayer.nama}</div>
                            <div class="prayer-group">
                                <i class="fas fa-tag"></i>
                                <span>${prayer.grup}</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="prayer-arabic arabic">${prayer.ar}</div>
                        <button class="btn" onclick="showPrayerDetail(${prayer.id}, event)" style="width: 100%; margin-top: 1rem;">
                            <i class="fas fa-eye"></i> View Prayer
                        </button>
                    </div>
                `;
                
                prayersListElement.appendChild(prayerCard);
            });
        }
        
        // Toggle favorite
        function toggleFavorite(type, id, event) {
            if (event) event.stopPropagation();
            
            const index = favorites.findIndex(fav => fav.type === type && fav.id === id);
            if (index === -1) {
                favorites.push({ type, id });
                if (event) {
                    event.target.classList.add('active');
                    event.target.closest('.card').classList.add('favorite', 'active');
                    
                    // Pulse animation
                    event.target.style.animation = 'pulse 0.5s ease';
                    setTimeout(() => {
                        event.target.style.animation = '';
                    }, 500);
                }
            } else {
                favorites.splice(index, 1);
                if (event) {
                    event.target.classList.remove('active');
                    event.target.closest('.card').classList.remove('favorite', 'active');
                }
            }
            
            // Save to localStorage
            localStorage.setItem('favorites', JSON.stringify(favorites));
            
            // Update favorites display if on favorites page
            if (sections.favorites.style.display === 'block') {
                updateFavoritesDisplay();
            }
        }
        
        // Update favorites display
        function updateFavoritesDisplay() {
            const favoritesListElement = document.getElementById('favorites-list');
            const favoritesEmptyElement = document.getElementById('favorites-empty');
            
            if (favorites.length === 0) {
                favoritesEmptyElement.style.display = 'block';
                favoritesListElement.innerHTML = '';
                return;
            }
            
            favoritesEmptyElement.style.display = 'none';
            favoritesListElement.innerHTML = '';
            
            favorites.forEach(fav => {
                let card;
                
                if (fav.type === 'surah') {
                    const surah = allSurahs.find(s => s.nomor === fav.id);
                    if (!surah) return;
                    
                    card = document.createElement('div');
                    card.className = 'card favorite active';
                    card.innerHTML = `
                        <button class="favorite-btn active" onclick="toggleFavorite('surah', ${surah.nomor}, event)">
                            <i class="fas fa-heart"></i>
                        </button>
                        <div class="card-header">
                            <div class="card-number">${surah.nomor}</div>
                            <div class="surah-name">
                                <div class="surah-name-arabic arabic">${surah.nama}</div>
                                <div class="surah-name-latin">${surah.namaLatin}</div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="info-item">
                                <span class="info-label">Ayat</span>
                                <span>${surah.jumlahAyat}</span>
                            </div>
                            <button class="btn btn-read" onclick="showSurahDetail(${surah.nomor}, event)">
                                <i class="fas fa-book-open"></i> Read Surah
                            </button>
                        </div>
                    `;
                } else if (fav.type === 'tafsir') {
                    const surah = allSurahs.find(s => s.nomor === fav.id);
                    if (!surah) return;
                    
                    card = document.createElement('div');
                    card.className = 'card favorite active';
                    card.innerHTML = `
                        <button class="favorite-btn active" onclick="toggleFavorite('tafsir', ${surah.nomor}, event)">
                            <i class="fas fa-heart"></i>
                        </button>
                        <div class="card-header">
                            <div class="card-number">${surah.nomor}</div>
                            <div class="surah-name">
                                <div class="surah-name-arabic arabic">${surah.nama}</div>
                                <div class="surah-name-latin">${surah.namaLatin}</div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="info-item">
                                <span class="info-label">Ayat</span>
                                <span>${surah.jumlahAyat}</span>
                            </div>
                            <button class="btn" onclick="showTafsirDetail(${surah.nomor}, event)" style="width: 100%; margin-top: 1rem;">
                                <i class="fas fa-graduation-cap"></i> View Tafsir
                            </button>
                        </div>
                    `;
                } else if (fav.type === 'prayer') {
                    const prayer = allPrayers.find(p => p.id === fav.id);
                    if (!prayer) return;
                    
                    card = document.createElement('div');
                    card.className = 'card favorite active';
                    card.innerHTML = `
                        <button class="favorite-btn active" onclick="toggleFavorite('prayer', ${prayer.id}, event)">
                            <i class="fas fa-heart"></i>
                        </button>
                        <div class="card-header">
                            <div class="card-number">${prayer.id}</div>
                            <div class="surah-name">
                                <div class="surah-name-latin">${prayer.nama}</div>
                                <div class="prayer-group">
                                    <i class="fas fa-tag"></i>
                                    <span>${prayer.grup}</span>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="prayer-arabic arabic">${prayer.ar}</div>
                            <button class="btn" onclick="showPrayerDetail(${prayer.id}, event)" style="width: 100%; margin-top: 1rem;">
                                <i class="fas fa-eye"></i> View Prayer
                            </button>
                        </div>
                    `;
                }
                
                if (card) {
                    favoritesListElement.appendChild(card);
                }
            });
        }
        
        // Show surah detail
        async function showSurahDetail(surahNumber, event) {
            if (event) event.stopPropagation();
            
            // Hide other sections and show detail
            showSection(sections.surahDetail);
            
            const loadingElement = document.getElementById('loading-surah-detail');
            const detailElement = document.getElementById('surah-detail-content');
            
            loadingElement.style.display = 'flex';
            detailElement.innerHTML = '';
            
            try {
                // Stop any currently playing audio
                stopAllAudio();
                
                // Check if we already have this surah loaded
                if (currentSurah && currentSurah.nomor === surahNumber) {
                    renderSurahDetail(currentSurah);
                    return;
                }
                
                // Fetch surah detail
                const response = await fetch(`${QURAN_API_URL}/surat/${surahNumber}`);
                const data = await response.json();
                
                if (data.code === 200) {
                    currentSurah = data.data;
                    renderSurahDetail(data.data);
                } else {
                    detailElement.innerHTML = `<p>Error loading surah detail</p>`;
                }
            } catch (error) {
                detailElement.innerHTML = `<p>Error: ${error.message}</p>`;
            } finally {
                loadingElement.style.display = 'none';
            }
        }
        
        // Render surah detail
        function renderSurahDetail(surah) {
            const detailElement = document.getElementById('surah-detail-content');
            
            // Build ayat list
            const ayatList = surah.ayat.map(ayat => `
                <div class="ayat-item">
                    <div class="ayat-number">${ayat.nomorAyat}</div>
                    <div class="ayat-arabic arabic">${ayat.teksArab}</div>
                    <div class="ayat-translation">
                        <strong>Translation:</strong> ${ayat.teksIndonesia}
                    </div>
                    ${ayat.audio ? renderAudioPlayers(ayat.audio, ayat.nomorAyat) : ''}
                </div>
            `).join('');
            
            // Build full audio players
            const fullAudioPlayers = surah.audioFull ? renderFullAudioPlayers(surah.audioFull) : '';
            
            // Check if this surah is favorited
            const isFavorite = favorites.some(fav => fav.type === 'surah' && fav.id === surah.nomor);
            
            // Render the complete detail
            detailElement.innerHTML = `
                <div class="detail-header">
                    <h1 class="surah-detail-name arabic">${surah.nama}</h1>
                    <h2 class="surah-detail-latin">${surah.namaLatin}</h2>
                    <div class="surah-detail-info">
                        <div class="surah-detail-info-item">${surah.tempatTurun}</div>
                        <div class="surah-detail-info-item">${surah.jumlahAyat} Ayat</div>
                        <div class="surah-detail-info-item">${surah.arti}</div>
                    </div>
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                            onclick="toggleFavorite('surah', ${surah.nomor}, event)" 
                            style="position: absolute; top: 20px; right: 20px; font-size: 1.5rem;">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="detail-body">
                    <div class="tabs">
                        <div class="tab active" onclick="switchTab('quran-tab', 'tafsir-tab')">Quran</div>
                        <div class="tab" onclick="switchTab('tafsir-tab', 'quran-tab')">Tafsir</div>
                    </div>
                    
                    <div class="tab-content active" id="quran-tab">
                        <div class="surah-detail-description">
                            ${surah.deskripsi}
                        </div>
                        
                        ${fullAudioPlayers}
               
                        <div class="ayat-list">
                            ${ayatList}
          
                        </div>
                    </div>
                    
                    <div class="tab-content" id="tafsir-tab">
                        <div class="empty-state">
                            <i class="fas fa-info-circle"></i>
                            <h3>Tafsir Not Loaded</h3>
                            <p>Click the "View Tafsir" button to see detailed explanations of this surah</p>
                            <button class="btn" onclick="showTafsirDetail(${surah.nomor})" style="margin-top: 1rem;">
                                <i class="fas fa-graduation-cap"></i> View Tafsir
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Render audio players for each ayat
        function renderAudioPlayers(audioData, ayatNumber) {
            const reciters = {
                '01': 'Abdullah Al-Juhany',
                '02': 'Abdul-Muhsin Al-Qasim',
                '03': 'Abdurrahman as-Sudais',
                '04': 'Ibrahim Al-Dossari',
                '05': 'Misyari Rasyid Al-Afasi'
            };
            
            let audioPlayers = '<div class="audio-players">';
            audioPlayers += '<div class="audio-players-title"><i class="fas fa-music"></i> Ayat Recitations</div>';
            
            for (const [key, reciter] of Object.entries(reciters)) {
                if (audioData[key]) {
                    audioPlayers += `
                        <div class="audio-player">
                            <button onclick="playAudio('${audioData[key]}', this, event)">
                                <i class="fas fa-play"></i>
                            </button>
                            <span>${reciter} - Ayat ${ayatNumber}</span>
                        </div>
                    `;
                }
            }
            
            audioPlayers += '</div>';
            return audioPlayers;
        }
        
        // Render full surah audio players
        function renderFullAudioPlayers(audioData) {
            const reciters = {
                '01': 'Abdullah Al-Juhany',
                '02': 'Abdul-Muhsin Al-Qasim',
                '03': 'Abdurrahman as-Sudais',
                '04': 'Ibrahim Al-Dossari',
                '05': 'Misyari Rasyid Al-Afasi'
            };
            
            let audioPlayers = '<div class="full-audio-player">';
            audioPlayers += '<div class="full-audio-player-title"><i class="fas fa-volume-up"></i> Full Surah Recitation</div>';
            
            for (const [key, reciter] of Object.entries(reciters)) {
                if (audioData[key]) {
                    audioPlayers += `
                        <div class="audio-player float-animation">
                            <button onclick="playFullAudio('${audioData[key]}', this, event)">
                                <i class="fas fa-play"></i>
                            </button>
                            <span>${reciter} - Full Surah</span>
                        </div>
                    `;
                }
            }
            
            audioPlayers += '</div>';
            return audioPlayers;
        }
        
        // Switch between tabs
        function switchTab(showId, hideId) {
            document.getElementById(showId).classList.add('active');
            document.getElementById(hideId).classList.remove('active');
            
            // Update tab buttons
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.textContent.toLowerCase() === showId.split('-')[0]) {
                    tab.classList.add('active');
                }
            });
        }
        
        // Hide surah detail
        function hideSurahDetail() {
            // Stop any currently playing audio
            stopAllAudio();
            
            showQuran();
        }
        
        // Show tafsir detail
        async function showTafsirDetail(surahNumber, event) {
            if (event) event.stopPropagation();
            
            // Hide other sections and show detail
            showSection(sections.tafsirDetail);
            
            const loadingElement = document.getElementById('loading-tafsir-detail');
            const detailElement = document.getElementById('tafsir-detail-content');
            
            loadingElement.style.display = 'flex';
            detailElement.innerHTML = '';
            
            try {
                // Stop any currently playing audio
                stopAllAudio();
                
                // Find the surah in our cached list
                const surah = allSurahs.find(s => s.nomor === surahNumber);
                if (!surah) return;
                
                // Fetch tafsir
                const response = await fetch(`${QURAN_API_URL}/tafsir/${surahNumber}`);
                const data = await response.json();
                
                if (data.code === 200) {
                    renderTafsirDetail(surah, data.data);
                } else {
                    detailElement.innerHTML = `<p>Error loading tafsir</p>`;
                }
            } catch (error) {
                detailElement.innerHTML = `<p>Error: ${error.message}</p>`;
            } finally {
                loadingElement.style.display = 'none';
            }
        }
        
        // Render tafsir detail
        function renderTafsirDetail(surah, tafsirData) {
            const detailElement = document.getElementById('tafsir-detail-content');
            
            // Build tafsir content
            const tafsirContent = tafsirData.tafsir.map(item => `
                <div class="tafsir-item">
                    <h4><i class="fas fa-ayat"></i> Ayat ${item.ayat}</h4>
                    <p>${item.teks}</p>
                </div>
            `).join('');
            
            // Check if this tafsir is favorited
            const isFavorite = favorites.some(fav => fav.type === 'tafsir' && fav.id === surah.nomor);
            
            // Render the complete detail
            detailElement.innerHTML = `
                <div class="detail-header">
                    <h1 class="surah-detail-name arabic">${surah.nama}</h1>
                    <h2 class="surah-detail-latin">Tafsir of ${surah.namaLatin}</h2>
                    <div class="surah-detail-info">
                        <div class="surah-detail-info-item">${surah.tempatTurun}</div>
                        <div class="surah-detail-info-item">${surah.jumlahAyat} Ayat</div>
                        <div class="surah-detail-info-item">${surah.arti}</div>
                    </div>
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                            onclick="toggleFavorite('tafsir', ${surah.nomor}, event)" 
                            style="position: absolute; top: 20px; right: 20px; font-size: 1.5rem;">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="detail-body">
                    <div class="surah-detail-description">
                        ${surah.deskripsi}
                    </div>
                    
                    <div class="tafsir-section">
                        <h3 class="tafsir-title">
                            <i class="fas fa-graduation-cap"></i>
                            Tafsir Explanation
                        </h3>
                        <div class="tafsir-content">
                            ${tafsirContent}
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Hide tafsir detail
        function hideTafsirDetail() {
            showTafsir();
        }
        
        // Show prayer detail
        function showPrayerDetail(prayerId, event) {
            if (event) event.stopPropagation();
            
            // Hide other sections and show detail
            showSection(sections.prayerDetail);
            
            const loadingElement = document.getElementById('loading-prayer-detail');
            const detailElement = document.getElementById('prayer-detail-content');
            
            loadingElement.style.display = 'flex';
            detailElement.innerHTML = '';
            
            try {
                // Find the prayer in our cached list
                const prayer = allPrayers.find(p => p.id === prayerId);
                if (!prayer) return;
                
                renderPrayerDetail(prayer);
            } catch (error) {
                detailElement.innerHTML = `<p>Error: ${error.message}</p>`;
            } finally {
                loadingElement.style.display = 'none';
            }
        }
        
        // Render prayer detail
        function renderPrayerDetail(prayer) {
            const detailElement = document.getElementById('prayer-detail-content');
            
            // Build tags
            const tags = prayer.tag.map(tag => `
                <span class="tag">${tag}</span>
            `).join('');
            
            // Check if this prayer is favorited
            const isFavorite = favorites.some(fav => fav.type === 'prayer' && fav.id === prayer.id);
            
            // Render the complete detail
            detailElement.innerHTML = `
                <div class="detail-header">
                    <h1 class="surah-detail-latin">${prayer.nama}</h1>
                    <h2 class="surah-detail-info-item">${prayer.grup}</h2>
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                            onclick="toggleFavorite('prayer', ${prayer.id}, event)" 
                            style="position: absolute; top: 20px; right: 20px; font-size: 1.5rem;">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="detail-body">
                    <div class="prayer-arabic arabic" style="font-size: 1.8rem; text-align: center; margin-bottom: 2rem;">
                        ${prayer.ar}
                    </div>
                    
                    <div class="prayer-transcription">
                        <h3 class="prayer-title">
                            <i class="fas fa-language"></i>
                            Transcription
                        </h3>
                        <p>${prayer.tr}</p>
                    </div>
                    
                    <div class="prayer-translation">
                        <h3 class="prayer-title">
                            <i class="fas fa-book"></i>
                            Translation
                        </h3>
                        <p>${prayer.idn}</p>
                    </div>
                    
                    <div class="prayer-reference">
                        <h3 class="prayer-title">
                            <i class="fas fa-info-circle"></i>
                            Reference
                        </h3>
                        <p>${prayer.tentang}</p>
                    </div>
                    
                    <div class="prayer-tags" style="margin-top: 2rem;">
                        <h3 class="prayer-title">
                            <i class="fas fa-tags"></i>
                            Tags
                        </h3>
                        <div>${tags}</div>
                    </div>
                </div>
            `;
        }
        
        // Hide prayer detail
        function hidePrayerDetail() {
            showPrayers();
        }
        
        // Play audio for single ayat
        function playAudio(url, button, event) {
            if (event) event.stopPropagation();
            
            // Stop all currently playing audio
            stopAllAudio();
            
            // Create new audio player
            const audio = new Audio(url);
            currentAudioPlayers.push(audio);
            
            // Change button icon to pause
            button.innerHTML = '<i class="fas fa-pause"></i>';
            
            // Play audio
            audio.play();
            
            // When audio ends, change button back to play
            audio.addEventListener('ended', () => {
                button.innerHTML = '<i class="fas fa-play"></i>';
            });
            
            // When audio is paused, change button back to play
            audio.addEventListener('pause', () => {
                button.innerHTML = '<i class="fas fa-play"></i>';
            });
        }
        
        // Play full surah audio
        function playFullAudio(url, button, event) {
            if (event) event.stopPropagation();
            
            // Stop all currently playing audio
            stopAllAudio();
            
            // Create new audio player
            currentFullAudio = new Audio(url);
            
            // Change button icon to pause
            button.innerHTML = '<i class="fas fa-pause"></i>';
            
            // Play audio
            currentFullAudio.play();
            
            // When audio ends, change button back to play
            currentFullAudio.addEventListener('ended', () => {
                button.innerHTML = '<i class="fas fa-play"></i>';
                currentFullAudio = null;
            });
            
            // When audio is paused, change button back to play
            currentFullAudio.addEventListener('pause', () => {
                button.innerHTML = '<i class="fas fa-play"></i>';
                currentFullAudio = null;
            });
        }
        
        // Stop all audio players
        function stopAllAudio() {
            // Stop ayat audio
            currentAudioPlayers.forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
            currentAudioPlayers = [];
            
            // Stop full surah audio
            if (currentFullAudio) {
                currentFullAudio.pause();
                currentFullAudio.currentTime = 0;
                currentFullAudio = null;
            }
            
            // Reset all play buttons
            document.querySelectorAll('.audio-player button').forEach(button => {
                button.innerHTML = '<i class="fas fa-play"></i>';
            });
        }
        
        // Show juz view (placeholder)
        function showJuzView() {
            alert('Juz view will be implemented in the next update!');
        }