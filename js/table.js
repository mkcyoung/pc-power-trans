/** Class implementing the table */
class Table{

    constructor(BEBdata,station_Data,time,transNet,updateTime){
        this.BEB = BEBdata;
        this.station = station_Data;
        this.activeTime = time;
        console.log("BEBdata",this.BEB)
        console.log("Station_Data",this.station)
        this.updateTime = updateTime;

        //Clicked busses
        this.clickedBusses = [];

        //Reference to transnet
        this.transNet = transNet;

        //Margins for table cells- the bostock way
        let table1_div = d3.select('.view2').node().getBoundingClientRect()
        let table1_width = table1_div.width
        let table1_height = table1_div.height
        d3.select("#mytable2").select("tbody").style("height",`${table1_height}px;`)


        // let num_cols = 5
        // let cell_width = table_width/num_cols
        // // let cell_width = 150
        // console.log(cell_width)
        // let cell_height = 30
        // this.margin = {top: 10, right: 10, bottom: 10, left: 10};
        // this.width = cell_width - this.margin.left - this.margin.right;
        // this.height = cell_height - this.margin.top-this.margin.bottom;

        // get size of first table which should already by correct size via styling
        let table_div = d3.select('#mytable').select('th').node().getBoundingClientRect()
        let cell_width = table_div.width+5
        let cell_height = table_div.height-10
        // console.log(cell_width,cell_height)

        this.margin = {top: 2, right: 2, bottom: 0, left: 0};
        this.width = cell_width - this.margin.left - this.margin.right;
        this.height = cell_height - this.margin.top-this.margin.bottom;

        //Margins - the bostock way - line chart
        //Margins - the bostock way - line chart
        // Gets new sizes and sets new canvas dimensions
        let chart1 = d3.select('.chart-1').node().getBoundingClientRect()
        // let chart2 = d3.select('.chart-2').node().getBoundingClientRect()

        //Margins - the bostock way - line chart
        this.lineHeight = chart1.height -10;
        this.lineWidth = chart1.width - 5;
        this.marginL = {top: 30, right: 10, bottom: 30, left: 60};
        this.widthL = this.lineWidth - this.marginL.left - this.marginL.right;
        this.heightL = this.lineHeight - this.marginL.top-this.marginL.bottom; 

        // I'm gonna make this an array of objects with keys and sorted values
        this.tableHeaders = [
            {
                'key':"BEB",
                'sorted': false
            },
            {
                'key':"location",
                'sorted': false
            },
            {
                'key': "energy",
                'sorted': false
            },
            {
                'key': "power",
                'sorted': false
            },
            {
                'key':'speed',
                'sorted': false
            }
        ];

         //Set-up scales etc. 
    
        //Finding max/min of BEB energy
        this.max_energy = d3.max(this.BEB.map((d) => {
            return d3.max(d.energy.map((d)=>{
                return parseInt(d.value)
            }))
        }));
        this.min_energy = d3.min(this.BEB.map((d) => {
            return d3.min(d.energy.map((d)=>{
                return parseInt(d.value)
            }))
        }));
        //console.log(this.max_energy,this.min_energy);
        //Finding max/min of BEB power
        this.max_power = d3.max(this.BEB.map((d) => {
            return d3.max(d.power.map((d)=>{
                return parseInt(d.value)
            }))
        }));
        this.min_power = d3.min(this.BEB.map((d) => {
            return d3.min(d.power.map((d)=>{
                return parseInt(d.value)
            }))
        }));


    }

    createTable(){

    // Scales for line chart
    this.timeScale_Date = d3.scaleTime().domain([new Date(2020,0,1,5), new Date(2020,0,2,5) ]);
    this.timeScale = d3.scaleLinear().domain([1,288]) //.range([this.marginL.left,this.marginL.left+this.widthL]);
    this.energyLineScale = d3.scaleLinear().domain([this.min_energy,this.max_energy]).range([this.heightL+this.marginL.top,this.marginL.top]);
    this.powerLineScale = d3.scaleLinear().domain([this.min_power,this.max_power]).range([this.heightL+this.marginL.top,this.marginL.top]);

    //Scales
    this.energybarScale = d3.scaleLinear().domain([this.min_energy,this.max_energy]).range([this.margin.left,this.width-this.margin.right]);
    this.energyColorScale = d3.scaleSequential(d3.interpolateReds).domain([this.min_energy,this.max_energy]);
    this.powerBarScale = d3.scaleLinear().domain([this.min_power,this.max_power]).range([this.margin.left,this.width-this.margin.right]);
    // this.powerColorScale = d3.scaleSequential(d3.interpolatePurples).domain([this.min_power,this.max_power]);
    this.powerColorScale = d3.scaleSequential(d3.interpolate('#AEA9F8','#100881')).domain([this.min_power,this.max_power]);
    //Make an ordinal color scale for stations
    let pow_stations = ["OTTC","KJTC","CTH","JRPR","KPR","EH","GS"];
    let pow_stations_nodes = ["n2","n13","n9","n33","n25","n31","n8"];
    this.station_mapping = {};
    pow_stations.forEach((pow_stations, i) => this.station_mapping[pow_stations] = pow_stations_nodes[i]);
    //console.log(station_mapping);
    this.stationColor = d3.scaleOrdinal(d3.schemeTableau10).domain(pow_stations);
    //Have to make a separate scale  with nodes as range b/c I'm a sloppy mthrfker
    this.stationColorNodes = d3.scaleOrdinal(d3.schemeTableau10).domain(pow_stations_nodes);
    //Create axes

    //Implement sorting
    // Binding headers column data to pre-existing html headers
    let headers = d3.select("thead").select("tr").selectAll("div")
        .data(this.tableHeaders);

    headers
        .on("click", (d, i) => {
            // d3.selectAll('tr').filter( f => this.clickedBusses.includes(f)).style("background-color","rgba(23, 162, 184, 0.15)")
            // d3.selectAll('tr').filter( f => !(this.clickedBusses.includes(f))).style("background-color","null")
            // d3.selectAll('tr').filter( f => this.clickedBusses.includes(f)).style("background-color","red")

            //BEB
            if (i == 0) {
                if (d.sorted === false) {
                    let newData = this.BEB.sort((a, b) => {
                        return a.BusID > b.BusID ? -1 : 1;
                    });
                    //console.log(newData);
                    d.sorted = true;
                    this.updateTable(newData);
                } else {
                    let newData = this.BEB.sort((a, b) => {
                        return a.BusID < b.BusID ? -1 : 1;
                    });
                    d.sorted = false;
                    this.updateTable(newData);
                }
            }

            //location
            if (i == 1) {
                if (d.sorted === false) {
                    let newData = this.BEB.sort((a, b) => {
                        return a.Location[this.activeTime] > b.Location[this.activeTime] ? -1 : 1;
                    });
                    d.sorted = true;
                    this.updateTable(newData);
                } else {
                    let newData = this.BEB.sort((a, b) => {
                        return a.Location[this.activeTime] < b.Location[this.activeTime] ? -1 : 1;
                    });
                    d.sorted = false;
                    this.updateTable(newData);
                }
            }

            //energy
            if (i == 2) {
                if (d.sorted === false) {
                    let newData = this.BEB.sort((a, b) => {
                        return parseFloat(a.energy[this.activeTime].value) > parseFloat(b.energy[this.activeTime].value) ? -1 : 1;
                    });
                    d.sorted = true;
                    this.updateTable(newData);
                } else {
                    let newData = this.BEB.sort((a, b) => {
                        return parseFloat(a.energy[this.activeTime].value) < parseFloat(b.energy[this.activeTime].value) ? -1 : 1;
                    });
                    d.sorted = false;
                    this.updateTable(newData);
                }
            }

            //power
            if (i == 3) {
                if (d.sorted === false) {
                    let newData = this.BEB.sort((a, b) => {
                        return parseFloat(a.power[this.activeTime].value) > parseFloat(b.power[this.activeTime].value) ? -1 : 1;
                    });
                    d.sorted = true;
                    this.updateTable(newData);
                } else {
                    let newData = this.BEB.sort((a, b) => {
                        return parseFloat(a.power[this.activeTime].value) < parseFloat(b.power[this.activeTime].value) ? -1 : 1;
                    });
                    d.sorted = false;
                    this.updateTable(newData);
                }
            }

            //speed
            if (i == 4) {
                if (d.sorted === false) {
                    let newData = this.BEB.sort((a, b) => {
                        return parseFloat(a.current_speed[this.activeTime]) > parseFloat(b.current_speed[this.activeTime]) ? -1 : 1;
                    });
                    d.sorted = true;
                    this.updateTable(newData);
                } else {
                    let newData = this.BEB.sort((a, b) => {
                        return parseFloat(a.current_speed[this.activeTime]) < parseFloat(b.current_speed[this.activeTime]) ? -1 : 1;
                    });
                    d.sorted = false;
                    this.updateTable(newData);
                }
            }

    });

    this.updateTable();
    }


