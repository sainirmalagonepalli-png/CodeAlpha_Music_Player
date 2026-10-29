// ---------- Songs and Cover Images ----------

const tracks = [
    {
        title: "Sakhiye",
        artist: "Sinjith Yerramilli, Sindhuja Tanuku",
        src: "Songs/Sakhiye.mp3",
        cover: "Images/sakhiye.jpg",
        colors: ["#ff9f1c", "#e71d36"]
    },
    {
        title: "Priyathama Priyathama",
        artist: "Chinmayi Sripada",
        src: "Songs/Priyathama.mp3",
        cover: "Images/Priyathama.jpg",
        colors: ["#f72585", "#7209b7"]
    },
    {
        title: "Oosupodu",
        artist: "Hemachandra",
        src: "Songs/Oosupodu.mp3",
        cover: "Images/Oosupodhu.jpg",
        colors: ["#2ec4b6", "#3a0ca3"]
    },
    {
        title: "Baagundu Po",
        artist: "Sanjith Hegde, Sai Abhyankkar",
        src: "Songs/Baagundu Po.mp3",
        cover: "Images/Baagundu po.jpg",
        colors: ["#4cc9f0", "#4361ee"]
    }
];

// ---------- HTML Elements ----------

const audio = new Audio();

const cover = document.getElementById("cover");
const coverImg = document.getElementById("coverImg");

const titleEl = document.getElementById("title");
const artistEl = document.getElementById("artist");
const statusEl = document.getElementById("status");

const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");

const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

const muteBtn = document.getElementById("mute");
const volume = document.getElementById("volume");
const autoplay = document.getElementById("autoplay");

const playlistEl = document.getElementById("playlist");

// ---------- Variables ----------

let index = 0;
let isSeeking = false;
let lastVolume = 0.8;

const durations = {};

// ---------- Format Time ----------

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
}

// ---------- Slider Fill ----------

function setFill(input) {
    const min = Number(input.min);
    const max = Number(input.max);
    const value = Number(input.value);

    const percentage = ((value - min) / (max - min)) * 100;

    input.style.setProperty("--fill", percentage + "%");
}

// ---------- Render Playlist ----------

function renderPlaylist() {
    playlistEl.innerHTML = "";

    tracks.forEach((track, i) => {
        const li = document.createElement("li");

        li.dataset.index = i;

        if (i === index) {
            li.classList.add("active");
        }

        const info = document.createElement("div");
        info.className = "info";

        const name = document.createElement("div");
        name.className = "name";
        name.textContent = track.title;

        const artist = document.createElement("div");
        artist.className = "by";
        artist.textContent = track.artist;

        const length = document.createElement("span");
        length.className = "len";
        length.textContent = durations[i] || "--:--";

        info.appendChild(name);
        info.appendChild(artist);

        li.appendChild(info);
        li.appendChild(length);

        li.addEventListener("click", () => {
            loadTrack(i, true);
        });

        playlistEl.appendChild(li);
    });
}

// ---------- Load Track ----------

function loadTrack(i, shouldPlay = false) {
    index = (i + tracks.length) % tracks.length;

    const track = tracks[index];

    // Load audio
    audio.src = track.src;

    // Update song details
    titleEl.textContent = track.title;
    artistEl.textContent = track.artist;

    // Load the correct cover image
    coverImg.src = track.cover;
    coverImg.alt = track.title + " cover";

    // Reset image if the file cannot be found
    coverImg.onerror = () => {
        coverImg.removeAttribute("src");
        statusEl.textContent =
            "Cover image not found. Check the image file name and path.";
    };

    coverImg.onload = () => {
        statusEl.textContent = "";
    };

    // Change cover background colors
    cover.style.setProperty("--disc-a", track.colors[0]);
    cover.style.setProperty("--disc-b", track.colors[1]);

    // Update browser tab title
    document.title = `${track.title} - ${track.artist}`;

    // Reset progress
    progress.value = 0;
    setFill(progress);

    currentTimeEl.textContent = "0:00";
    durationEl.textContent = "0:00";

    statusEl.textContent = "";

    // Update playlist
    renderPlaylist();

    // Load metadata
    audio.load();

    if (shouldPlay) {
        play();
    }
}

