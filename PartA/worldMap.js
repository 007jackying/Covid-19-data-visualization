function DrawWorldMap() {
    // The svg
    var svg = d3.select("#worldMap");
    const width = window.innerWidth;
    const height = window.innerHeight;
    // Map and projection
    const projection = d3.geoMercator()
        .translate([width / 2, height / 2])
        .scale((width - 1) / 2 / Math.PI);
    const path = d3.geoPath().projection(projection);

    //color scales
    var colorScale = d3.scaleThreshold()
        .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
        .range(d3.schemeBlues[7]);

    //for tooltip 
    var offsetL = document.getElementById('board').offsetLeft + 10;
    var offsetT = document.getElementById('board').offsetTop + 10;

    var tooltip = d3.select("#board")
        .append("div")
        .attr("class", "tooltip hidden");

    var chart1 = d3.select('#chart1');
    // set the dimensions and margins of the graph
    var marginC1 = { top: 10, right: 30, bottom: 20, left: 50 },
        widthC1 = 460 - marginC1.left - marginC1.right,
        heightC1 = 400 - marginC1.top - marginC1.bottom;

    chart1.append("svg")
        .attr("width", widthC1 + marginC1.left + marginC1.right)
        .attr("height", heightC1 + marginC1.top + marginC1.bottom)
        .append("g")
        .attr("transform",
            "translate(" + marginC1.left + "," + marginC1.top + ")");


    //GEOjson save into this
    var geoPathJSon = {};
    var covidCSV = {};
    var countriesJson = {};


    // Data and color scale
    var data2 = d3.map();
    var color = d3.scaleQuantile()
        .range(["rgb(237, 248, 233)", "rgb(186, 228, 179)", "rgb(116,196,118)", "rgb(49,163,84)", "rgb(0,109,44)"]);


    //Bar chart
    var x = d3.scaleBand()
        .rangeRound([0, width])
        .padding(0.1)
        .align(0.1);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    var z = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var stack = d3.stack()
        .offset(d3.stackOffsetExpand);


    //http://learnjsdata.com/read_data.html << promise examples
    Promise.all([
        d3.json("jsonfiles/geo.json"),
        d3.csv('jsonfiles/OWID_DATA.csv'),
        d3.json('jsonfiles/countries.json'),
        d3.csv('jsonfiles/result.csv')
    ]).then(function (data) {
        // console.log('yes')
        geoPathJSon = data[0]; //first dataset
        covidCSV = data[1];
        countriesJson = data[2];
        toptenCountriesData = data[3];
        // console.log("countriesJSON", countriesJson);
        // console.log(geoPathJSon.features);
        // console.log(covidCSV);

        var countries = [];
        var totalCaseData = [];
        var totalCasesByCountries = [];
        var performanceByCountry = [];
        var toptenPerformance = [];
        var toptenCountries = ["United States", "India", "Brazil", "Russia", "Argentina", "Spain", "Colombia", "France", "Peru", "Mexico"];
        var chengedMonth = "March"; //default as march



        var eachMonth = ['1/13/2020', '2/13/2020', '3/13/2020', '4/13/2020', '5/13/2020', '6/13/2020', '7/13/2020', '8/13/2020', '9/13/2020', '10/13/2020']
        var months = ['March', 'April', 'May', 'June', 'July', 'August', 'September', 'October'];
        //sort all countries cases by latest date
        for (var i = 0; i < covidCSV.length; i++) {
            // now based on 10/15/2020 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

            for (var j = 0; j < eachMonth.length; j++) {
                if (covidCSV[i].date == eachMonth[j]) {
                    let details = getCountryData(countriesJson, covidCSV[i]);
                    let date = new Date(eachMonth[j])
                    // console.log(date.getMonth())
                    if (details.length > 0) {
                        totalCasesByCountries.push({
                            countryName: covidCSV[i].location,
                            date: covidCSV[i].date,
                            TotalCase: covidCSV[i].total_cases,
                            latitude: details[0][0],
                            longitude: details[0][1],
                            capital: details[1],
                            totalDeaths: covidCSV[i].total_deaths,
                            totalRecovered: covidCSV[i].total_cases - covidCSV[i].total_deaths,
                            createdDate: eachMonth[j],
                            month: date.toLocaleString('default', { month: 'long' })
                        });
                        countries.push(covidCSV[i].location);
                        //console.log(date)
                        // console.log(date.toLocaleString('default', { month: 'long' }));
                    }
                    // console.log(details[2]);
                }

            }
            if (covidCSV[i].date === '10/13/2020') {
                performanceByCountry.push({
                    countryName: covidCSV[i].location,
                    date: covidCSV[i].date,
                    TotalCase: covidCSV[i].total_cases,
                    totalDeaths: covidCSV[i].total_deaths,
                    totalRecovered: covidCSV[i].total_cases - covidCSV[i].total_deaths
                });
            }



        };
        //console.log('performance by country: ', performanceByCountry)
        // add the options to the button
        d3.select("#monthId")
            .selectAll('monthOptions')
            .data(months)
            .enter()
            .append('option')
            .text(function (d) { return d; }) // text showed in the menu
            .attr("value", function (d) { return d; }) // corresponding value returned by the button

        //hover effect when mouseover country
        let mouseOverCountry = function (d) {
            d3.selectAll(".mapPath")
                .transition()
                .duration(200)
                .style("opacity", .5)
            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", 1)
                .style("stroke", "black")
        }

        let mouseLeave = function (d) {
            d3.selectAll(".mapPath")
                .transition()
                .duration(200)
                .style("opacity", .8)
            d3.select(this)
                .transition()
                .duration(200)
                .style("stroke", "transparent")
        }

        // console.log(totalCasesByCountries);
        svg.call(d3.zoom().on('zoom', function () {
            map.attr('transform', d3.event.transform);

        }));
        //draw map
        var map = svg.append("g")
            .selectAll("path")
            .data(geoPathJSon.features)
            .enter()
            .append("path")
            .attr('class', function (d) { return "mapPath country " + d.properties.name + " " + d.properties.economy })
            .attr('name', function (d) { return d.properties.name })
            .on('click', selected)
            .on('mouseover', mouseOverCountry)
            .on("mousemove", showTooltip)
            .on("mouseout", mouseLeave, function (d, i) {
                tooltip.classed("hidden", true);

            })
            //color based on the total cases //https://www.d3-graph-gallery.com/graph/choropleth_basic.html
            .attr("fill", function (d) {
                //get the data value
                var value = total_cases(d);
                // console.log(value);

                if (value[0]) {
                    //If value exists
                    return colorSelector(value[0]);
                } else {
                    // If value is undefined
                    //we do this because alaska and hawaii are not in dataset we are using but still in projections
                    return "#ccc"
                }

            })
            .attr("d", path)
            .attr('transform', "scale(0.5)")
            .attr('transform', "translate(0,210),scale(0.5)");

        // //legend
        // svg.append('g')
        // .selectAll('')


        d3.select('#monthId')
            .on('change', function (d) {
                // recover the option that has been chosen
                var selectedOption = d3.select(this).property("value")
                // run the updateChart function with this selected option
                chengedMonth = selectedOption;
                // console.log('selected: ',chengedMonth)
                updateOptions(selectedOption)
            })


        function updateOptions(selectedOption) {
            map.transition().duration(1500).attr("fill", function (d) {
                //get the data value
                var value = total_cases(d, selectedOption);
                // console.log(value);

                if (value[0]) {
                    //If value exists
                    return colorSelector(value[0]);
                } else {
                    // If value is undefined
                    //we do this because alaska and hawaii are not in dataset we are using but still in projections
                    return "#ccc"
                }

            })

        }


        function total_cases(d, date, message) {
            let totalSignal = message;
            let month = date;
            //console.log(month);
            let totalcases = 0;
            let totalDeatths = 0;
            if (totalSignal === undefined) {
                for (let i = 0; i < totalCasesByCountries.length; i++) {
                    if (month === undefined) {
                        if (totalCasesByCountries[i].countryName === d.properties.name && totalCasesByCountries[i].month === "March") {
                            totalcases = totalCasesByCountries[i].TotalCase;
                            totalDeatths = totalCasesByCountries[i].totalDeaths;
                        }
                    } else {
                        if (totalCasesByCountries[i].countryName === d.properties.name && totalCasesByCountries[i].month === month) {
                            totalcases = totalCasesByCountries[i].TotalCase;
                            totalDeatths = totalCasesByCountries[i].totalDeaths;
                        }
                    }

                }
                return [totalcases, totalDeatths];

            } else {
                for (let i = 0; i < totalCasesByCountries.length; i++) {
                    if (month === undefined) {
                        if (totalCasesByCountries[i].countryName === d.properties.name) {
                            totalcases = totalCasesByCountries[i].TotalCase;
                            totalDeatths = totalCasesByCountries[i].totalDeaths;
                        }
                    } else {
                        if (totalCasesByCountries[i].countryName === d.properties.name && totalCasesByCountries[i].month === month) {
                            totalcases = totalCasesByCountries[i].TotalCase;
                            totalDeatths = totalCasesByCountries[i].totalDeaths;
                        }
                    }

                }
                return [totalcases, totalDeatths];
            }



        }

        //tooltip
        function showTooltip(d) {
            //console.log(month);
            let month = chengedMonth; // default will be 3
            let totalcases = 0;
            let totalDeaths = 0;
            for (let i = 0; i < totalCasesByCountries.length; i++) {
                if (totalCasesByCountries[i].countryName === d.properties.name && totalCasesByCountries[i].month === month) {
                    if (totalCasesByCountries[i].TotalCase !== undefined) {
                        totalcases = totalCasesByCountries[i].TotalCase;
                        totalDeaths = totalCasesByCountries[i].totalDeaths;
                        break;
                    } else {
                        totalDeaths = totalCasesByCountries[i].totalDeaths;
                        break;

                    }

                }
            }
            label = "Country: " + d.properties.name + ", Total Confirmed Cases: " + totalcases + ", Total Deaths: " + totalDeaths;
            var mouse = d3.mouse(svg.node())
                .map(function (d) { return parseInt(d); });
            tooltip.classed("hidden", false)
                .attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT) + "px")
                .html(label);

            d3.select('#covidInUSA')
                .text(label)
        }


        var colorBars = ["#F9F9F9", "#F4D4D4", "#EEAEAE", "#E98989", "#E46363", "#DE3E3E", "#D91818"]
        var keysBars = ['zero or no reported cases', '1 - 99', ' 100 - 999', '1000 - 9999', "10,000 - 99,999", "100,000 - 999,999", "1,000,0000 or more"]
        var lx = 100;
        var ly = 500;
        //add legend bar
        var colorscaess = d3.scaleOrdinal()
            .domain(keysBars)
            .range(colorBars);

        //select svg place
        // Add one dot in the legend for each name.
        var size = 20
        svg.selectAll("mydots")
            .data(keysBars)
            .enter()
            .append("rect")
            .attr("x", 50)
            .attr("y", function (d, i) { return 500 + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("width", size)
            .attr("height", size)
            .style("fill", function (d) { return colorscaess(d) })

        // Add one dot in the legend for each name.
        svg.selectAll("mylabels")
            .data(keysBars)
            .enter()
            .append("text")
            .attr("x", 50 + size * 1.2)
            .attr("y", function (d, i) { return 500 + i * (size + 5) + (size / 2) }) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", "black")
            .attr('font', "bold 10px san serif")
            .text(function (d) { return d })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")



        //stacked bar chart //http://bl.ocks.org/mstanaland/6100713









    });
    createChart();

    function createChart() {
        // set the dimensions and margins of the graph
        var margin = { top: 10, right: 30, bottom: 20, left: 100 },
            width = 1200 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select(".chart1")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")")
                .attr('class',"barchart");
            

        d3.csv('jsonfiles/result.csv').then(function (data) {




            var subgroups = data.columns.slice(1);

            // List of groups = species here = value of the first column called group -> I show them on the X axis
            var groups = d3.map(data, function (d) { return (d.countryName) }).keys()


            // Add X axis
            var x = d3.scaleBand()
                .domain(groups)
                .range([0, width])
                .padding(0.2)
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).tickSizeOuter(0));

            // Add Y axis
            var y = d3.scaleLinear()
                .domain([0, 100])
                .range([height, 0]);
            svg.append("g")
                .call(d3.axisLeft(y));

            // color palette = one color per subgroup
            var color = d3.scaleOrdinal()
                .domain(subgroups)
                .range(['#e41a1c', '#1F2D4D'])


            // Normalize the data -> sum of each group must be 100!
            console.log(data)
            dataNormalized = []
            data.forEach(function (d) {
                // Compute the total
                tot = 0
                for (i in subgroups) { name = subgroups[i]; tot += +d[name] }
                // Now normalize
                for (i in subgroups) { name = subgroups[i]; d[name] = d[name] / tot * 100 }
            })

            //stack the data? --> stack per subgroup
            var stackedData = d3.stack()
                .keys(subgroups)
                (data)

            // console.log("d[0] : ", stackedData[0]);
            // console.log("d[1] : ", stackedData[1]);
            // console.log("d[2] : ", stackedData[2]);

            var spacebetween = 20;
            // Show the bars
            svg.append("g")
                .selectAll("g")
                // Enter in the stack data = loop key per key = group per group
                .data(stackedData)
                .enter().append("g")
                .attr("fill", function (d) { return color(d.key); })
                .selectAll("rect")
                // enter a second time = loop subgroup per subgroup to add all rectangles
                .data(function (d) { return d; })
                .enter().append("rect")
                .attr("x", function (d) { return x(d.data.countryName); })
                .attr("y", function (d) { return y(d[1]); })
                .transition()
                .attr("height", function (d) { return y(d[0]) - y(d[1]); })
                .attr("width", x.bandwidth())
                .attr('class', "barStacked");

            // Draw legend

            var keys = ['Total Case', 'Total Death']

            // Add one dot in the legend for each name.
            var size = 20
            var g= d3.select('.chart1').append('svg')
            g.append('g')
            .selectAll('legends2')
                     .data(keys)
                     .enter()
                     .append("rect")
                     .attr('class',"legends2")
                     .attr("x", 10)
                     .attr("y", function (d, i) { return 100 + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
                     .attr("width", size)
                     .attr("height", size)
                     .style("fill", function (d) { return color(d) })

             g.selectAll("mylabels")
                .data(keys)
                .enter()
                .append("text")
                .attr('class',"legends2")
                .attr("x", 35)
                .attr("y", function (d, i) { return 100 + i * (size + 5) + (size / 2) }) // 100 is where the first dot appears. 25 is the distance between dots
                .style("fill", "black")
                .text(function (d) { return d })
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")

            d3.selectAll('.legends2')
                .attr('transform','translate(0,-90)')
            
            // svg.selectAll("legends2")
            //     .data(keys)
            //     .enter()
            //     .append("rect")
            //     .attr("x", width - 100)
            //     .attr("y", function (d, i) { return 100 + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
            //     .attr("width", size)
            //     .attr("height", size)
            //     .style("fill", function (d) { return color(d) })

            // // Add one dot in the legend for each name.
            // svg.selectAll("mylabels")
            //     .data(keys)
            //     .enter()
            //     .append("text")
            //     .attr("x", width - 80)
            //     .attr("y", function (d, i) { return 100 + i * (size + 5) + (size / 2) }) // 100 is where the first dot appears. 25 is the distance between dots
            //     .style("fill", "black")
            //     .text(function (d) { return d })
            //     .attr("text-anchor", "left")
            //     .style("alignment-baseline", "middle")


        })


    }
    //mouse selection on countries
    function selected() {
        d3.select('.selected').classed('selected', false);
        d3.select(this).classed('selected', true);
    }




    function getCountryData(countriesJson, country) {
        var details = [];
        countriesJson.forEach((c) => {
            if (c.name === country.location) {
                details = [c.latlng, c.capital];
            }
        });
        return details;
    }

    function colorSelector(value) {
        if (value < 100) {
            return "#F4D4D4"
        } else if (value < 1000) {
            return "#EEAEAE"
        } else if (value < 10000) {
            return "#E98989"
        } else if (value < 100000) {
            return "#E46363"
        } else if (value < 1000000) {
            return "#DE3E3E"
        } else {
            return "#D91818"
        }

    }




}