    // gets bounding box margin and re-adjusts
    updateTableSize(){
        // get size of first table which should already by correct size via styling
        let table_div = d3.select('#mytable').select('th').node().getBoundingClientRect()
        let cell_width = table_div.width+5
        let cell_height = table_div.height-10
        // console.log(cell_width,cell_height)

        // this.margin = {top: 5, right: 0, bottom: 0, left: 0};
        this.width = cell_width - this.margin.left - this.margin.right;
        this.height = cell_height - this.margin.top-this.margin.bottom;

    }

    updateTable(){


        /** Updates the table with data **/
        let that = this;

        //Create table rows
        let rows = d3.select("tbody").selectAll('tr').data(this.BEB);

        //Enter selection
        let rowsE = rows.enter().append('tr');

        //Appending and initializing table headers + table cells
        rowsE.append("th").classed("busID",true).append("text");
        rowsE.append("td").classed("locationR",true).append("text").classed("locationT",true);
        rowsE.append("td").classed("energyR",true).append("svg")
            .append("rect").classed("energyRect",true);
        rowsE.append("td").classed("powerR",true).append("svg")
            .append("rect").classed("powerRect",true);
        rowsE.append("td").classed("speedR",true).append("text").classed("speedT",true)


        //Handle exits
        rows.exit().remove();

        //Merge
        rows = rows.merge(rowsE);

        //Update

        //Header
        rows.select(".busID")
            .attr("width",this.width+this.margin.left+this.margin.right)
            .attr("height",this.height+this.margin.top+this.margin.bottom)
            .html(d => d.id);

        //Location
        let locationR = rows.select(".locationR")
            .attr("width",this.width+this.margin.left+this.margin.right)
            .attr("height",this.height+this.margin.top+this.margin.bottom);

        locationR.select(".locationT")
            .attr("y",this.margin.top)
            .attr("x",this.margin.left)
            .style("color", d => (d.Location[this.activeTime] == undefined) ? "black" : this.stationColor(d.Location[this.activeTime]))
            .text(d => (d.Location[this.activeTime] == undefined) ? "On the road" : d.Location[this.activeTime]);

        //Energy
        let energyR = rows.select(".energyR").select("svg")
            .attr("width",this.width+this.margin.left+this.margin.right)
            .attr("height",this.height+this.margin.top+this.margin.bottom);

        //Energy Rect
        energyR.select(".energyRect")
            .attr("y",this.margin.top)
            .attr("x", d => this.margin.left + this.width + this.margin.right - this.energybarScale(parseInt(d.energy[this.activeTime].value)))
            .attr("fill",d => this.energyColorScale(parseInt(d.energy[this.activeTime].value)))
            .attr("width",d => this.energybarScale(parseInt(d.energy[this.activeTime].value)))
            .attr("height",this.height);

        //Power
        let powerR = rows.select(".powerR").select("svg")
            .attr("width",this.width+this.margin.left+this.margin.right)
            .attr("height",this.height+this.margin.top+this.margin.bottom);

        //Power Rect
        powerR.select(".powerRect")
            .attr("y",this.margin.top)
            .attr("x",0)
            .attr("fill",d => this.powerColorScale(parseInt(d.power[this.activeTime].value)))
            .attr("width",d => this.powerBarScale(parseInt(d.power[this.activeTime].value)))
            .attr("height",this.height);

        // Speed
        rows.select(".speedR")
            .attr("width",this.width+this.margin.left+this.margin.right)
            .attr("height",this.height+this.margin.top+this.margin.bottom)
            .select("text")
            .text((d,i) => {
                //console.log(d)
                let speed_list = [];
                if(d.Location[that.activeTime] == "On the road"){
                    d3.entries(d.Speeds).forEach( f => {
                        //console.log(f.value[that.activeTime].value)
                        speed_list.push(parseFloat(f.value[that.activeTime].value).toFixed(2))
                            // return console.log(f.value[that.activeTime].value)
                    })
                    d.current_speed[that.activeTime] = d3.max(speed_list).toString();
                    return (d3.max(speed_list)*12).toString()
                }
                else{
                    d.current_speed[that.activeTime] = 0;
                    return "At stop"
                }
                
            });

    
        //tooltip
        rows
            .on("mouseover", function (d) {
                // console.log(d)
                let current_station = d.Location[that.activeTime];

                d3.selectAll(".info-panel").transition()
                    .duration(200)
                    .style("opacity", 0.9);
                d3.select("#data-id").html(that.tooltipRenderID(d))
                d3.select("#data-info").html(that.tooltipRenderINFO(d))
                // I want to highlight entire charging station
                // d3.selectAll("."+that.station_mapping[d.Location[that.activeTime]])
                //     .classed("CHSP",true);
                
                
                // handles highlighting when bus is at a station
                if (that.station_mapping[current_station] != undefined){
                    // Checks first to see if its been clicked, then do relevant highlighting
                    if (!d3.select(`#line-${that.station_mapping[current_station]}`).classed("clicked-line")){
                        // d3.selectAll("."+that.station_mapping[current_station])
                        //     .attr("fill", d => that.stationColor(current_station));
                        // //highlights line
                        // d3.select(`#line-${that.station_mapping[d.Location[that.activeTime]]}`).classed("active-line-hover",true);
                        d3.selectAll("."+that.station_mapping[current_station]).filter(".transNode")
                            .classed("CHSP",true)
                            .attr("fill", d => that.stationColor(current_station));
                    }
                }
                // handles highlihgting while on the road
                else{
                    // Idea is to loop through location array backwards then forwards and highlight those two stations
                    // note: slice is start to end, end NOT included
                    // console.log(Object.values(d.Location).slice(0,that.activeTime+1).reverse())
                    // console.log(Object.values(d.Location).slice(that.activeTime,288))
                    // Finding what location it came from
                    let front = Object.values(d.Location).slice(0,that.activeTime+1).reverse();
                    let previous_station = null;
                    for (const item of front){
                        if (item != current_station){
                            previous_station = item;
                            break;
                        }
                    }
                    
                    // Finding what location is next
                    let back = Object.values(d.Location).slice(that.activeTime,288);
                    let next_station = null;
                    for (const item of back){
                        if (item != current_station){
                            next_station = item;
                            break;
                        }
                    }
                    // console.log("previous station: ",previous_station,"next_station: ",next_station)

                    // Now need to highlight going to and coming from stations....How can I make it obvious?
                    // If previous and next station are the same
                    if(previous_station == next_station){
                        let station_sel = d3.select("."+that.station_mapping[previous_station]);
                        repeat();

                        station_sel.classed("previous",true);
                        station_sel.classed("next",true);

                        function repeat(){
                            // Repeat coming from animation
                            station_sel
                                .attr("fill", 'red')
                                .attr('stroke-width','5px')
                                .transition()
                                .duration(700)
                                .attr("fill", 'lime')
                                .transition()
                                .duration(700)
                                .attr('stroke-width','1px')
                                .attr('fill', d => that.transNet.powLoadScale(d.chSP[that.activeTime].value))
                                .on('end',repeat);
                        }
                    }
                    else{
                        // Select the two nodes
                        // console.log(that.station_mapping[previous_station])
                        let prev_sel = d3.select("."+that.station_mapping[previous_station]);
                        let next_sel = d3.select("."+that.station_mapping[next_station]);

                        prev_sel.classed("previous",true);
                        next_sel.classed("next",true);
                        
                        repeat_prev();
                        repeat_next();
                        // setTimeout(repeat_next,400)

                        function repeat_prev(){
                            // Repeat coming from animation
                            prev_sel
                                .attr("fill", 'red')
                                .attr('stroke-width','5px')
                                .transition()
                                .duration(700)
                                .attr('stroke-width','1px')
                                .attr('fill', d => that.transNet.powLoadScale(d.chSP[that.activeTime].value))
                                .transition()
                                .duration(600)
                                .on('end',repeat_prev);
                            
                        };

                        function repeat_next(){
                            // repeat going to animation
                            next_sel
                                .attr("fill", 'lime')
                                .attr('stroke-width','5px')
                                .transition()
                                .duration(800)
                                .attr('stroke-width','1px')
                                .attr('fill', d => that.transNet.powLoadScale(d.chSP[that.activeTime].value))
                                .delay(200)
                                .transition()
                                .duration(300)
                                .on('end',repeat_next);
                        }


                    }


                }
                
            })
            .on("mouseout", function (d) {
                let current_station = d.Location[that.activeTime];
                // console.log(d)
                // console.log(that.transNet)

                d3.selectAll(".info-panel").transition()
                    .duration(500)
                    .style("opacity", 0);
                // d3.selectAll("."+that.station_mapping[d.Location[that.activeTime]]) 
                //     .classed("CHSP",false);

                // get station object
                let current_Station_object = that.transNet.data.nodes.filter(f => f.StationName == current_station)[0]
                // current bus is clicked 
                if (that.transNet.clickedStations.includes(current_Station_object)){
                    // console.log("here")
                    // just remove the color
                    d3.selectAll("."+that.station_mapping[current_station]).filter(".transNode")
                        .attr("fill", d => that.transNet.powLoadScale(d.chSP[that.activeTime].value));

                }
                else{
                    d3.selectAll("."+that.station_mapping[current_station]).filter(".transNode")
                        .classed("CHSP",false)
                        .attr("fill", d => that.transNet.powLoadScale(d.chSP[that.activeTime].value));
                }

                // Dehighlight everything
                // if(that.station_mapping[current_station] != undefined){
                //     if (!d3.select(`#line-${that.station_mapping[current_station]}`).classed("clicked-line")){

                //         d3.selectAll("."+that.station_mapping[current_station]).filter(".transNode")
                //         // Lesson here...this works because d refers to the data that's BOUND TO THE CIRCLE ELEMENT.. don't need the 
                //         // data in this class to access it... insane I didn't grasp that sooner...this makes things way easier moving forward.
                //             .classed("CHSP",false)
                //             .attr("fill", d => that.transNet.powLoadScale(d.chSP[that.activeTime].value));

                //     }
                // }

                // Handle the next and previous de-highlighting

                let next = d3.select('.next');
                let prev = d3.select('.previous');

                stop(prev);
                stop(next);
                next.classed("next",false);
                prev.classed("previous",false);
                
                // d3.select('.next')
                //     .classed("next",false)
                //     .interrupt()
                //     .transition()
                //     .duration(300)
                //     .attr("fill", d => that.transNet.powLoadScale(d.chSP[that.activeTime].value))
                //     .attr("stroke-width","1px");
                // d3.select('.previous')
                //     .classed("previous",false)
                //     .interrupt()
                //     .transition()
                //     .duration(300)
                //     .attr('fill', d => that.transNet.powLoadScale(d.chSP[that.activeTime].value))
                //     .attr('stroke-width','1px');

                function stop(selection){
                    selection.interrupt()
                        .transition()
                        .duration(300)
                        .attr("fill", d => that.transNet.powLoadScale(d.chSP[that.activeTime].value))
                        .attr("stroke-width","1px");

                }



            })
            .on("click", function (d) {
                let transNodes = that.transNet.data.nodes;

                // First check to see if bus has already been clicked
                if (that.clickedBusses.includes(d)){
                    //clear background
                    d3.select(this).style("background-color",null)
                    // remove buss from clicked busses
                    that.clickedBusses = that.clickedBusses.filter( f => f != d);
                    // remove line from linechart
                    that.updateLine();

                    //remove station data
                    // removes any other selected bus stations
                    //Remove tooltip
                    d3.select("#s_tooltip_click")
                        .style("opacity", 0);
                    
                    //Remove net lines
                    // d3.selectAll(".netlineclick").remove();

                    // // stops animation
                    // d3.selectAll(".clicked-line").interrupt()

                    // // removes classes
                    // d3.selectAll(".clicked-line")
                    //     .classed("clicked-line",false)
                    //     .classed("active-line",false)
                    //     .classed("active-line-hover",false);

                    // that.transNet.clicked = null;

                    //Clear path from line chart
                    // d3.selectAll(".line-path").style("visibility","hidden");
                    // d3.selectAll(".chart-text").style("visibility","hidden");

                }   
                // If it hasn't been clicked 
                else{
                    // Push clicked buss to clicked busses list, this gets reset when stuff is cleared
                    that.clickedBusses.push(d);

                    // console.log(that.clickedBusses.map(m => m.id))
                    // let clickedBussesIDs = that.clickedBusses.map(m => m.id)
                    // Highlight the selected bus row - this works but if you change the time it doesn't
                    // stick with the right bus.... how to fix this...
                    // d3.select(this).style("background-color","rgba(23, 162, 184, 0.15)")
                    // console.log(d3.selectAll('tr').nodes().filter( f => console.log(f.__data__)))
                    // console.log(d)
                    // console.log('HERE',d3.selectAll('.busID').filter( f => f.id == d.id))
                    // let clickedBussesIDs = that.clickedBusses.map(m => m.id)
                    // d3.selectAll('.busID').filter( f => clickedBussesIDs.includes(f.id)).style("background-color","rgba(23, 162, 184, 0.15)")
                    d3.selectAll('tr').filter( f => that.clickedBusses.includes(f)).style("background-color","#7ab3a05e")
                    // d3.selectAll('tr').filter( f => !(that.clickedBusses.includes(f))).style("background-color","null")
                    //Update line chart with bus data...need to eventually allow this to throw multiple lines on
                    that.updateLine();

                    // If the bus is at a charging station, push all of the relevant charging station data to the charts
                    // console.log(that.transNet)
                    // console.log(that.station_mapping[d.Location[that.activeTime]])

                    // let station_id = that.station_mapping[d.Location[that.activeTime]]
                    // console.log("hasn't been clicked")


                    // removes any other selected bus stations
                    //Remove tooltip
                    // d3.select("#s_tooltip_click")
                    //     .style("opacity", 0);
                    
                    // //Remove net lines
                    // // d3.selectAll(".netlineclick").remove();

                    // // stops animation
                    // d3.selectAll(".clicked-line").interrupt()

                    // // removes classes
                    // d3.selectAll(".clicked-line")
                    //     .classed("clicked-line",false)
                    //     .classed("active-line",false)
                    //     .classed("active-line-hover",false);

                    // that.transNet.clicked = null;

                    //Clear path from line chart
                    // d3.selectAll(".line-path").style("visibility","hidden");
                    // d3.selectAll(".chart-text").style("visibility","hidden");

                    // Checks to make sure it's a bus at a station
                    // if (station_id != undefined){
                        
                    //     // Adds clicked class and active line class
                    //     d3.select(`#line-${station_id}`).classed("clicked-line",true);
                    //     d3.select(`#line-${station_id}`).classed("active-line",true);
                    //     //starts animation indefinitely
                    //     animate.call(d3.select(`#line-${station_id}`).node(),d)
                    //     // Looping through data to select correct one
                    //     let myNode = transNodes.filter(f => f.StationNode.id == station_id)[0]
                    //     that.transNet.Clicked(myNode,true)
                    // }
            

                }

                function animate() {
                    d3.select(this)
                        .transition()
                        .duration(500)
                        .ease(d3.easeLinear)
                        .styleTween("stroke-dashoffset", function() {
                            return d3.interpolate(0, 14);
                            })
                        .on("end", animate);
                }
        
                function stop() {
                    d3.select(this)
                        .interrupt();
                }
                


            });


        // checks to see if busses have been clicked and decides if it needs to update charts accordingly
        if(this.clickedBusses.length != 0){
            // UPDATING LINE CHART
            // console.log("UPDATING LINE CHART")
            this.updateLine();
            // Keeps correct and selected rows highlighted
            // console.log( d3.selectAll('tr').filter( f => this.clickedBusses.includes(f)))
            // console.log(d3.selectAll('tr').filter( f => !(this.clickedBusses.includes(f))))
            d3.selectAll('tr').filter( f => this.clickedBusses.includes(f)).style("background-color","#7ab3a05e")
            d3.selectAll('tr').filter( f => !(this.clickedBusses.includes(f))).style("background-color",null)
            // d3.selectAll('tr').filter( f => !(this.clickedBusses.includes(f))).style("background-color","null")
        }
        else{
            d3.selectAll('tr').style("background-color","null")
        }
        
    }