// ---------- Play ----------

function play() {
    audio.play().catch(() => {
        statusEl.textContent =
            "Could not play this song. Check the MP3 file path.";
        updatePlayState();
    });
}

// ---------- Pause ----------

function pause() {
    audio.pause();
}

// ---------- Toggle Play/Pause ----------

function togglePlay() {
    if (audio.paused) {
        play();
    } else {
        pause();
    }
}

// ---------- Next and Previous ----------

function nextTrack() {
    loadTrack(index + 1, true);
}

function prevTrack() {
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
    } else {
        loadTrack(index - 1, true);
    }
}

// ---------- Play Button and Cover Animation ----------

function updatePlayState() {
    const playing = !audio.paused;

    playBtn.textContent = playing ? "⏸" : "▶";

    playBtn.setAttribute(
        "aria-label",
        playing ? "Pause" : "Play"
    );

    cover.classList.toggle("playing", playing);
}

audio.addEventListener("play", updatePlayState);
audio.addEventListener("pause", updatePlayState);
audio.addEventListener("ended", updatePlayState);

// ---------- Audio Metadata ----------

audio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(audio.duration);

    durations[index] = formatTime(audio.duration);

    const activeLength = playlistEl.children[index]?.querySelector(".len");

    if (activeLength) {
        activeLength.textContent = durations[index];
    }
});

// ---------- Update Progress ----------

audio.addEventListener("timeupdate", () => {
    if (isSeeking || !audio.duration) {
        return;
    }

    progress.value = (audio.currentTime / audio.duration) * 100;

    setFill(progress);

    currentTimeEl.textContent = formatTime(audio.currentTime);
});

// ---------- Autoplay Next Song ----------

audio.addEventListener("ended", () => {
    if (autoplay.checked) {
        nextTrack();
    } else {
        audio.currentTime = 0;
        progress.value = 0;
        setFill(progress);
        currentTimeEl.textContent = "0:00";
        updatePlayState();
    }
});

// ---------- Audio Error ----------

audio.addEventListener("error", () => {
    statusEl.textContent =
        "Could not load this song. Check the MP3 file name and path.";
});

// ---------- Seek Progress Bar ----------

progress.addEventListener("input", () => {
    isSeeking = true;

    setFill(progress);

    if (audio.duration) {
        const newTime = (progress.value / 100) * audio.duration;

        currentTimeEl.textContent = formatTime(newTime);
    }
});

progress.addEventListener("change", () => {
    if (audio.duration) {
        audio.currentTime = (progress.value / 100) * audio.duration;
    }

    isSeeking = false;
});

// ---------- Volume ----------

function updateVolumeIcon() {
    if (audio.muted || audio.volume === 0) {
        muteBtn.textContent = "🔇";
    } else if (audio.volume < 0.5) {
        muteBtn.textContent = "🔉";
    } else {
        muteBtn.textContent = "🔊";
    }
}

volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
    audio.muted = false;

    if (audio.volume > 0) {
        lastVolume = audio.volume;
    }

    setFill(volume);
    updateVolumeIcon();
});

// ---------- Mute / Unmute ----------

muteBtn.addEventListener("click", () => {
    if (audio.muted || audio.volume === 0) {
        audio.muted = false;
        audio.volume = lastVolume;
        volume.value = lastVolume;
    } else {
        lastVolume = audio.volume;
        audio.muted = true;
        volume.value = 0;
    }

    setFill(volume);
    updateVolumeIcon();
});

// ---------- Button Events ----------

playBtn.addEventListener("click", togglePlay);

nextBtn.addEventListener("click", nextTrack);

prevBtn.addEventListener("click", prevTrack);

// ---------- Keyboard Shortcuts ----------

document.addEventListener("keydown", (event) => {
    if (
        event.target.tagName === "INPUT" &&
        event.target.type !== "checkbox"
    ) {
        return;
    }

    if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
    } else if (event.code === "ArrowRight") {
        nextTrack();
    } else if (event.code === "ArrowLeft") {
        prevTrack();
    }
});

// ---------- Start Music Player ----------

audio.volume = Number(volume.value);

setFill(volume);
setFill(progress);

updateVolumeIcon();

loadTrack(0, false);
