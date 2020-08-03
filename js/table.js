/** Class implementing the table */
class Table{

    constructor(BEBdata,station_Data,time){
        this.BEB = BEBdata;
        this.station = station_Data;
        this.activeTime = time;
        console.log("BEBdata",this.BEB)
        console.log("Station_Data",this.station)

        //Margins for table cells- the bostock way
        this.margin = {top: 10, right: 10, bottom: 10, left: 10};
        this.width = 150 - this.margin.left - this.margin.right;
        this.height = 30 - this.margin.top-this.margin.bottom;

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

    //Scales
    this.energybarScale = d3.scaleLinear().domain([this.min_energy,this.max_energy]).range([this.margin.left,this.width-this.margin.right]);
    this.energyColorScale = d3.scaleSequential(d3.interpolateReds).domain([this.min_energy,this.max_energy]);
    this.powerBarScale = d3.scaleLinear().domain([this.min_power,this.max_power]).range([this.margin.left,this.width-this.margin.right]);
    this.powerColorScale = d3.scaleSequential(d3.interpolatePurples).domain([this.min_power,this.max_power]);
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
        rows.select(".speedR").select("text")
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
                d3.select("#s_tooltip").transition()
                    .duration(200)
                    .style("opacity", 1);
                d3.select("#s_tooltip").html(that.tooltipRenderB(d))
                    .style("left","1220px") //(d3.event.pageX+30)
                    .style("top", "235px"); 
                d3.selectAll("."+that.station_mapping[d.Location[that.activeTime]])
                    .classed("CHSP",true);
            })
            .on("mouseout", function (d) {
                d3.select("#s_tooltip").transition()
                    .duration(500)
                    .style("opacity", 0);
                d3.selectAll("."+that.station_mapping[d.Location[that.activeTime]]) 
                    .classed("CHSP",false);
            });
        
    }

    tooltipRenderB(data) {
        let that = this;
        let text = null;
        text = "<h3>" + data.id + " ("+ data.BusID +")</h3>";
        //Adds in relevant data
        text = text + "<p> Location: "+ data.Location[that.activeTime] + "</p>";
        text = text + "<p> Route: "+ data.route + "</p>";
        text = text + "<p> Energy : "+  parseFloat(data.energy[that.activeTime].value).toFixed(2)+" kWh</p>";
        text = text + "<p> Power : "+  parseFloat(data.power[that.activeTime].value).toFixed(2)+" kWh</p>";
        text = text + "<p> Speed : "+  (parseFloat(data.current_speed[that.activeTime]) * 12).toFixed(2)+" mph</p>";
        return text;
    }

}