function stackedarea(local, data) {
    let data2 = [];
    let subgroups = ['positive', 'negative', 'neutral'];
    //let groups = [];
    let positive = 0;
    let negative = 0;
    let neutral = 0;
    let total = 0;
    let ttime = parseInt(new Date("1989-10-17 17:05:00" ).getTime());
    data['22:00:00'] = '';
    for(let dd in data){
        if(parseInt(new Date("1989-10-17 " + dd).getTime()) > ttime){
            data2.push({'time':ttime, "positive": positive/total,
                "negative": negative/total,
                "neutral": neutral/total})
            positive = 0;
            negative = 0;
            neutral = 0;
            total = 0;
            ttime += 300000;
        }else{
            positive += data[dd].positive;
            negative += data[dd].negative;
            neutral += data[dd].neutral;
            total += data[dd].total;

        }
        /*data2.push({'time':dd, "positive": data[dd].positive/data[dd].total,
            "negative": data[dd].negative/data[dd].total,
            "neutral": data[dd].neutral/data[dd].total});*/
        //groups.push(dd);
    }

        // set the dimensions and margins of the graph
        var margin = {top: 10, right: 30, bottom: 20, left: 50},
        width = 900 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select(local)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

        // Parse the Data


        // List of subgroups = header of the csv files = soil condition here
        //var subgroups = data.columns.slice(1)

        // List of groups = species here = value of the first column called group -> I show them on the X axis
        var groups = d3.map(data2, function(d){return(d.time)}).keys()

        // Add X axis
        var x = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding([0])
        svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0));

        // Add Y axis
        var y = d3.scaleLinear()
        .domain([0, 1])
        .range([ height, 0 ]);
        svg.append("g")
        .call(d3.axisLeft(y));

        // color palette = one color per subgroup
        var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#e41a1c','#377eb8','#4daf4a'])

        //stack the data? --> stack per subgroup
        var stackedData = d3.stack()
        .keys(subgroups)
        (data2)

        // Show the bars
        svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter().append("g")
        .attr("fill", function(d) { return color(d.key); })
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("x", function(d) { return x(d.data.time); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("width",x.bandwidth())
}