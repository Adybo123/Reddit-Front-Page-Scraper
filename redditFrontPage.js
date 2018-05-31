/*
  Reddit Front Page Image Scraper
  Gets... well... reddit images.

  DeeBo (overflo.me)
*/
const request = require('request');
const redditAPI = request.defaults({
    headers: {'User-Agent': 'node:me.overflo.memescraper:v0.1'}
})
const path = require('path');
const fs = require('fs');
var subredditJSON = {};
//(Bytes)
var totalSize = 0;
var imagesDone = 0;
var totalImages = 0;

function allDone() {
  console.log("----\nAll images from your chosen subreddit have been scraped!\nTotal download size this session: " + String(parseInt(totalSize / 1024 / 1024)) + "mb\nImages downloaded this session: " + String(totalImages))
  console.log("----\nEnter another subreddit name (no r/) to download front page images from it:")
  console.log("Remember: You can hit CTRL+C to exit at any time.")
}
var doneCallback = allDone;

function downloadImage(uri, filename, callback) {
  request.head(uri, function(err, res, body){
    totalSize = totalSize + parseInt(res.headers['content-length'])
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
}

function imageDone() {
  imagesDone = imagesDone + 1
  console.log("Downloaded image " + String(imagesDone) + "/" + String(totalImages))
  if (imagesDone == totalImages) {
    //We're done!
    doneCallback();
  }
}

function saveImagesToFolder() {
  var posts = subredditJSON['data']['children']
  var imagesToDownload = [];
  totalImages = totalImages + posts.length;
  for (var i = 0; i < posts.length; i++) {
    var post = posts[i]['data'];
    if (post['preview']==undefined) {
      console.log("This post doesn't have an image!")
      imagesDone = imagesDone + 1
    } else {
      var imgURL = post['preview']['images'][0]['source']['url'];
      downloadImage(imgURL, './images/' + post['name'] + path.extname(imgURL.split('?')[0]), imageDone)
    }
  }
}

function getSubredditJSON(subreddit, sortType, thenCallback) {
  redditAPI.get('https://api.reddit.com/r/' + subreddit + '/' + sortType, function (error, response, body) {
    if (response.statusCode==200) {
      console.log("Status Code 200, API request successful");
      subredditJSON = JSON.parse(body);
      thenCallback();
    } else {
      console.log("Error:\n" + error)
    }
  });
}

console.log("Enter a subreddit name (no r/) to download front page images from it:")

var stdin = process.openStdin();

stdin.addListener("data", function(d) {
  var strIn = d.toString().trim();
  getSubredditJSON(strIn, "best", saveImagesToFolder);
});
