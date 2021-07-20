"use strict";
import "./popup.css";
import { saveAs } from "file-saver";
// import ytdl from "ytdl-core";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import axios from "axios";

let video_url = null;
const regex = /https:\/\/www.youtube.com\/watch?/g;
const ffmpeg = createFFmpeg({
	corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
	log: false,
});
chrome.tabs.query(
	{ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
	function (tabs) {
		if (tabs[0].url.match(regex)) {
			video_url = tabs[0].url;
			document
				.getElementById("audio_download")
				.addEventListener("click", get_audio);
			document
				.getElementById("video_download")
				.addEventListener("click", get_video);
		}
	}
);
async function get_audio() {
	let args = new URLSearchParams({
		yt_link: video_url,
	});

	let url = new URL("http:localhost:5000/audio");
	url.search = args;
	fetch(url, {
		method: "GET",
	}).then((res) => {
		res.blob().then(async (x) => {
			let file1 = new File([x], "test.mp4");
			saveAs(file1, "test.mp4");
		});
	});
}
async function get_video() {
	let args = new URLSearchParams({
		yt_link: video_url,
	});
	let url = new URL("http:localhost:5000/video");
	url.search = args;

	axios({
		method: "get",
		url: url,
		responseType: 'arraybuffer'
		
	}).then(async (x) => {
		console.log(x)
		await ffmpeg.load();
		// let buffer1 = await x.arrayBuffer();
		ffmpeg.FS("writeFile", "test.mp4", new Uint8Array(x.data));
		let gg1 = ffmpeg.FS("readFile", "test.mp4");
		// console.log(gg1);
		saveAs(new File([gg1], "test.mp4"), "test.mp4");
	});
	// fetch(url, {
	// 	method: "GET",
	// }).then((res) => {
	// 	res.blob().then(async (x) => {
	// 		await ffmpeg.load();
	// 		let buffer1 = await x.arrayBuffer();
	// 		ffmpeg.FS("writeFile", "test.mp4", new Uint8Array(buffer1));
	// 		// await ffmpeg.run("-i", "test.mp4", "test.mp3");
	// 		// let gg = ffmpeg.FS("readFile", "test.mp4");
	// 		let gg1 = ffmpeg.FS("readFile", "test.mp4");
	// 		console.log(gg1);
	// 		saveAs(new File([gg1], "test.mp4"), "test.mp4");
	// 	});
	// });
}
