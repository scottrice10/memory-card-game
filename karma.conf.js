
module.exports = function ( karma ) {
  process.env.PHANTOMJS_BIN = 'node_modules/karma-phantomjs-launcher/node_modules/.bin/phantomjs';

  karma.set({
    /**
     * From where to look for files, starting with the location of this file.
     */
    basePath: './',

    /**
     * Filled by the task `gulp karma-conf`
     */
    files: [
        'bower_components/angular/angular.js',
        'bower_components/angular-ui-router/release/angular-ui-router.js',
        'bower_components/angular-local-storage/dist/angular-local-storage.js',
        'bower_components/jquery/dist/jquery.js',
        'bower_components/angular-touch/angular-touch.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'src/app/app/app.js',
        'src/app/score/score.js',
        'src/app/score/score.controller.js',
        'src/app/player/player.service.js',
        'src/app/game/game.service.js',
        'src/app/deck/deck.service.js',
        'src/app/board/board.js',
        'src/app/board/board.controller.js',
        'src/app/computerPlayer/computerPlayer.service.js',
        'src/app/card/card.factory.js',
        'src/app/card/card.directive.js',
        'src/app/app/app.controller.js',
        '.tmp/memory-templates.js',
        'src/app/card/card.directive.spec.js',
        'src/app/card/card.factory.spec.js',
        'src/app/computerPlayer/computerPlayer.service.spec.js',
        'src/app/board/board.controller.spec.js',
        'src/app/deck/deck.service.spec.js',
        'src/app/game/game.service.spec.js',
        'src/app/player/player.service.spec.js',
        'src/app/score/score.controller.spec.js'
      ],

    frameworks: [ 'jasmine', 'chai' ],
    plugins: [ 'karma-jasmine', 'karma-chai', 'karma-phantomjs-launcher' ],

    /**
     * How to report, by default.
     */
    reporters: 'progress',

    /**
     * Show colors in output?
     */
    colors: true,

    /**
     * On which port should the browser connect, on which port is the test runner
     * operating, and what is the URL path for the browser to use.
     */
    port: 9099,
    runnerPort: 9100,
    urlRoot: '/',

    /**
     * Disable file watching by default.
     */
    autoWatch: false,

    /**
     * The list of browsers to launch to test on. This includes only "Firefox" by
     * default, but other browser names include:
     * Chrome, ChromeCanary, Firefox, Opera, Safari, PhantomJS
     *
     * Note that you can also use the executable name of the browser, like "chromium"
     * or "firefox", but that these vary based on your operating system.
     *
     * You may also leave this blank and manually navigate your browser to
     * http://localhost:9099/ when you're running tests. The window/tab can be left
     * open and the tests will automatically occur there during the build. This has
     * the aesthetic advantage of not launching a browser every time you save.
     */
    browsers: [
      'PhantomJS'
    ]
  });
};
