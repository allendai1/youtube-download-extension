'use strict';

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Log `title` of current active web page

// let el = document.createElement("button");
// el.innerText = "Download123";
// el.className = "test";
// let bar = document.getElementsByClassName("ytp-right-controls");
// bar[0].prepend(el);
// console.log("we're on youtube.com/watch")
// console.log(window.location.href)