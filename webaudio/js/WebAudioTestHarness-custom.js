/*!
* This file is designed to be overwritten by browser vendors so that they can customise the settings.
*/

//Vendor prefixes.
window.AudioContext=window.AudioContext||window.webkitAudioContext;
window.OfflineAudioContext=window.OfflineAudioContext||window.webkitOfflineAudioContext;

//Global settings.
//WebAudioTestHarness.globalSettings.sampleRate=48000;

//Suppressing specific test cases.
//TBC

if(window.parent!=window.self&&window.parent.reportToParentWindow) {
	add_completion_callback(function(allRes, status) {
		window.parent.reportToParentWindow(allRes, status);
	});
}
