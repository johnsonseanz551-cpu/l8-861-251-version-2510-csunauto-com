function bindMoviePlayer(source) {
    var video = document.getElementById('movie-player');
    var cover = document.getElementById('player-cover');
    var started = false;
    var hlsInstance = null;

    if (!video || !cover || !source) {
        return;
    }

    function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    function loadVideo() {
        if (started) {
            playVideo();
            return;
        }
        started = true;
        cover.classList.add('is-started');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', playVideo, { once: true });
            playVideo();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
            return;
        }

        video.src = source;
        playVideo();
    }

    cover.addEventListener('click', loadVideo);
    video.addEventListener('click', function () {
        if (!started) {
            loadVideo();
        }
    });
    video.addEventListener('play', function () {
        cover.classList.add('is-started');
    });
    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
