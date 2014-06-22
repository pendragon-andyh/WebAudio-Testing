# WebAudio-Testing #

This is a prototype of the WebAudio API unit tests that I want to submit to the
[W3C web-platform-tests project](https://github.com/w3c/web-platform-tests).

There are a number of things that I wanted to experiment-with first:
* Creating a micro test framework that makes it *easy* to test audio-specific functionality:
** Asyncronous behaviour.
** Timing.
** Analysis of audio streams.
** TBC.
* Folder structure and file-naming conventions.
* TBC.

[index.html](http://htmlpreview.github.com/?https://github.com/pendragon-andyh/WebAudio-Testing/blob/master/index.html)

The framework wraps-around-and-extends the existing TestHarness.js framework.

The folder structure is identical to the existing structure of the *webaudio* tests within the *web-platform-tests*
project - which should make it easy to just drop this new stuff directly in.

## License

This repository is covered by the dual-licensing approach described in:
http://www.w3.org/Consortium/Legal/2008/04-testsuite-copyright.html