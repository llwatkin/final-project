// site.js - Handles fullscreen button click
// Author: Your Name
// Date:

// make sure document is ready
$(document).ready(function () {
	$('#fullscreen').click(function () {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen().catch((e) => {
				console.error(e);
			});
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			}
		}
	});

	$(document).on('fullscreenchange', function () {
		if (document.fullscreenElement) {
			$('body').addClass('is-fullscreen');
		} else {
			$('body').removeClass('is-fullscreen');
		}
	});

	$('#generate').click(generate);
})