    clearBusSelections(){
        // remove all busses from clicked list
        this.clickedBusses = []
        // Remove styling from table
        d3.selectAll('tr').style("background-color",null)
    }




    updateChartSize(bounding_div){
        // Gets new sizes and sets new canvas dimensions
        let chart = d3.select(bounding_div).node().getBoundingClientRect()
        // let chart2 = d3.select('.chart-2').node().getBoundingClientRect()
        //Margins - the bostock way - line chart
        this.lineHeight = chart.height-10;
        this.lineWidth = chart.width-5;
        this.widthL = this.lineWidth - this.marginL.left - this.marginL.right;
        this.heightL = this.lineHeight - this.marginL.top-this.marginL.bottom;

        // Scales for line chart
        this.timeScale = this.timeScale.range([this.marginL.left,this.marginL.left+this.widthL]);
        this.timeScale_Date = this.timeScale_Date.range([this.marginL.left,this.marginL.left+this.widthL]);
        this.energyLineScale = this.energyLineScale.range([this.heightL+this.marginL.top,this.marginL.top]);
        this.powerLineScale = this.powerLineScale.range([this.heightL+this.marginL.top,this.marginL.top]);
    }





    // Creates bus line charts for transit view
    createBusLines(Busses_Div){
        //console.log("data in line:",this.data.nodes[0])

        let that = this;

        // Line chart height and width - change this to be dynamic based on bounding box
        this.updateChartSize(Busses_Div[0]);
        let line_height = this.lineHeight; //300
        let line_width = this.lineWidth; //700

        //Create line chart svg for active power
        let energySvg = d3.select(Busses_Div[0]).append("svg")
            .attr("class","energySvg")
            .attr("height",line_height)
            .attr("width",line_width);

        let powerSvg = d3.select(Busses_Div[1]).append("svg")
            .attr("class","powerSvg")
            .attr("height",line_height)
            .attr("width",line_width);
        

        //Create an energy chart group
        let energyG = energySvg.append("g");
            // .attr("transform",`translate(${this.marginL.left},${this.marginL.top})`);

        //Create a power chart group
        let powerG = powerSvg.append("g");

        //Create label for group
        // energyG.append("text")
        //     .attr("class","chart-text")
        //     .attr("x",line_width-160)
        //     .attr("y",60);

        //Create labels for axes
        // energy
        energyG.append("text")
            .attr("class","axis-title")
            .attr("x",line_width - line_width*0.5 - 60)
            .attr("y",20)
            .text("BEB energy (kWh)");
        
        // energyG.append("text")
        //     .attr("class","axis-text")
        //     .attr("x",line_width - that.transNet.time_label)
        //     .attr("y",line_height-5)
        //     .text("time");

        energyG.append('text')
            .attr("class","energy-info-text")
            .attr("font-weight","bold")
            .attr("font-size","20px")
            .attr("fill",'rgba(0, 0, 0, 0.378)')
            .attr("x",70)
            .attr("y",203);
            // .attr("x",250) //Top left
            // .attr("y",16);

        // power
        powerG.append("text")
            .attr("class","axis-title")
            .attr("x",line_width - line_width*0.5 - 90)
            .attr("y",20)
            .text("BEB charging need (kW)");
        
        // powerG.append("text")
        //     .attr("class","axis-text")
        //     .attr("x",line_width - that.transNet.time_label)
        //     .attr("y",line_height-5)
        //     .text("time");

        powerG.append('text')
            .attr("class","power-info-text")
            .attr("font-weight","lighter")
            .attr("font-size","20px")
            .attr("x",300)
            .attr("y",18);

        
        // Scales for line chart
        let yScaleEnergy = this.energyLineScale;
        let yScalePower = this.powerLineScale;

        let xScale = this.timeScale_Date;


        //Xaxis group
        let xAxis = d3.axisBottom().ticks(4, "%I %p");
        xAxis.scale(xScale);

        //Y axis group
        let yAxisEnergy = d3.axisLeft().ticks(3);
        yAxisEnergy.scale(yScaleEnergy);
        let yAxisPower = d3.axisLeft().ticks(3);
        yAxisPower.scale(yScalePower);

        //Gridlines
        // gridlines in y axis function 
        // function make_y_gridlines() {		
        //     return d3.axisLeft(yScale)
        //         .ticks(5)
        // }

        // // add the Y gridlines
        // powStatSvg.append("g")			
        //     .attr("class", "grid")
        //     .attr("transform",`translate(${this.marginL.left},0)`)
        //     .call(make_y_gridlines()
        //         .tickSize(-(this.widthL))
        //         .tickFormat("")
        //     );

        //X-axis
        energyG.append("g")
            .classed("axis",true)
            .attr("transform",`translate(${0},${this.heightL+this.marginL.top})`)
            .call(xAxis);

        powerG.append("g")
            .classed("axis",true)
            .attr("transform",`translate(${0},${this.heightL+this.marginL.top})`)
            .call(xAxis);
        

        //Y-axis
        energyG.append("g")
            .classed("axis",true)
            .attr("transform",`translate(${this.marginL.left},${0})`)
            .call(yAxisEnergy);

        powerG.append("g")
            .classed("axis",true)
            .attr("transform",`translate(${this.marginL.left},${0})`)
            .call(yAxisPower);

        
        //Add data to chart

        //Making line function
        // let line = d3.line()
        //     // .curve(d3.curveStep)
        //     .defined(d => !isNaN(d.value))
        //     .x((d,i) => this.timeScale(i))
        //     .y(d => this.powLoadLineScale(d.value));

        //Create data bindings here

        //Creating paths
        // energyG.append("path")
        //     .attr("class","line-Energy-faint line-path");

        // energyG.append("path")
        //     .attr("class","line-Energy line-path");

        // energyG.append("path")
        //     .attr("class","line-Energy line-path");

        // powerG.append("path")
        //     .attr("class","line-Power-faint line-path");

        // powerG.append("path")
        //     .attr("class","line-Power line-path");


        // Make a group for line paths
        d3.select('.energySvg').append('g').attr("class","faintEnergyLines")
        d3.select('.energySvg').append('g').attr("class","energyLines")

        d3.select('.powerSvg').append('g').attr("class","faintPowerLines")
        d3.select('.powerSvg').append('g').attr("class","powerLines")
        
        // making dot for highlighting line
        let dot = d3.select('.energyLines').append("g")
            .attr("class","energy-dot")
            .attr("display","none");

        dot.append("circle")
            .attr("r",2.5);

        dot.append("text")
            // .attr("font-family", "sans-serif")
            .attr("font-family", "Avenir Next")
            .attr("font-size", 18)
            .attr("font-weight","bold")
            .attr("fill", "#484b5a")
            .attr("text-anchor", "right")
            .attr("y", -10);

        let dotP = d3.select('.powerLines').append("g")
            .attr("class","power-dot")
            .attr("display","none");

        dotP.append("circle")
            .attr("r",2.5);

        dotP.append("text")
            // .attr("font-family", "sans-serif")
            .attr("font-family", "Avenir Next")
            .attr("font-size", 18)
            .attr("font-weight","bold")
            .attr("fill", "#484b5a")
            .attr("text-anchor", "right")
            .attr("y", -10);
        
        // d3.select("#s_tooltip").html(that.tooltipRenderB(d))
        //             .style("left","1220px") //(d3.event.pageX+30)
        //             .style("top", "235px"); 

        // Make tooltip for bus charts



    }

