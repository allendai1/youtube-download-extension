"use strict";
import "./popup.css";
import { saveAs } from "file-saver";
import { createFFmpeg } from "@ffmpeg/ffmpeg";
import axios from "axios";
import ytdl from "ytdl-core";
let server = "http://localhost:80"; // http://161.35.116.67
let video_url = null;
const regex = /https:\/\/www.youtube.com\/watch?/g;
let info = null;
const ffmpeg = createFFmpeg({
	corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",

	log: true,
});
chrome.tabs.query(
	{ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
	async function (tabs) {
		if (tabs[0].url.match(regex)) {
			video_url = tabs[0].url;

			document
				.getElementById("audio_download")
				.addEventListener("click", download_audio);
			document
				.getElementById("video_download")
				.addEventListener("click", download_video);
			document
				.getElementById("video_audio_download")
				.addEventListener("click", download_full);
			if (!ffmpeg.isLoaded()) {
				await ffmpeg.load();
			}
			if (info === null) {
				info = await ytdl.getBasicInfo(video_url);
			}
		}
	}
);
function set_loading() {
	let x = document.getElementsByClassName("download_button");
	for (let i = 0; i < x.length; i++) {
		x[i].style.display = "none";
	}
	document.getElementById("loader").style.display = "inline";
}
function finish_loading() {
	let x = document.getElementsByClassName("download_button");
	for (let i = 0; i < x.length; i++) {
		x[i].style.display = "inline";
	}
}
async function get_audio() {
	// returns blob object representing the audio
	set_loading();
	let args = new URLSearchParams({
		yt_link: video_url,
	});
	let url = new URL(`${server}/audio`);
	url.search = args;

	let res = await axios({
		method: "get",
		url: url,
		responseType: "blob",
		onDownloadProgress: (e) => {
			console.log(e.loaded);
			document.getElementById("loader").innerText = `Downloading audio :${e.loaded / 1000000}MB`;
		},
	});
	return res.data;
}

async function get_video() {
	// returns blob object representing the video
	set_loading();

	let args = new URLSearchParams({
		yt_link: video_url,
	});
	let url = new URL(`${server}/video`);
	url.search = args;

	let res = await axios({
		method: "get",
		url: url,
		responseType: "blob",
		onDownloadProgress: (e) => {
			console.log(e.loaded);
			document.getElementById("loader").innerText = `Downloading visual: ${e.loaded / 1000000}MB`;
		},
	});

	return res.data;
}

async function download_video() {
	let video = await get_video();

	saveAs(
		new File([video], `${info.videoDetails.title}.mp4`),
		`${info.videoDetails.title}.mp4`
	);
	finish_loading();
}
async function download_audio() {
	let audio = await get_audio();
	saveAs(
		new File([audio], `${info.videoDetails.title}.mp4`),
		`${info.videoDetails.title}.mp4`
	);
	finish_loading();
}
async function download_full() {
	let video = new Uint8Array(
		await get_video().then((video) => video.arrayBuffer())
	);

	let audio = new Uint8Array(
		await get_audio().then((audio) => audio.arrayBuffer())
	);

	ffmpeg.FS("writeFile", "video.mp4", video);
	ffmpeg.FS("writeFile", "audio.mp4", audio);
	document.getElementById("loader").innerText = "Stitching audio and visual together..."
	await ffmpeg.run(
		"-i",
		"video.mp4",
		"-i",
		"audio.mp4",
		"-c:v",
		"copy",
		"-c:a",
		"aac",
		"output.mp4"
	);
	finish_loading();

	let file = ffmpeg.FS("readFile", "output.mp4");
	saveAs(
		new File([file], `${info.videoDetails.title}.mp4`),
		`${info.videoDetails.title}.mp4`
	);
	console.log("audio and video downloaded");
}
