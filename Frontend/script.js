document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('show');
        menuToggle.classList.toggle('active');
    });
});

const playlists = {
    sleep: [
        { url: 'https://www.bensound.com/bensound-music/bensound-relaxing.mp3', name: 'Relaxing Melody' },
        { url: 'https://www.bensound.com/bensound-music/bensound-slowmotion.mp3', name: 'Slow Motion' },
        { url: 'https://www.bensound.com/bensound-music/bensound-tenderness.mp3', name: 'Tenderness' },
        { url: 'https://www.bensound.com/bensound-music/bensound-softsoothing.mp3', name: 'Soft Soothing' }
    ],
    productivity: [
        { url: 'https://www.bensound.com/bensound-music/bensound-energy.mp3', name: 'Energy Track' },
        { url: 'https://www.bensound.com/bensound-music/bensound-motivation.mp3', name: 'Motivation Boost' },
        { url: 'https://www.bensound.com/bensound-music/bensound-happyrock.mp3', name: 'Happy Rock' },
        { url: 'https://www.bensound.com/bensound-music/bensound-actionable.mp3', name: 'Actionable' }
    ],
    random: [
        { url: 'https://www.bensound.com/bensound-music/bensound-cute.mp3', name: 'Cute Theme' },
        { url: 'https://www.bensound.com/bensound-music/bensound-summer.mp3', name: 'Summer Vibes' },
        { url: 'https://www.bensound.com/bensound-music/bensound-funday.mp3', name: 'Fun Day' },
        { url: 'https://www.bensound.com/bensound-music/bensound-buddy.mp3', name: 'Buddy' }
    ],
    relax: [
        { url: 'https://www.bensound.com/bensound-music/bensound-india.mp3', name: 'Indian Calm' },
        { url: 'https://www.bensound.com/bensound-music/bensound-littlelight.mp3', name: 'Little Light' },
        { url: 'https://www.bensound.com/bensound-music/bensound-memories.mp3', name: 'Memories' },
        { url: 'https://www.bensound.com/bensound-music/bensound-newdawn.mp3', name: 'New Dawn' }
    ],
    'noise-blocker': [
        { url: 'https://www.bensound.com/bensound-music/bensound-pianomoment.mp3', name: 'Piano Moment' },
        { url: 'https://www.bensound.com/bensound-music/bensound-dreams.mp3', name: 'Dreams Soundtrack' },
        { url: 'https://www.bensound.com/bensound-music/bensound-photoalbum.mp3', name: 'Photo Album' },
        { url: 'https://www.bensound.com/bensound-music/bensound-love.mp3', name: 'Love Melody' }
    ]
};

// Sound effect file paths
const soundFiles = {
    Rain: 'https://assets.mixkit.co/sfx/preview/mixkit-rain-and-thunder-storm-2390.mp3',
    Thunder: 'https://assets.mixkit.co/sfx/preview/mixkit-thunder-strike-1323.mp3',
    Wind: 'https://assets.mixkit.co/sfx/preview/mixkit-wind-woods-ambience-2541.mp3',
    Nature: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-ambience-2600.mp3',
    Bird: 'https://assets.mixkit.co/sfx/preview/mixkit-bird-chirp-2469.mp3',
    Fire: 'https://assets.mixkit.co/sfx/preview/mixkit-fire-burning-2038.mp3',
    Waves: 'https://assets.mixkit.co/sfx/preview/mixkit-calm-sea-waves-1340.mp3',
    Train: 'https://assets.mixkit.co/sfx/preview/mixkit-train-approaching-1714.mp3'
};

class SoundMixer {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.musicPlayer = document.getElementById('audioPlayer');
        this.currentTrackDisplay = document.querySelector('.current-track');
        
        // Sounds for ambient effects
        this.sounds = {};
        this.soundSources = {};
        this.soundGains = {};
        
        // Music playlist management
        this.currentPlaylist = null;
        this.currentPlaylistType = null;
        this.currentMusicIndex = -1;