    //  /** Creates all bus line charts */
    // createLine(){
    //     //console.log("data in line:",this.data.nodes[0])

    //     let that = this;

    //     // Line chart height and width
    //     let line_height = this.lineHeight; //300
    //     let line_width = this.lineWidth; //700

    //     //Create line chart svg for active power
    //     let energySvg = d3.select(".bus-charts").append("svg")
    //         .attr("class","energySvg")
    //         .attr("height",line_height)
    //         .attr("width",line_width);

    //     let powerSvg = d3.select(".bus-charts").append("svg")
    //         .attr("class","powerSvg")
    //         .attr("height",line_height)
    //         .attr("width",line_width);
        

    //     //Create an energy chart group
    //     let energyG = energySvg.append("g");
    //         // .attr("transform",`translate(${this.marginL.left},${this.marginL.top})`);

    //     //Create a power chart group
    //     let powerG = powerSvg.append("g");

    //     //Create label for group
    //     energyG.append("text")
    //         .attr("class","chart-text")
    //         .attr("x",line_width-160)
    //         .attr("y",60);

    //     //Create labels for axes
    //     // energy
    //     energyG.append("text")
    //         .attr("class","axis-text")
    //         .attr("x",70)
    //         .attr("y",15)
    //         .text("energy (kWh)");
        
