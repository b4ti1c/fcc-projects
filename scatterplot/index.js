const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
const margin = {top: 20, right: 30, bottom: 30, left: 40}
const height = 400 - margin.top - margin.bottom;
const width = 750 - margin.left - margin.right;
const $tooltip = $('tooltip');


class Tooltip {
    constructor() {
        this.Time = '';
        this.Place = 0;
        this.Seconds = 0;
        this.Name = '';
        this.Year = 0;
        this.Nationality = '';
        this.Doping = '';
        this.URL = '';

        this.$element = $('tooltip');
        this.hidden = true;
    }

    load(record) {
        this.Time = record.Time;
        this.Place = record.Place;
        this.Seconds = record.Seconds;
        this.Name = record.Name;
        this.Year = record.Year;
        this.Nationality = record.Nationality;
        this.Doping = record.Doping;
        this.URL = record.URL;

        this.lock = true;
        this.render();
    }

    render() {
        this.$element.html(this.htmlContent());
        !this.$element.hasClass('info') && this.$element.addClass('info');
    }

    htmlContent() {
        return  '<div>Rider: ' + this.Name + '</div>' +
                '<div>Nationality: ' + this.Nationality + '</div>' +
                '<div>Ranking: ' + this.Place + '</div>' +
                '<div>Record: ' + this.Time + '</div>' +
                '<div>Doping Allegation: ' + this.Doping + '</div>';
    }

    hide() {
        this.lock = false;
        setTimeout(_ => {
            if(!this.lock) this.$element.hasClass('info') && this.$element.removeClass('info');    
        }, 100);
    }
}


const tooltip = new Tooltip();

$.getJSON(url, records => {
    records.forEach(record => record.dateTime = new Date('December 17, 1995 03:' + record.Time));

    const xScale = d3.time.scale()
        .domain([new Date('December 17, 1995 03:40:00'), new Date('December 17, 1995 03:36:30')])
        .range([0, width], .1);

    const xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .tickFormat(d3.time.format('%M:%S'));

    const yScale = d3.scale.linear()
        .domain([37, records[0].Place])
        .range([height, 0]);

    const yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left');

    const chart = d3
        .select('.chart')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
            .attr('transform', _ => `translate(${margin.left}, ${margin.top})`);

    chart
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis)
            .append('text')
            .attr('y', -7)
            .attr('x', width - margin.right)
            .text('Timing');

    chart
        .append('g')
        .attr('class', 'y axis')
        .attr('transform', `translate(0, 0)`)
        .call(yAxis)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 15)
            .style('text-anchor', 'end')
            .text('Ranking');

    const riders = chart
        .selectAll('.rider')
        .data(records)
        .enter()

    const rider = riders
        .append('g')
        .attr('class', 'rider')
        .attr('transform', record => `translate(${xScale(record.dateTime)}, ${yScale(record.Place)})`)
        .on('mouseenter', record => tooltip.load(record))
        .on('mouseout', _ => tooltip.hide());


    rider.append('circle')
        .attr('r', 3.5)
        .attr('cx', 0)
        .attr('cy', 0);
            
    rider.append('text')
        .attr('x', 5)
        .attr('y', 3)
        .text(record => record.Name);
});


