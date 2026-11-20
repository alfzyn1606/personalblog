const themeToggleBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const themeLabel = document.getElementById("theme-label");

function applyTheme(theme) {
    const isLight = theme === "light";

    if (isLight) {
        document.documentElement.setAttribute("data-theme", "light");
    } else {
        document.documentElement.removeAttribute("data-theme");
    }

    if (themeIcon) {
        themeIcon.className = isLight ? "fa-solid fa-moon" : "fa-solid fa-sun";
    }

    if (themeLabel) {
        themeLabel.textContent = isLight ? "Dark" : "Light";
    }
}

applyTheme("dark");

if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        const currentTheme = document.documentElement.getAttribute("data-theme");
        applyTheme(currentTheme === "light" ? "dark" : "light");
    });
}

const playlist = [
    {
        title: "Panasea",
        artist: "Rumahsakit",
        src: "assets/music/music_1.mp3",
        cover: "assets/photo/cover.jpg"
    },
    {
        title: "Ini Abadi",
        artist: "Perunggu",
        src: "assets/music/music_2.mp3",
        cover: "assets/photo/cover.jpg"
    },
    {
        title: "Menantang Rasi Bintang",
        artist: "FSTVLST",
        src: "assets/music/music_3.mp3",
        cover: "assets/photo/cover.jpg"
    },
    {
        title: "Lalu Biru",
        artist: "Eleanor Whisper",
        src: "assets/music/music_4.mp3",
        cover: "assets/photo/cover.jpg"
    },
    {
        title: "Timur",
        artist: "The Adams",
        src: "assets/music/music_5.mp3",
        cover: "assets/photo/cover.jpg"
    }
];

const bgMusic = document.getElementById("bg-music");
const vinylDisc = document.getElementById("vinyl-disc");
const trackCoverEl = document.getElementById("track-cover");
const trackTitleEl = document.getElementById("track-title");
const trackArtistEl = document.getElementById("track-artist");
const progressSlider = document.getElementById("music-progress");
const currentTimeEl = document.getElementById("current-time");
const durationTimeEl = document.getElementById("duration-time");
const prevTrackBtn = document.getElementById("prev-track");
const playPauseBtn = document.getElementById("play-pause-track");
const nextTrackBtn = document.getElementById("next-track");

let currentTrackIndex = 0;
let userPausedMusic = false;
let isSeeking = false;
const nextAudioPreloader = new Audio();
nextAudioPreloader.preload = "auto";

const unlockEvents = [
    "pointerdown",
    "mousedown",
    "touchstart",
    "touchend",
    "click",
    "keydown",
    "scroll"
];

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function updatePlayStateUI(isPlaying) {
    if (vinylDisc) {
        vinylDisc.classList.toggle("playing", isPlaying);
    }

    if (playPauseBtn) {
        const playIcon = playPauseBtn.querySelector("i");
        if (playIcon) {
            playIcon.className = isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play";
        }
    }
}

function updateProgressUI() {
    if (!bgMusic || !progressSlider || isSeeking) return;

    const duration = bgMusic.duration;
    const current = bgMusic.currentTime;

    if (Number.isFinite(duration) && duration > 0) {
        const percent = (current / duration) * 100;
        progressSlider.value = percent;
        progressSlider.style.setProperty("--progress", `${percent}%`);
        if (durationTimeEl) durationTimeEl.textContent = formatTime(duration);
    } else {
        progressSlider.value = 0;
        progressSlider.style.setProperty("--progress", "0%");
    }

    if (currentTimeEl) currentTimeEl.textContent = formatTime(current);
}

function removeAutoplayUnlockListeners() {
    unlockEvents.forEach((evt) => {
        document.removeEventListener(evt, tryAutoPlayMusic);
        window.removeEventListener(evt, tryAutoPlayMusic);
    });
}

function tryAutoPlayMusic() {
    if (!bgMusic || userPausedMusic) return;

    if (!bgMusic.paused) {
        updatePlayStateUI(true);
        removeAutoplayUnlockListeners();
        return;
    }

    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                updatePlayStateUI(true);
                removeAutoplayUnlockListeners();
            })
            .catch(() => {
                updatePlayStateUI(false);
            });
    }
}

function preloadNextTrack() {
    if (playlist.length <= 1) return;
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    nextAudioPreloader.src = playlist[nextIndex].src;
}

function loadTrack(index, autoPlay = true, isInitial = false) {
    if (!bgMusic || !playlist[index]) return;

    currentTrackIndex = index;
    const track = playlist[currentTrackIndex];

    if (!isInitial || !bgMusic.getAttribute("src")) {
        bgMusic.src = track.src;
    }

    if (trackTitleEl) trackTitleEl.textContent = track.title;
    if (trackArtistEl) trackArtistEl.textContent = track.artist;

    if (trackCoverEl) {
        if (track.cover) {
            trackCoverEl.src = track.cover;
            trackCoverEl.classList.remove("hidden");
        } else {
            trackCoverEl.src = "";
            trackCoverEl.classList.add("hidden");
        }
    }

    if (progressSlider) {
        progressSlider.value = 0;
        progressSlider.style.setProperty("--progress", "0%");
    }
    if (currentTimeEl) currentTimeEl.textContent = "0:00";
    if (durationTimeEl) durationTimeEl.textContent = "0:00";

    if (autoPlay) {
        userPausedMusic = false;
        tryAutoPlayMusic();
    } else {
        updatePlayStateUI(!bgMusic.paused);
    }
}

