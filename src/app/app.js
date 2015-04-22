var app = angular.module('app', ['pascalprecht.translate', 'ui.bootstrap']);

app.config(function ($translateProvider) {

    $translateProvider.useStaticFilesLoader({
            prefix: 'l10n/',
            suffix: '.json'
        })
        .registerAvailableLanguageKeys(['en', 'da'], {
            'en_US': 'en',
            'en_UK': 'en',
            'da_DK': 'da',
            '*': 'en'
        })
        .determinePreferredLanguage();
});