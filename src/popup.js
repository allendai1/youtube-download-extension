"use strict";
import "./popup.css";
import { saveAs } from "file-saver";
// import ytdl from "ytdl-core";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import axios from "axios";
import ytdl from "ytdl-core";

let video_url = null;
const regex = /https:\/\/www.youtube.com\/watch?/g;
const ffmpeg = createFFmpeg({
	corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
	log: true,
});
chrome.tabs.query(
	{ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
	async function (tabs) {
		if (tabs[0].url.match(regex)) {
			video_url = tabs[0].url;
			if(!ffmpeg.isLoaded()){
				await ffmpeg.load();
		
			}
			document
				.getElementById("audio_download")
				.addEventListener("click", download_audio);
			document
				.getElementById("video_download")
				.addEventListener("click", download_video);
				document
				.getElementById("video_audio_download")
				.addEventListener("click", download_full);
				
		}
	}
);

async function get_audio() { // returns blob object representing the audio
	let args = new URLSearchParams({
		yt_link: video_url,
	});
	let audio = null;
	let url = new URL("http:localhost:5000/audio");
	url.search = args;

	let res = await axios({
		method: "get",
		url: url,
		responseType: "blob",
		onDownloadProgress:e=>{
			console.log(e.loaded);

			
		
			

		}
	})
	return res.data;

	
}

async function get_video() { // returns blob object representing the video
	let args = new URLSearchParams({
		yt_link: video_url,
	});
	let url = new URL("http:localhost:5000/video");
	let video = null;
	url.search = args;

	let res = await axios({
		method: "get",
		url: url,
		responseType: "blob",
	})

	
	// video = ffmpeg.FS("readFile", "video.mp4");
	
	return res.data;
}

async function download_video(){
	let video = await get_video();
	saveAs(new File([video], "video.mp4"), "video.mp4");

}
async function download_audio(){
	let audio = await get_audio();
	console.log(audio)
	saveAs(new File([audio], "audio.mp4"), "audio.mp4");
}
async function download_full(){
	let video = new Uint8Array(await get_video().then(video=>video.arrayBuffer()));

	let audio = new Uint8Array(await get_audio().then(audio=>audio.arrayBuffer()));

	ffmpeg.FS("writeFile", "video.mp4", video );
	ffmpeg.FS("writeFile", "audio.mp4", audio );


	await ffmpeg.run('-i','video.mp4','-i','audio.mp4','-c:v','copy','-c:a','aac', 'output.mp4');
	let file = ffmpeg.FS("readFile","output.mp4");
	console.log(file);
	saveAs(new File([file],'output.mp4'),'output.mp4');
	console.log("audio and video downloaded");
}