function togglePlayPause() {
    if (!bgMusic) return;

    if (bgMusic.paused) {
        userPausedMusic = false;
        bgMusic.play()
            .then(() => {
                updatePlayStateUI(true);
                removeAutoplayUnlockListeners();
            })
            .catch(() => updatePlayStateUI(false));
    } else {
        userPausedMusic = true;
        bgMusic.pause();
        updatePlayStateUI(false);
    }
}

function prevTrack() {
    loadTrack((currentTrackIndex - 1 + playlist.length) % playlist.length, true);
}

function nextTrack() {
    loadTrack((currentTrackIndex + 1) % playlist.length, true);
}

loadTrack(0, true, true);

if (bgMusic) {
    bgMusic.addEventListener("loadeddata", tryAutoPlayMusic);
    bgMusic.addEventListener("canplay", tryAutoPlayMusic);
    bgMusic.addEventListener("loadedmetadata", updateProgressUI);
    bgMusic.addEventListener("timeupdate", updateProgressUI);
    bgMusic.addEventListener("play", () => {
        updatePlayStateUI(true);
        removeAutoplayUnlockListeners();
    });
    bgMusic.addEventListener("playing", preloadNextTrack);
    bgMusic.addEventListener("pause", () => updatePlayStateUI(false));
    bgMusic.addEventListener("ended", nextTrack);
}

window.addEventListener("DOMContentLoaded", tryAutoPlayMusic);
window.addEventListener("load", tryAutoPlayMusic);

unlockEvents.forEach((evt) => {
    document.addEventListener(evt, tryAutoPlayMusic, { passive: true });
    window.addEventListener(evt, tryAutoPlayMusic, { passive: true });
});

if (progressSlider) {
    const startSeek = () => {
        isSeeking = true;
    };

    const previewSeek = () => {
        const val = parseFloat(progressSlider.value) || 0;
        progressSlider.style.setProperty("--progress", `${val}%`);
        if (bgMusic && Number.isFinite(bgMusic.duration) && currentTimeEl) {
            currentTimeEl.textContent = formatTime((val / 100) * bgMusic.duration);
        }
    };

    const commitSeek = () => {
        if (bgMusic && Number.isFinite(bgMusic.duration)) {
            const val = parseFloat(progressSlider.value) || 0;
            bgMusic.currentTime = (val / 100) * bgMusic.duration;
        }
        isSeeking = false;
    };

    progressSlider.addEventListener("mousedown", startSeek);
    progressSlider.addEventListener("touchstart", startSeek, { passive: true });
    progressSlider.addEventListener("input", previewSeek);
    progressSlider.addEventListener("change", commitSeek);
    progressSlider.addEventListener("mouseup", commitSeek);
    progressSlider.addEventListener("touchend", commitSeek);
}

if (prevTrackBtn) {
    prevTrackBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        prevTrack();
    });
}

if (playPauseBtn) {
    playPauseBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        togglePlayPause();
    });
}

if (nextTrackBtn) {
    nextTrackBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        nextTrack();
    });
}

// Intro skip & unlock audio
const introScreen = document.getElementById("intro-screen");
let introSkipped = false;

function skipIntro() {
    tryAutoPlayMusic();

    if (introSkipped || !introScreen) return;

    introSkipped = true;
    introScreen.classList.add("skip");

    setTimeout(() => {
        if (introScreen) introScreen.remove();
    }, 450);
}

if (introScreen) {
    introScreen.addEventListener("click", skipIntro);
    introScreen.addEventListener("touchend", skipIntro, { passive: true });
}

// Tabs
const navItems = document.querySelectorAll(".tab-nav .nav-item");
const tabPages = document.querySelectorAll(".tab-page");

navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
        const targetSection = document.getElementById(btn.dataset.tab);
        if (!targetSection) return;

        navItems.forEach((item) => item.classList.remove("active"));
        tabPages.forEach((page) => page.classList.remove("active"));

        btn.classList.add("active");
        targetSection.classList.add("active");
    });
});

// Lightbox
const quoteItems = document.querySelectorAll(".quote-item");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.getElementById("lightbox-close");

quoteItems.forEach((item) => {
    item.addEventListener("click", () => {
        const image = item.dataset.image;
        if (!image) return;

        lightboxImage.src = image;
        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
    });
});

function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
}

if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
}

if (lightbox) {
    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) closeLightbox();
    });
}

document.addEventListener("keydown", (event) => {
    if (!introSkipped) {
        skipIntro();
        return;
    }
    if (event.key === "Escape") closeLightbox();
});