    //     energyG.append("text")
    //         .attr("class","axis-text")
    //         .attr("x",line_width-150)
    //         .attr("y",line_height-10)
    //         .text("intervals");

    //     energyG.append('text')
    //         .attr("class","energy-info-text")
    //         .attr("font-weight","bold")
    //         .attr("font-size","20px")
    //         .attr("fill",'rgba(0, 0, 0, 0.378)')
    //         .attr("x",70)
    //         .attr("y",203);
    //         // .attr("x",250) //Top left
    //         // .attr("y",16);

    //     // power
    //     powerG.append("text")
    //         .attr("class","axis-text")
    //         .attr("x",70)
    //         .attr("y",15)
    //         .text("power(kWh)");
        
    //     powerG.append("text")
    //         .attr("class","axis-text")
    //         .attr("x",line_width-150)
    //         .attr("y",line_height-10)
    //         .text("intervals");

    //     powerG.append('text')
    //         .attr("class","power-info-text")
    //         .attr("font-weight","lighter")
    //         .attr("font-size","20px")
    //         .attr("x",300)
    //         .attr("y",18);

        
    //     // Scales for line chart
    //     let yScaleEnergy = this.energyLineScale;
    //     let yScalePower = this.powerLineScale;

    //     let xScale = this.timeScale;


