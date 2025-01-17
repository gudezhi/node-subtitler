var http = require('http'),
    request = require('request'),
    path = require("path"),
    url = require("url"),
    fs = require("fs"),
    zlib = require('zlib'),
    events = require('events');


/*
 * Download movie subtiles
 *
 * @event{downloading}
 * @event{downloaded}
 */

function Downloader(){}

//inherit from EventEmitter
require('util').inherits(Downloader, events.EventEmitter);


/*
 * Downloaded method
 *
 */
Downloader.prototype.download = function _download(results, limit, movieFile, onCompleted){

    if(!results.length || !limit) {
        if(onCompleted) onCompleted();
        return;
    }

    // record to download
    var subtitleResult = results.shift();
    var subtitleToDownload = subtitleResult.SubDownloadLink;

    // get dirname and download file path
    var dirname = process.cwd();
    var downloadFileName = subtitleResult.SubFileName;
    if(movieFile){

        // absolute file on movieFile
        movieFile = path.resolve(movieFile);
        var movieExtension = path.extname(movieFile);

        // subtitle link
        dirname = path.dirname(movieFile);

        // destination file
        downloadFileName = url.parse(subtitleToDownload).pathname;
        downloadFileName = path.basename(movieFile, movieExtension);
        if(limit>1 && results.length > 0){
            downloadFileName += "_" + limit;
        }

        downloadFileName += ".srt";
    }

    downloadFileName = dirname + path.sep + downloadFileName;

    // emit downloading event
    this.emit("downloading", { url: subtitleToDownload, file: downloadFileName});

    // get the subtitle
    var scope = this;
    // download and extract the subtitle
    dest = fs.createWriteStream(downloadFileName);
    gunzip = zlib.createGunzip()
    req = request({url:subtitleToDownload, jar:true, followAllRedirects:true})
    req.pipe(gunzip).pipe(dest)
    dest.on("close", function() {
        // emit downloaded event
        scope.emit.call(scope, "downloaded", { url: subtitleToDownload, file: downloadFileName});
        _download.call(scope, results, --limit, movieFile, onCompleted);
    })

};


module.exports = new Downloader();

