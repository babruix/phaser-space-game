/**
 * @author Alexey Romanov
 * https://github.com/babruix
 */

var game = new Phaser.Game(getWidth(), 800, Phaser.CANVAS);
var debug = window.location.hash == "#deb";

game.audio = {};
game.state.add('Boot', SpaceGame.Boot);
game.state.add('Preloader', SpaceGame.Preloader);
game.state.add('Menu', SpaceGame.Menu);
game.state.add('Tutorial', SpaceGame.Tutorial);
game.state.add('Main', SpaceGame.Main);
game.state.add('GameOver', SpaceGame.GameOver);
game.state.start('Boot');

/**
 * Common functions
 */

function getWidth() {
  if (self.innerHeight) {
    return self.innerWidth;
  }

  if (document.documentElement && document.documentElement.clientHeight) {
    return document.documentElement.clientWidth;
  }

  if (document.body) {
    return document.body.clientWidth;
  }
}

function getHeight() {
  if (self.innerHeight) {
    return self.innerHeight;
  }

  if (document.documentElement && document.documentElement.clientHeight) {
    return document.documentElement.clientHeight;
  }

  if (document.body) {
    return document.body.clientHeight;
  }
}

/**
 * Global error handling.
 *
 * @param msg
 * @param url
 * @param line
 * @param col
 * @param error
 * @returns {boolean}
 */
/*
window.onerror = function(msg, url, line, col, error) {
  // Note that col & error are new to the HTML 5 spec and may not be
  // supported in every browser.  It worked for me in Chrome.
  var extra = !col ? '' : '\ncolumn: ' + col;
  extra += !error ? '' : '\nerror: ' + error;

  // You can view the information in an alert to see things working like this:
  var errorMessage = "Error: " + msg + "\nurl: " + url + "\nline: " + line + extra;
  console.log(errorMessage);

  // TODO: Report this error via ajax so you can keep track
  //       of what pages have JS issues
  var suppressErrorAlert = true;
  // If you return true, then error alerts (like in older versions of
  // Internet Explorer) will be suppressed.
  return suppressErrorAlert;
};*/