    //     //Xaxis group
    //     let xAxis = d3.axisBottom().ticks(6);
    //     xAxis.scale(xScale);

    //     //Y axis group
    //     let yAxisEnergy = d3.axisLeft().ticks(3);
    //     yAxisEnergy.scale(yScaleEnergy);
    //     let yAxisPower = d3.axisLeft().ticks(3);
    //     yAxisPower.scale(yScalePower);

    //     //Gridlines
    //     // gridlines in y axis function 
    //     // function make_y_gridlines() {		
    //     //     return d3.axisLeft(yScale)
    //     //         .ticks(5)
    //     // }

    //     // // add the Y gridlines
    //     // powStatSvg.append("g")			
    //     //     .attr("class", "grid")
    //     //     .attr("transform",`translate(${this.marginL.left},0)`)
    //     //     .call(make_y_gridlines()
    //     //         .tickSize(-(this.widthL))
    //     //         .tickFormat("")
    //     //     );

    //     //X-axis
    //     energyG.append("g")
    //         .classed("axis",true)
    //         .attr("transform",`translate(${0},${this.heightL+this.marginL.top})`)
    //         .call(xAxis);

    //     powerG.append("g")
    //         .classed("axis",true)
    //         .attr("transform",`translate(${0},${this.heightL+this.marginL.top})`)
    //         .call(xAxis);
        

    //     //Y-axis
    //     energyG.append("g")
    //         .classed("axis",true)
    //         .attr("transform",`translate(${this.marginL.left},${0})`)
    //         .call(yAxisEnergy);

    //     powerG.append("g")
    //         .classed("axis",true)
    //         .attr("transform",`translate(${this.marginL.left},${0})`)
    //         .call(yAxisPower);

        
    //     //Add data to chart

    //     //Making line function
    //     // let line = d3.line()
    //     //     // .curve(d3.curveStep)
    //     //     .defined(d => !isNaN(d.value))
    //     //     .x((d,i) => this.timeScale(i))
    //     //     .y(d => this.powLoadLineScale(d.value));

    //     //Create data bindings here

    //     //Creating paths
    //     // energyG.append("path")
    //     //     .attr("class","line-Energy-faint line-path");

    //     // energyG.append("path")
    //     //     .attr("class","line-Energy line-path");

    //     // energyG.append("path")
    //     //     .attr("class","line-Energy line-path");

    //     // powerG.append("path")
    //     //     .attr("class","line-Power-faint line-path");

    //     // powerG.append("path")
    //     //     .attr("class","line-Power line-path");


    //     // Make a group for line paths
    //     d3.select('.energySvg').append('g').attr("class","faintEnergyLines")
    //     d3.select('.energySvg').append('g').attr("class","energyLines")

    //     d3.select('.powerSvg').append('g').attr("class","faintPowerLines")
    //     d3.select('.powerSvg').append('g').attr("class","powerLines")
        
    //     // making dot for highlighting line
    //     let dot = d3.select('.energyLines').append("g")
    //         .attr("class","energy-dot dot")
    //         .attr("display","none");

