define(function () {
    var plugin = {
        settings: {
            name: "upload",
            type: "general",
            icon: "plugins/upload/icon.png",
            subMenus: [
                {name: "browsephotoalbums", menuURL: "#upload/browse", icon: ""},
                {name: "takepicture", menuURL: "#upload/take", icon: ""},
                {name: "recordaudio", menuURL: "#upload/record", icon: ""},
                {name: "video", menuURL: "#upload/video", icon: ""}
            ],
            lang: {
                component: "core"
            },
            toogler: true
        },

        routes: [
            ["upload/browse", "upload_browse", "browseAlbums"],
            ["upload/take", "upload_take", "takeMedia"],
            ["upload/record", "upload_record", "recordAudio"],
            ["upload/video", "upload_video", "uploadVideo"]
        ],

        /**
         * Determines is the plugin is visible.
         * It may check Moodle remote site version, device OS, device type, etc...
         * This function is called when a alink to a plugin functinality is going to be rendered.
         *
         * @return {bool} True if the plugin is visible for the site and device
         */
        isPluginVisible: function() {
            if (MM.config && MM.config.current_site &&
                typeof(MM.config.current_site.uploadfiles) != "undefined" &&
                MM.config.current_site.uploadfiles === 0) {

                return false;
            }
            return true;
        },

        browseAlbums: function() {
            MM.log('Trying to get a image from albums', 'Upload');
            MM.Router.navigate("");

            var width  =  $(document).innerWidth()  - 200;
            var height =  $(document).innerHeight() - 200;

            navigator.camera.getPicture(MM.plugins.upload.photoSuccess, MM.plugins.upload.photoFails, {
                quality: 50,
                destinationType: navigator.camera.DestinationType.FILE_URI,
                sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
            });
        },

        takeMedia: function() {
            MM.log('Trying to get a image from camera', 'Upload');
            MM.Router.navigate("");

            navigator.camera.getPicture(MM.plugins.upload.photoCameraSuccess, MM.plugins.upload.photoFails, {
                quality: 50,
                destinationType: navigator.camera.DestinationType.FILE_URI
            });
        },

        recordAudio: function() {
            MM.Router.navigate("");
            MM.log('Trying to record and Audio', 'Upload');
            captureAudioW8(MM.plugins.upload.recordAudioSuccess, MM.plugins.upload.recordAudioFails, { limit: 1 });
        },

        uploadVideo: function() {
            MM.Router.navigate("");
            MM.log('Trying to record a video', 'Upload');
            navigator.device.capture.captureVideo(
                MM.plugins.upload.uploadVideoSuccess,
                MM.plugins.upload.uploadVideoFails,
                {limit: 1});
        },

        photoCameraSuccess: function (uri) { // windows8 special case
            MM.log('Uploading an image to Moodle', 'Upload');
            var d = new Date();

            var options = {};
            options.fileKey = "file";

            // Check if we are in desktop or mobile.

            if (MM.inNodeWK) {
                options.fileName = uri.lastIndexOf("/") + 1;
            } else {
                options.fileName = "image_" + d.getTime() + ".jpg";
            }

            options.mimeType = "image/jpeg";


            uri = Windows.Storage.ApplicationData.current.localFolder.path + '\\' + uri.substr(uri.lastIndexOf('/') + 1);

            MM.moodleUploadFile(uri, options,
                                function () { MM.popMessage(MM.lang.s("imagestored")); },
                                function () { MM.popErrorMessage(MM.lang.s("erroruploading")) }
            );
        },

        photoSuccess: function(uri) {

            MM.log('Uploading an image to Moodle', 'Upload');
            var d = new Date();

            var options = {};
            options.fileKey="file";

            // Check if we are in desktop or mobile.
            if (MM.inNodeWK) {
                options.fileName = uri.lastIndexOf("/") + 1;
            } else {
                options.fileName = "image_" + d.getTime() + ".jpg";
            }

            options.mimeType="image/jpeg";

            MM.moodleUploadFile(uri, options,
                                function(){ MM.popMessage(MM.lang.s("imagestored")); },
                                function(){ MM.popErrorMessage(MM.lang.s("erroruploading")) }
            );

        },

        photoFails: function(message) {
            MM.log('Error trying getting a photo', 'Upload');
            if (message) {
                MM.log('Error message: ' + JSON.stringify(message));
            }
            if (message.toLowerCase().indexOf("error") > -1 || message.toLowerCase().indexOf("unable") > -1) {
                MM.popErrorMessage(message);
            }
        },

        recordAudioSuccess: function(mediaFiles) {

            MM.log('Auddio sucesfully recorded', 'Upload');

            var audioPath = Windows.Storage.ApplicationData.current.localFolder.path;
            audioPath = audioPath.split('AppData');
            audioPath = audioPath[0] + '\Music\\captureAudio.mp3';

            var options = {};
            options.fileKey = null;
            options.fileName = mediaFiles.src;
            options.mimeType = null;

            //pathMediaFiles = Windows.Storage.KnownFolders.musicLibrary.path + '\\' + mediaFiles.src;
            //console.log(audioPath);
            MM.moodleUploadFile(audioPath, options,
                                function () {
                                    MM.popMessage(MM.lang.s("recordstored"));
                                },
                                function () {
                                    MM.popErrorMessage(MM.lang.s("erroruploading"));
                                }
            );
        },

        recordAudioFails: function(error) {
            if (!error) {
                error = { code: 0};
            }

            if (typeof error.code == "undefined") {
                MM.log("Unexpected error trying to record an audio", "Upload");
                return;
            }

            MM.log('Error trying recording an audio ' + error.code, 'Upload');
            if (error.code != CaptureError.CAPTURE_NO_MEDIA_FILES) {
                MM.popErrorMessage(MM.lang.s("errorcapturingaudio"));
            }
        },

        uploadVideoSuccess: function(mediaFiles) {

            MM.log('Video sucesfully recorded', 'Upload');

            var i, len;
            for (i = 0, len = mediaFiles.length; i < len; i += 1) {
                var options = {};
                options.fileKey = null;
                options.fileName = mediaFiles[i].name;
                options.mimeType = null;

                MM.moodleUploadFile(mediaFiles[i].localURL, options,
                                    function(){
                                        MM.popMessage(MM.lang.s("videostored"));
                                    },
                                    function(){
                                        MM.popErrorMessage(MM.lang.s("erroruploading"))
                                    }
                );
            }
        },

        uploadVideoFails: function(error) {
            if (!error) {
                error = { code: 0};
            }

            MM.log('Error trying recording a video ' + error.code, 'Upload');
            if (error.code != CaptureError.CAPTURE_NO_MEDIA_FILES) {
                MM.popErrorMessage(MM.lang.s("errorcapturingvideo"));
            }
        }
    }

    if (MM.inNodeWK) {
        // Remove the not supported upload video.
        plugin.settings.subMenus.pop();
    }

    MM.registerPlugin(plugin);

});