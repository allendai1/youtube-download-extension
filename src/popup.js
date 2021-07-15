"use strict";
import './popup.css';
import ytdl from "ytdl-core";
const audio_only_download = document.getElementById("audio_only_download");
const video_download = document.getElementById("video_download");
let resolution = document.getElementById("resolution_quality");
let video_url = null;
let audio = null;


chrome.tabs.query(
	{ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
	function (tabs) {
		const regex = /https:\/\/www.youtube.com\/watch?/g;
		if (tabs[0].url.match(regex)) {
			// audio_only_download.innerText = "Download(audio only)";
			video_download.innerText = "Download";
			video_url = tabs[0].url;
			console.log(video_url);
			download_audio();

			// audio_only_download.addEventListener("click", download_audio);
			video_download.addEventListener("click", download_video);
			resolution.addEventListener("click",set_resolution)
			ytdl.getBasicInfo(video_url).then(x=>{
				let g = x.formats;
				let h = g.map(x=>{
					return x.qualityLabel;
				})
				let k = [...new Set(h)]
				k.forEach(e=>{

					let node = document.createElement("input")
					let label = document.createElement("label");
					label.innerText = e;
					node.setAttribute("type","radio")
					node.setAttribute("value",e);
					node.setAttribute("name", "resolution");
					if(e==="1080p60"){
						node.setAttribute("checked",true)
					}
					document.getElementById("resolution_quality").appendChild(node)

					document.getElementById("resolution_quality").appendChild(label)
				})
			document.getElementById("loader").classList.add("hide-loader");

			})


		} else {
			// audio_only_download.innerText = "Must be on a YouTube Video";
		}
	}
);
function set_resolution(){
	for(var i = 0, length = resolution.length; i < length; i++)
	if(resolution[i].checked){
		console.log(resolution[i].value);
	}
}
async function download_audio() {
	console.log("donwloading audio");
	let info = await ytdl.getInfo(video_url).then((y) => {
		// console.log(y.formats[1].url);
		console.log(y.formats);
		// console.log(ytdl.chooseFormat(y.formats, { filter: "audioonly" }));
		audio = ytdl.chooseFormat(y.formats, {
			filter: (format) =>
				format.container === "mp4" &&
				format.hasAudio === true &&
				format.hasVideo === false,
		}).url;
		console.log(audio);
		// audio_only_download.setAttribute("href", audio);
		// audio_only_download.setAttribute("download", "");
	});
}

function download_video() {
	let query = new URLSearchParams({
		YT_LINK : video_url,
		resolution : null,
		audio_only : false,
	});

	let request = new URL("http://localhost:5000/download")
	request.search = query;
	fetch(request, {
		method: 'GET',
		mode: 'no-cors'
	})
	// window.location.href = `http://localhost:5000/download?URL=${video_url}`;
}
