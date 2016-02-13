var generateQuote = function() {
    setQuote();
    changeBg();
}


var setQuote = function() {
    getQuote()
        .then(function(Quote) {
            var quote = '"' + Quote.quoteText + '" - ' + Quote.quoteAuthor
            $('#quote').html(quote);

            if(quote.length > 133) quote = quote.slice(0, 130) + '...';
            $('#share').attr('href', 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(quote) + '&hashtags=quote');
        });
};


var getQuote = function() {
    var forismaticUrl = 'http://api.forismatic.com/api/1.0/';

    return $.ajax({
                url: forismaticUrl,
                crossDomain: true,
                dataType: 'jsonp',
                method: 'POST',
                jsonp: 'jsonp',
                data: {
                    method: 'getQuote',
                    format: 'jsonp',
                    lang: 'en'
                }
            })
            .then(function(quote) {
                if(quote.quoteAuthor == '') return getQuote();
                return quote;
            });
};

var count = 1;
var changeBg = function() {
    $('background').append('<img />');

    var newImg = $('img:not(.eximage)');
    var exImg = $('img.eximage');

    var category = 'abstract';
    var loremUrl = 'http://lorempixel.com/' + 
                    window.innerWidth + '/' + 
                    window.innerHeight + '/' +
                    category + '/' + 
                    count;
    count = (count % 10) + 1;

    newImg.attr('src', loremUrl);
    newImg.on('load', function(){
        exImg.css('opacity', '0');
        newImg.css('opacity', '1');

        newImg.one('webkitTransitionEnd msTransitionEnd transitionend', function(){
            newImg.addClass('eximage');
            exImg.remove();
        });
    });
};


document.addEventListener('DOMContentLoaded', generateQuote);

$(function(){
    $('#get-new').click(generateQuote);

    $('img').on('load', function(){
        $(this).css('opacity', '1');
    });
});
