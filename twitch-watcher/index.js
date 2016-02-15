var Twitch = function(data) {
    this.status = data.status;
    this.url = data.url;
    this.image = data.image;
    this.name = data.name;
    this.description = data.description;
};

var twitchUsers = ['freecodecamp', 'storbeck', 'brunofin', 'terakilobyte', 'habathcx','RobotCaleb','thomasballinger','noobs2ninjas','beohoff', 'comster404', 'batilc1'];

var dummyPersona = 'http://www.healthcarevolunteer.com/orgpix/dummy_person_details.gif';

var stream_template = function(twitch){
    var a_params = twitch.url ? 'target="_blank" href="' + twitch.url + '"' : '';

    return '<stream class="' + twitch.status + '">' +
                '<a ' + a_params + '>' +
                    '<stream-icon style="background: url(\'' + twitch.image + '\')"></stream-icon>' +
                    '<stream-name>' + twitch.name + '</stream-name>' +
                    '<stream-description>' + twitch.description + '</stream-description>' +
                    '<clear></clear' +
                '</a>' +
            '</stream>';
};

var streamSorter = function(streamA, streamB) {
    if($(streamA).hasClass('online')) return -1;
    if($(streamB).hasClass('closed')) return -1;
    return 1;
};

var addTwitch = function(username) {
    var channel$, twitch$;

    $.ajax({
        url: 'https://api.twitch.tv/kraken/channels/' + username,
        crossDomain: true,
        dataType: 'jsonp',
        method: 'GET',
    })
    .then(function(channel) {
        if(channel.status == 404)
            throw new Error('This account does not exist');
        if(channel.status == 422)
            throw new Error('This account has been closed');

        channel$ = channel;

        return $.ajax({
            url: 'https://api.twitch.tv/kraken/streams/' + username,
            crossDomain: true,
            dataType: 'jsonp',
            method: 'GET',
        });
    })
    .then(function(twitch) {
        twitch$ = twitch;

        var status = !!twitch$.stream ? 'online' : 'offline';
        var description = !!twitch$.stream ? channel$.status : 'This channel is offline';

        $('streams').append(stream_template(new Twitch({
            status: status,
            url: channel$.url,
            image: channel$.logo || dummyPersona,
            name: channel$.display_name,
            description: description
        })));
    })
    .catch(function(err) {
        $('streams').append(stream_template(new Twitch({
            status: 'closed',
            url: '',
            image: dummyPersona,
            name: username,
            description: err.message
        })));
    })
    .then(function() {
        $('stream').sort(streamSorter).detach().appendTo($('streams'));
    });
};


$(function() {
    $.ajax({
        url: 'https://api.twitch.tv/kraken/streams/featured',
        crossDomain: true,
        dataType: 'jsonp',
        method: 'GET',
        data: {
            limit: 5,
            offset: 0
        },
    })
    .then(function(twitches){
        twitches.featured.forEach(function(twitch) {
            $('streams').append(stream_template(new Twitch({
                status: 'online',
                url: twitch.stream.channel.url,
                image: twitch.image,
                name: twitch.stream.channel.display_name,
                description: twitch.stream.channel.status
            })));
        });
    })
    .then(function() {
        $('stream').sort(streamSorter).detach().appendTo($('streams'));
    });

    twitchUsers.forEach(addTwitch);
});