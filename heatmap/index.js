// r,g,b values are from 0 to 1
// h = [0,360], s = [0,1], v = [0,1]
//      if s == 0, then h = -1 (undefined)
function RGBtoHSV (RGB) {
    let min = Math.min(RGB.r, RGB.g, RGB.b);
    let max = Math.max(RGB.r, RGB.g, RGB.b);
    let delta = max - min;

    let HSV = {h: undefined, s: undefined, v: undefined};

    HSV.v = max;

    if (max == 0) {
        HSV.s = 0;
        HSV.h = -13;
        return HSV;
    }

    HSV.s = delta / max;

    if (RGB.r == max) HSV.h = (RGB.g - RGB.b) / delta;
    else if (RGB.g == max) HSV.h = 2 + (RGB.b - RGB.r) / delta;
    else HSV.h = 4 + (RGB.r - RGB.g) / delta;

    HSV.h *= 60; // degrees
    if (HSV.h < 0) HSV.h += 360;

    return HSV;
};


function HSVtoRGB (HSV) {
    let RGB = {r: undefined, g: undefined, b: undefined};
    
    if (HSV.s == 0) {
        RGB.r = RGB.g = RGB.b = HSV.v;
        return RGB;
    }

    let h = HSV.h / 60;          
    let i = Math.floor(h);
    let f = h - i;     

    let p = HSV.v * (1 - HSV.s);
    let q = HSV.v * (1 - HSV.s * f);
    let t = HSV.v * (1 - HSV.s * (1 - f));

    switch (i) {
        case 0: RGB = {r: HSV.v, g: t, b: p}; break;
        case 1: RGB = {r: q, g: HSV.v, b: p}; break;
        case 2: RGB = {r: p, g: HSV.v, b: t}; break;
        case 3: RGB = {r: p, g: q, b: HSV.v}; break;
        case 4: RGB = {r: t, g: p, b: HSV.v}; break;
        default: RGB = {r: HSV.v, g: p, b: q}; break;
    };

    return RGB;
};


const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';
const margin = {top: 20, right: 30, bottom: 30, left: 40}
const height = 400 - margin.top - margin.bottom;
const width = 750 - margin.left - margin.right;
const $tooltip = $('tooltip');
const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let baseTemperature;


class Tooltip {
    constructor() {
        this.Year = 0;
        this.Month = 0;
        this.Variance = 0;

        this.$element = $('tooltip');
        this.hidden = true;
    }

    load(record) {
        this.Month = Months[record.month - 1];
        this.Year = record.year;
        this.Variance = record.variance;

        this.lock = true;
        this.render();
    }

    render() {
        this.$element.html(this.htmlContent());
        !this.$element.hasClass('info') && this.$element.addClass('info');
    }

    htmlContent() {
        return  '<div>Year: ' + this.Year + '</div>' +
                '<div>Month: ' + this.Month + '</div>' +
                '<div>Variance: ' + this.Variance.toFixed(2) + ' &deg;C</div>' +
                '<div>Actual: ' + (this.Variance + baseTemperature).toFixed(2) + ' &deg;C</div>';
    }

    updatePosition(posX, posY) {
        this.$element.css('left', posX + 'px');
        this.$element.css('top', posY + 'px');
    }

    hide() {
        this.lock = false;
        setTimeout(_ => {
            if(!this.lock) this.$element.hasClass('info') && this.$element.removeClass('info');    
        }, 100);
    }
}


const tooltip = new Tooltip();

$.getJSON(url, recording => {
    baseTemperature = recording.baseTemperature;
    const records = recording.monthlyVariance;

    const Scales = {
        xmin: _.min(records.map(record => record.year)),
        xmax: _.max(records.map(record => record.year)),
        ymin: _.min(records.map(record => record.month)),
        ymax: _.max(records.map(record => record.month)),
        vmin: _.min(records.map(record => record.variance)),
        vmax: _.max(records.map(record => record.variance))
    };

    const xScale = d3.scale.linear()
        .domain([Scales.xmin, Scales.xmax])
        .range([0, width], .1);

    const xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .tickFormat(d3.format('d'));

    const yScale = d3.scale.ordinal()
        .domain(Months)
        .rangeBands([0, height]);

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
            .attr('y', 16)
            .attr('x', width - margin.right + 20)
            .text('Year');

    chart
        .append('g')
        .attr('class', 'y axis')
        .attr('transform', `translate(0, 0)`)
        .call(yAxis);

    const entries = chart
        .selectAll('.entry')
        .data(records)
        .enter();

    const entry = entries
        .append('rect')
        .attr('class', 'entry')
        .attr('width', width / 263)
        .attr('height', height / 12)
        .attr('transform', record => `translate(${xScale(record.year) - width / 263 / 2}, ${yScale(Months[record.month - 1])})`)
        .attr('fill', record => {
            let relativeVariance = (record.variance - Scales.vmin) / (Scales.vmax - Scales.vmin);
            let hsv = {
                h: 120 * Math.pow(Math.E, 1 - relativeVariance) - 155,
                s: 0.7,
                v: 1
            };

            let rgb = HSVtoRGB(hsv);
            rgb.r = parseInt(rgb.r * 255, 10);
            rgb.g = parseInt(rgb.g * 255, 10);
            rgb.b = parseInt(rgb.b * 255, 10);

            return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        })
        .on('mouseenter', record => tooltip.load(record))
        .on('mousemove', record => tooltip.updatePosition(d3.event.pageX + 20, d3.event.pageY))
        .on('mouseout', _ => tooltip.hide());
});
