console.log("Hello World")
let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "00:00"; // Fix NaN issue
    seconds = Math.floor(seconds); // Remove milliseconds
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}



async function getSongs(folder) {
    currFolder = folder.trim(); // Removes spaces from folder name

    // let a = await fetch(`${window.location.origin}/${currFolder}/`);
    // let response = await a.text();

    let a = await fetch(`${currFolder}/`);
    let response = await a.text();


    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1]);
        }
    }


    let songUL = document.querySelector(".songs").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        let yasirsong = song.replaceAll("%20", " ").split(" - ")
        // let song_final_name = yasirsong[0].trim()
        // console.log(song_final_name)
        songUL.innerHTML = songUL.innerHTML + `  
<li>
                            <div class="li-start">
                                <img src="/svgs/music.svg" alt="">
                                <div class="info">
                                    <div><h3>${yasirsong[0]}</h3></div>
                                    <div>${yasirsong[1] ? yasirsong[1].replace(".mp3", "").trim() : "Unknown Artist"}</div>
                                </div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img src="/svgs/playNow.svg" alt="">
                            </div>
                        </li>
        `
    }


    //ADDING EVENT LISTNER TO EACH LI WHILE CHANGING ITS IMAGE

    let currentlyPlayingLi = null;

    Array.from(document.querySelector(".songs").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            let li_final_name = e.querySelector(".info").children[0].textContent + " - " + e.querySelector(".info").children[1].textContent + ".mp3";

            // Get the play icon image inside the clicked li
            let clickedImg = e.querySelector(".playnow img");

            // Reset all play icons to default
            document.querySelectorAll(".songs ul li .playnow img").forEach(img => {
                img.src = "/svgs/playNow.svg";
            });

            if (currentlyPlayingLi === e) {
                // Same song clicked again
                if (currentSong.paused) {
                    currentSong.play();
                    clickedImg.src = "/svgs/pause.svg";
                    play.src = "/svgs/pause.svg";
                } else {
                    currentSong.pause();
                    clickedImg.src = "/svgs/playNow.svg";
                    play.src = "play.svg";
                }
            } else {
                // New <li> clicked
                currentlyPlayingLi = e;
                playMusic(li_final_name);
                clickedImg.src = "/svgs/pause.svg";
                play.src = "/svgs/pause.svg";
            }
        });
    });

    return songs;

}

let playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "pause.svg"
    }
    document.querySelector(".songName").innerHTML = decodeURI(track)
    document.querySelector(".songDuration").innerHTML = "00:00/00:00"

}

async function songAlbums() {
    let a = await fetch(`${window.location.origin}/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".content")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs")) {
            let folder = (e.href.split("/").slice(-2)[0])

            //GET META-DATA OF THE FOLDER

            // let a = await fetch(`${window.location.origin}/songs/${folder}/info.json`)
            let a = await fetch(`/songs/${folder}/info.json`)

            let response = await a.json()
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML +
                `
                          <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <polygon points="5,5 19,12 5,19" fill="black" />
                            </svg>
                        </div>
                        <span class="img">
                            <img  src='/songs/${folder}/cover.jpg' alt="">
                        </span>
                        <div class="card-2 card-padding"><h3>${response.title}</h3></div>
                        <div class="card-3 card-padding">${response.description}</div>
                    </div>
                    `
        }
    }

    //LOAD SONGS WHEN THE CARD IS CLICKED
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            document.querySelector(".left").style.left = 0
        })
    })
}

async function main() {

    await getSongs("songs/Aleem_Rk")
    playMusic(songs[0], true)

    //DISPLAY ALL THE ALBUMS DYNAMICALLY
    songAlbums()


    //ATTACH EVENT LISTNER TO PREVIOUS, PLAY AND NEXT BUTTONS

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "/svgs/pause.svg"
        } else {
            currentSong.pause()
            play.src = "/svgs/play.svg"
        }
    })

    //LISTEN FOR TIME UPDATE
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songDuration").innerHTML =
            `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    //ADD EVENTLISTNER TO SEEKBAR TO SEEK
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    ///ADD EVENTLISTNER TO HAMBURGER
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0
    })

    ///ADD EVENTLISTNER TO CROSS
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = -100 + "%"
        document.querySelector(".left").style.transition = "1.5s all"
    })

    //ADD EVENT LISTNER TO PREVIOUS
    let previous = document.getElementById("previous");

    previous.addEventListener("click", () => {
        console.log("previous clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

        console.log(songs, index)
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }

    });

    //ADD EVENT LISTNER TO NEXT
    let next = document.getElementById("next");

    next.addEventListener("click", () => {
        console.log("next clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

        console.log(songs, index)
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }

    })


    //ADD EVENT LISTNER TO VOLUME
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })

    //ADD EVENT LISTNER TO MUTE THE SONG
    document.querySelector(".volume>img").addEventListener("click", e => {
        console.log(e.target)
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replaceAll = ("/svgs/volume.svg", "/svgs/mute.svg")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else {
            e.target.src = e.target.src.replaceAll = ("/svgs/mute.svg", "/svgs/volume.svg")
            currentSong.volume = .10
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })



}

main()