    //     dot.append("circle")
    //         .attr("r",2.5);

    //     dot.append("text")
    //         // .attr("font-family", "sans-serif")
    //         .attr("font-family", "Avenir Next")
    //         .attr("font-size", 18)
    //         .attr("font-weight","bold")
    //         .attr("fill", "#484b5a")
    //         .attr("text-anchor", "right")
    //         .attr("y", -10);

    //     let dotP = d3.select('.powerLines').append("g")
    //         .attr("class","power-dot dot")
    //         .attr("display","none");

    //     dotP.append("circle")
    //         .attr("r",2.5);

    //     dotP.append("text")
    //         // .attr("font-family", "sans-serif")
    //         .attr("font-family", "Avenir Next")
    //         .attr("font-size", 18)
    //         .attr("font-weight","bold")
    //         .attr("fill", "#484b5a")
    //         .attr("text-anchor", "right")
    //         .attr("y", -10);
        
    //     // d3.select("#s_tooltip").html(that.tooltipRenderB(d))
    //     //             .style("left","1220px") //(d3.event.pageX+30)
    //     //             .style("top", "235px"); 

    //     // Make tooltip for bus charts

    // }

    // Updates the line chart with clicked data 
    updateLine(){

        let that = this;
        // console.log(that.clickedBusses.slice(-1))
        // let bus_data = that.clickedBusses.slice(-1)[0]
        let bus_data = that.clickedBusses;
        // console.log(bus_data)
        // console.log('here',bus_data.map(f => f.energy))

        //Making line functions
        let lineEnergy = d3.line()
            // .curve(d3.curveStep)
            .defined(d => !isNaN(d.value))
            .x((d,i) => this.timeScale(i))
            .y(d => this.energyLineScale(d.value));
        
        let linePower = d3.line()
            // .curve(d3.curveStep)
            .defined(d => !isNaN(d.value))
            .x((d,i) => this.timeScale(i))
            .y(d => this.powerLineScale(d.value));

        
        // console.log('CLICKED BUS DATA:',bus_data)
        // console.log( d3.select('.energySvg').selectAll(".line-Energy"))

        let end_index = parseInt(this.activeTime) + 1;
        // console.log(end_index)

        let energyColor = d3.color('#ad2800')
        let powerColor = d3.color('#100881')

        
        // I think this is just creating new lines
        let energyLines = d3.select('.energyLines').selectAll("path")
            .data(bus_data)
        let faintEnergyLines = d3.select('.faintEnergyLines').selectAll("path")
            .data(bus_data)

        let powerLines = d3.select('.powerLines').selectAll("path")
            .data(bus_data)
        let faintPowerLines = d3.select('.faintPowerLines').selectAll("path")
            .data(bus_data)

        //enter / update / exit the traditional way

        // Remove stuff from exit array
        energyLines.exit().remove();
        faintEnergyLines.exit().remove();

        powerLines.exit().remove();
        faintPowerLines.exit().remove();


        // ENERGY
        energyLines = energyLines.enter().append('path')
            .merge(energyLines);
        energyLines
            .style("visibility","visible")
            .attr("fill", "none")
            .attr("class", "line-path")
            .attr("stroke", energyColor)//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .style("mix-blend-mode", "multiply")
            .attr("d", d => lineEnergy(d.energy.slice(0,end_index)))
        
        faintEnergyLines = faintEnergyLines.enter().append('path')
            .merge(faintEnergyLines);
        faintEnergyLines
            .style("visibility","visible")
            .attr("class", "line-path")
            .attr("fill", "none")
            .attr("stroke", energyColor.copy({opacity: 0.1}))//d => that.stationColor(d.StationNode.id)) rgba(163, 6, 12,0.1)
            .attr("stroke-width", 3)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .style("mix-blend-mode", "multiply")
            .attr("d", d => lineEnergy(d.energy))


        //POWER
        powerLines = powerLines.enter().append('path')
            .merge(powerLines);
        powerLines
            .style("visibility","visible")
            .attr("class", "line-path")
            .attr("fill", "none")
            .attr("stroke", powerColor)//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .style("mix-blend-mode", "multiply")
            .attr("d", d => linePower(d.power.slice(0,end_index)))
        
        faintPowerLines = faintPowerLines.enter().append('path')
            .merge(faintPowerLines);
        faintPowerLines
            .style("visibility","visible")
            .attr("class", "line-path")
            .attr("fill", "none")
            .attr("stroke", powerColor.copy({opacity: 0.1}))//d => that.stationColor(d.StationNode.id)) rgba(163, 6, 12,0.1)
            .attr("stroke-width", 3)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .style("mix-blend-mode", "multiply")
            .attr("d", d => linePower(d.power))
        

        // this code initiates the hover functionality, use only if have 1 or more line
        
        if (that.clickedBusses.length > 0){
            d3.select('.energy-dot').style("visibility","visible")
            d3.select('.power-dot').style("visibility","visible")
            d3.select('.energySvg').call(this.hover,faintEnergyLines,this.energyLineScale,this,bus_data,"energy",energyColor,energyLines)
            d3.select('.powerSvg').call(this.hover,faintPowerLines,this.powerLineScale,this,bus_data,"power",powerColor,powerLines)
        }
        else{
            d3.select('.energy-dot').style("visibility","hidden")
            d3.select('.power-dot').style("visibility","hidden")

            // d3.select('.energySvg')
            //     .on("mousemove",null)
            //     .on("mouseenter",null)
            //     .on("mouseleave",null)
            //     .on("click",null);
            // d3.select('.energy-info-text').html('');

            // d3.select('.powerSvg')
            //     .on("mousemove",null)
            //     .on("mouseenter",null)
            //     .on("mouseleave",null)
            //     .on("click",null);
            // d3.select('.power-info-text').html('');
        }



    }