        this.initializeSounds();
        this.attachEventListeners();
        this.setupMusicPlayerListeners();
    }

    async initializeSounds() {
        // Load ambient sound effects
        for (const [soundName, soundPath] of Object.entries(soundFiles)) {
            try {
                const response = await fetch(soundPath);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                
                this.sounds[soundName] = audioBuffer;
                // Prepare gain node for future use
                this.soundGains[soundName] = this.audioContext.createGain();
                this.soundGains[soundName].gain.setValueAtTime(0.5, this.audioContext.currentTime);
            } catch (error) {
                console.error(`Error loading ${soundName} sound:`, error);
            }
        }
    }

    setupMusicPlayerListeners() {
        // Handle music playback ended
        this.musicPlayer.addEventListener('ended', () => {
            this.playNextTrack();
        });
    }

    playNextTrack() {
        if (!this.currentPlaylist) return;

        // Increment index, loop back to start if at end
        this.currentMusicIndex = (this.currentMusicIndex + 1) % this.currentPlaylist.length;
        const nextTrack = this.currentPlaylist[this.currentMusicIndex];

        this.musicPlayer.src = nextTrack.url;
        this.musicPlayer.play();
        this.updateCurrentTrackDisplay(nextTrack);
    }

    updateCurrentTrackDisplay(track) {
        if (this.currentTrackDisplay) {
            this.currentTrackDisplay.textContent = `Now Playing: ${track.name}`;
        }
    }

    playSound(soundName) {
        // Stop any existing source for this sound
        if (this.soundSources[soundName]) {
            this.soundSources[soundName].stop();
            this.soundSources[soundName].disconnect();
        }

        // Create a new source for each play
        const source = this.audioContext.createBufferSource();
        source.buffer = this.sounds[soundName];
        source.loop = true;

        // Connect to gain node and audio destination
        source.connect(this.soundGains[soundName]);
        this.soundGains[soundName].connect(this.audioContext.destination);

        // Start the source
        source.start();

        // Store the source for potential future stopping
        this.soundSources[soundName] = source;
    }

    stopSound(soundName) {
        if (this.soundSources[soundName]) {
            this.soundSources[soundName].stop();
            this.soundSources[soundName].disconnect();
            delete this.soundSources[soundName];
        }
    }

    toggleSlider(soundName) {
        const icon = document.querySelector(`.icon[onclick="toggleSlider(${soundName})"]`);
        icon.classList.toggle('show-slider');
    }

    updateVolume(soundName, volume) {
        const volumeDecimal = volume / 100;
        
        if (this.soundGains[soundName]) {
            this.soundGains[soundName].gain.setValueAtTime(volumeDecimal, this.audioContext.currentTime);
        }

        // Play or stop based on volume
        if (volumeDecimal > 0) {
            // Check if sound is not already playing
            if (!this.soundSources[soundName]) {
                this.playSound(soundName);
            }
        } else {
            this.stopSound(soundName);
        }
    }

    // Enhanced playlist functionality
    selectPlaylist(playlistType) {
        this.currentPlaylist = playlists[playlistType];
        this.currentPlaylistType = playlistType;
        this.currentMusicIndex = -1;

        // Highlight the selected playlist option
        const options = document.querySelectorAll('.option');
        options.forEach(opt => {
            opt.classList.remove('focused');
            if (opt.getAttribute('data-playlist') === playlistType) {
                opt.classList.add('focused');
            }
        });

        // Start playing the playlist
        this.playNextTrack();
    }

    // Music player controls
    pauseMusic() {
        this.musicPlayer.pause();
    }


    resumeMusic() {
        this.musicPlayer.play();
    }

    attachEventListeners() {
        // Ambient sound sliders
        document.querySelectorAll('.icon input[type="range"]').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const soundName = e.target.closest('.icon').getAttribute('onclick').match(/\((\w+)\)/)[1];
                this.updateVolume(soundName, e.target.value);
            });
        });

        // Sound icon toggles
        document.querySelectorAll('.icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                const soundName = icon.getAttribute('onclick').match(/\((\w+)\)/)[1];
                this.toggleSlider(soundName);
            });
        });

        // Playlist selection
        const playlistOptions = document.querySelectorAll('.option');
        playlistOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const playlistType = option.getAttribute('data-playlist');
                this.selectPlaylist(playlistType);
            });
        });
    }

    // Favorite sound mix functionality
    saveFavorite() {
        const sliders = document.querySelectorAll('.sound-icons input[type="range"]');
        const favoritePlaylists = document.getElementById('favoritePlaylists');
        const settings = Array.from(sliders).map(slider => slider.value);
        const favoriteItem = document.createElement('div');
        favoriteItem.classList.add('favorite-item');

        const favoriteText = document.createElement('span');
        favoriteText.textContent = `Favorite ${this.getFavoriteCount()}`;
        favoriteItem.appendChild(favoriteText);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-button');
        deleteButton.onclick = () => favoriteItem.remove();
        favoriteItem.appendChild(deleteButton);

        favoriteItem.onclick = (event) => {
            if (event.target !== deleteButton) {
                sliders.forEach((slider, index) => {
                    slider.value = settings[index];
                    // Trigger volume update for each sound
                    const soundName = slider.closest('.icon').getAttribute('onclick').match(/\((\w+)\)/)[1];
                    this.updateVolume(soundName, settings[index]);
                });
            }
        };

        favoritePlaylists.appendChild(favoriteItem);
    }

    getFavoriteCount() {
        const favoritePlaylists = document.getElementById('favoritePlaylists');
        return favoritePlaylists.children.length + 1;
    }
}

// Initialize the sound mixer when the page loads
window.soundMixer = new SoundMixer();

// Expose methods to global scope for inline event handlers
window.toggleSlider = (soundName) => window.soundMixer.toggleSlider(soundName);
window.saveFavorite = () => window.soundMixer.saveFavorite();


