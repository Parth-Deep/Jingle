console.log("lets write js");
let currentSong = new Audio();
let songs;
let currfolder;
let play = document.getElementById("play");
let prev = document.getElementById("prev");
let next = document.getElementById("next");
//show the time of song
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
//Adding folder
async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5501/songs/${currfolder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            // Extract filename only
            songs.push(element.href.split('/').pop());
        }
    }
    //Showing song
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li>  <img width="20px" class="invert" src="./assest/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Parth</div>
                            </div>
                            <div class="playnow">
                            <span>Play Now</span>
                            <img width="20px"class="invert"src="./assest/play.svg" alt="">
                        </div>
                      </li>`;
    }
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs;
}
//Playbar
const playmusic = (track, pause = false) => {
    if (!track) {
        console.warn('No track provided to playmusic.');
        return;
    }
    // Build the correct audio src
    let src;
    if (currfolder && currfolder.trim() !== "") {
        src = `/songs/${currfolder}/${track}`;
    } else {
        src = `/songs/${track}`;
    }
    console.log('Playing track:', track);
    currentSong.src = src;
    console.log('Audio src:', currentSong.src);
    if (!pause) {
        currentSong.play().catch(e => console.log('Audio play error:', e));
        play.src = "assest/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 /00:00";
}
async function main() {
    // Use an empty string to load all songs in the 'songs' folder
    await getsongs("");
    playmusic(songs[0], true)

    // Fix: get play, prev, next by id

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "assest/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "assest/play.svg"
        }
    })
    //song time
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })
    //seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        // Only seek if duration is finite
        if (isFinite(currentSong.duration) && !isNaN(currentSong.duration)) {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            currentSong.currentTime = ((currentSong.duration) * percent) / 100;
        } else {
            console.warn("Cannot seek: audio duration is not loaded.");
        }
    })
    //hamburger
    document.querySelector(".hambar").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })
    // Add an event listener to previous
    prev.addEventListener("click", () => {
        currentSong.pause();
        console.log("Previous clicked");
        let current = currentSong.src.split("/songs/").pop();
        let index = songs.findIndex(song => song === current);
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1]);
        }
    });

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause();
        console.log("Next clicked");
        let current = currentSong.src.split("/songs/").pop();
        let index = songs.findIndex(song => song === current);
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1]);
        }
    });
    //volume button
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })
    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            // Only pass the subfolder name, not the full path
            const folder = item.currentTarget.dataset.folder;
            songs = await getsongs(folder);
            playmusic(songs[0]);
        })
    })
   //dark mode or light mode
    var moonImg = document.querySelector(".moon img");
moonImg.onclick = function () {
    document.body.classList.toggle("dark-theme");
    if (document.body.classList.contains("dark-theme")) {
        moonImg.src = "assest/moon.svg";
    } else {
        moonImg.src = "assest/sun.svg";
    }
}
document.querySelector('.login-btn').addEventListener('click', () => {
    window.location.href = 'login/index.html';
});
document.querySelector('.signup-btn').addEventListener('click', () => {
    window.location.href = 'login/index.html#signup-box';
});
}



main()