    hover(svg,path,yScale,scope,data,source,color,dark_path){
        let time = Array.from(Array(288).keys())
        // console.log("in hover",path)
        let that = scope;

        svg.on("mousemove",moved)
        svg.on("mouseenter",entered)
        svg.on("mouseleave",left)
        svg.on("click",clicked)
        // svg.on("doublecick",dblclicked)

        let dot = d3.select(`.${source}-dot`);

        // console.log("PATH",path)

        function moved() {
            // console.log("MOVED")
            d3.event.preventDefault();
            const mouse = d3.mouse(this);
            // Scale for x axis
            const xm = that.timeScale.invert(mouse[0]);
            // Scale for y axis
            const ym = yScale.invert(mouse[1]);
            // const ym = y.invert(mouse[1]);
            const i1 = d3.bisectLeft(time, xm, 1);
            const i0 = i1 - 1;
            // console.log(i1,i0)
            const i = xm - time[i0] > time[i1] - xm ? i1 : i0;
            // console.log(i)
            // console.log("x",xm,"y",ym,"time",i)
            const s = d3.least(data, d => Math.abs(d[source][i].value - ym));
            // const s = d3.least(data, d => console.log("here",d.energy[i].value - ym));
            // console.log("S",s)
            // raise brings current to the top
            // path.attr("stroke",d => console.log("D",d))
            // path.attr("stroke", d => d === s ? "rgb(163, 6, 12,0.5)" : "rgb(163, 6, 12,0.1)").filter(d => d === s).raise();
            dark_path.attr("stroke", d => d === s ? color.copy({opacity:1}) : color.copy({opacity:0.1})).filter(d => d === s).raise()
            path.attr("stroke", d => d === s ? color.copy({opacity:0.7}) : color.copy({opacity:0.1})).filter(d => d === s).raise();
            // path.attr("stroke-width", d => d === s ? 4 : 2).filter(d => d === s).raise();

            dot.raise();
            // path.filter(d => d === s).raise();
            dot.attr("transform", `translate(${that.timeScale(time[i])},${yScale(s[source][i].value)})`);
            // dot.attr("transform", `translate(${that.timeScale(10)},${yScale(50)})`);
            dot.select("text").text(s.id);
            // d3.select(`.${source}-info-text`).text(s.id + ": " + parseFloat(s[source][i].value).toFixed(2) + " kWh  /  Location: " + s.Location[i])
            d3.selectAll(".info-panel").transition()
                    .duration(10)
                    .style("opacity", 0.9);
            d3.select("#data-id").html(that.tooltipRenderID(s,i))
            d3.select("#data-info").html(that.tooltipRenderINFO(s,i))
        }
        
        function entered() {
            // console.log("ENTERED")
            path.style("mix-blend-mode", null).attr("stroke", "#ddd");
            dot.attr("display", null);

            

        }
        
        function left() {
            // console.log("LEFT")
            // Re color lines
            dark_path.attr("stroke", color)
            path.attr("stroke", color.copy({opacity:0.1}));

            // Remove info panel
            d3.selectAll(".info-panel").transition()
                    .duration(500)
                    .style("opacity", 0);

            // Need to rehighlight the latest clicked and populate with current time
            // d3.select('.energy-info-text').html('');

            // path.style("mix-blend-mode", "multiply").attr("stroke", color.copy({opacity: 0.1}));
            dot.attr("display", "none");
        }

        function clicked() {
            // console.log("CLICKED")
            d3.event.preventDefault();
            const mouse = d3.mouse(this);
            // Scale for x axis
            const xm = that.timeScale.invert(mouse[0]);
            // console.log(xm)
            // const xm = x.invert(mouse[0]);
            // Scale for y axis
            const ym = yScale.invert(mouse[1]);
            // console.log(ym)
            // const ym = y.invert(mouse[1]);
            const i1 = d3.bisectLeft(time, xm, 1);
            const i0 = i1 - 1;
            // console.log(i1,i0)
            const i = xm - time[i0] > time[i1] - xm ? i1 : i0;
            // console.log(i)
            // console.log("x",xm,"y",ym,"time",i)
            const s = d3.least(data, d => Math.abs(d[source][i].value - ym));
            // const s = d3.least(data, d => console.log("here",d.energy[i].value - ym));
            // console.log("S",s)

            // Updates current time by clicking on chart
            that.updateTime(i);
            d3.select(".slider-wrap").remove();
            that.transNet.drawTimeBar();

            // Clear everything
            //Remove tooltip
            d3.select("#s_tooltip_click")
                .style("opacity", 0);
            
            //Remove net lines
            // d3.selectAll(".netlineclick").remove();

            // stops animation
            d3.selectAll(".clicked-line").interrupt()

            // removes classes
            d3.selectAll(".clicked-line")
                .classed("clicked-line",false)
                .classed("active-line",false)
                .classed("active-line-hover",false);

            that.transNet.clicked = null;

            //Clear path from line chart
            // d3.selectAll(".line-path").style("visibility","hidden");
            // d3.selectAll(".chart-text").style("visibility","hidden");

            // Clears all station selections and selects station the bus is currently at
            let station_id = that.station_mapping[s.Location[i]]
            let transNodes = that.transNet.data.nodes;
            if (station_id != undefined){
                // Adds clicked class and active line class
                d3.select(`#line-${station_id}`).classed("clicked-line",true);
                d3.select(`#line-${station_id}`).classed("active-line",true);
                //starts animation indefinitely
                animate.call(d3.select(`#line-${station_id}`).node())
                // Looping through data to select correct one
                let myNode = transNodes.filter(f => f.StationNode.id == station_id)[0]
                that.transNet.Clicked(myNode,false)
            }

            function animate() {
                d3.select(this)
                    .transition()
                    .duration(500)
                    .ease(d3.easeLinear)
                    .styleTween("stroke-dashoffset", function() {
                        return d3.interpolate(0, 14);
                        })
                    .on("end", animate);
            }

            function stop() {
                d3.select(this)
                    .interrupt();
            }

        }

        // function dblclicked(){

        //     console.log("DOUBLE CLICKED")
        //     d3.event.preventDefault();


        // }

    }

    tooltipRenderID(data,time) {
        if (time==undefined){
            time = this.activeTime;
        }
        let that = this;
        let text = '';
        text = "<h3>" + data.id + "</h3>";
        text = text + "<p>"+ data.Location[time] + " </p>";
        return text;
    }

    tooltipRenderINFO(data,time) {
        if (time==undefined){
            time = this.activeTime;
        }
        let that = this;
        let text = '';
        text = text + "<p>  <b>Energy : </b>"+  parseFloat(data.energy[time].value).toFixed(2)+" kWh </p> <p> <b> Power need: </b> "+  parseFloat(data.power[time].value).toFixed(2)+" kW </p>";
        text = text + "<p>  <b> Speed : </b> "+  (parseFloat(data.current_speed[time]) * 12).toFixed(2)+" mph </p> <p> <b> Route: </b> "+ data.route + "    </p>";
        return text;
    }

}