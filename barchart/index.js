const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json';
const margin = {top: 20, right: 30, bottom: 30, left: 40}
const height = 400 - margin.top - margin.bottom;
const width = 750 - margin.left - margin.right;
const $tooltip = $('tooltip');
let tooltipLock = false;

Date.prototype.toFormattedString = function() {
    const month = this.toString().match(/(\s[a-zA-Z]{3}\s)/g)[0].replace(/\s/g, '');
    const year = this.toString().match(/(\s[0-9]{4})/g)[0];
    const quarter = ` (Q${Math.ceil(this.getMonth() / 4) + 1})`;
    return month + year + quarter;
};

Number.prototype.toCurrency = function(icon = '$') {
    return icon + this.toFixed(2).replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, '$1,');
}

$.getJSON(url, response => {
    const products = response.data.map(data => ({time: new Date(data[0]), amount: data[1]}));

    const getXPosition = d3
        .time.scale()
        .domain([new Date(response.from_date), new Date(response.to_date)])
        .domain([products[0].time, products[products.length - 1].time])
        .range([0, width], .1);

    const getHeight = d3
        .scale.linear()
        .domain([0, d3.max(products.map(data => data.amount))])
        .range([height, 0]);

    const xAxis = d3
        .svg.axis()
        .scale(getXPosition)
        .orient('bottom');

    const yAxis = d3
        .svg.axis()
        .scale(getHeight)
        .orient('left');

    const chart = d3
        .select('.chart')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
            .attr('transform', _ => `translate(${margin.left}, ${margin.top})`);

    const bars = chart
        .selectAll('rect')
        .data(products)
        .enter().append('rect')
        .attr('x', data => getXPosition(data.time))
        .attr('y', data => getHeight(data.amount))
        .style('height', data => (height - getHeight(data.amount)) + 'px')
        .style('width', _ => (width / products.length - 0.1) + 'px')
        .on('mouseenter', _ => {
            tooltipLock = true;
            !$tooltip.hasClass('info') && $tooltip.addClass('info');
        })
        .on('mousemove', data => {
            $tooltip.children('amount').html(data.amount.toCurrency('$') + ' Billions');
            $tooltip.children('time').html(data.time.toFormattedString());
            $tooltip.css('left', d3.event.pageX + 20 + 'px')
            $tooltip.css('top', d3.event.pageY + 'px')
        })
        .on('mouseout', _ => {
            tooltipLock = false;
            setTimeout(_ => {
                if(!tooltipLock) $tooltip.hasClass('info') && $tooltip.removeClass('info');
            }, 100);
        })

    chart
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

    chart
        .append('g')
        .attr('class', 'y axis')
        .attr('transform', `translate(0, 0)`)
        .call(yAxis)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 15)
            .style('text-anchor', 'end')
            .text('Billion Dollars');
});


