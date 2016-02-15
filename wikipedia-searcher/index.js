var search = function() {
    var text = $('#search-text').val();
    if(!text) return;

    return $.ajax({
        url: 'https://en.wikipedia.org/w/api.php',
        crossDomain: true,
        dataType: 'jsonp',
        method: 'GET',
        data: {
            action: 'query',
            format: 'json',
            prop: 'extracts',
            generator: 'search',
            exsentences: 2,
            exlimit: 20,
            exintro: 1,
            explaintext: 1,
            exsectionformat: 'plain',
            gsrsearch: text,
            gsrlimit: 50
        },
    })
    .then(function(response) {
        return Object.keys(response.query.pages).map(function(id) {
            return response.query.pages[id];
        });
    });
}

'http://en.wikipedia.org/?curid=18630637';

var createResult = function(page) {
    var resultHeader = '<result-header>' + page.title + '</result-header>';
    var resultText = page.extract ? '<result-text>' + page.extract + '</result-text>' : '';

    var html = '<result class="removed">' +
                    '<a href="http://en.wikipedia.org/?curid=' + page.pageid + '" target="_blank">' +
                    resultHeader +
                    resultText +
                    '</a>' +
                '</result>';

    return html;
};


var removeResults = function() {
    var promises = [];

    $('result').each(function(){
        var $result = $(this);
        setTimeout($result.addClass.bind($result, 'removed'), $result.index() * 10);
        promises.push(new Promise(function(resolve, reject) {
            $result.on('transitionend', function(){
                $result.remove();
                resolve();
            });
        }));
    });

    return Promise.all(promises);
}

var searchAndShow = function() {
    Promise.all([
        search(),
        removeResults()
    ])
    .then(function(results) {
        var pages = results[0];

        return pages.forEach(function(page) {
            var html = createResult(page);
            $('results').append(html);
        });
    })
    .then(function() {
        $('result').each(function(){
            var $result = $(this);
            setTimeout($result.removeClass.bind($result, 'removed'), $result.index() * 50);
        });
    });
}


$(function() {
    $('#search').click(searchAndShow);
    $(document).keypress(function(e) {
        if(e.which == 13) searchAndShow();
    });
});