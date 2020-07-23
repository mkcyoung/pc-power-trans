/** Class implementing the power grid network */
class PowNet {

    // Creates a Power Network object
    constructor(data,time){
        //Assigning data variable
        console.log("pownet data:",data);
        this.data = data;
        this.activeTime = time;

        // Let's create an object just of the charging stations
        this.chargingStations = this.data.nodes.filter(f => f.chSP!=null);

        //Margins - the bostock way
        this.margin = {top: 20, right: 20, bottom: 20, left: 20};
        this.width = 1200 - this.margin.left - this.margin.right;
        this.height = 900 - this.margin.top-this.margin.bottom; 

    }

    /** Builds network based on data passed into object */
    createNet(){
        console.log("Power Network Object: ",this.data)
        
        
        //May need to use this later
        let that = this;

        /** Creating Scales */

        //Finding max/min of aLoad
        let max_aload = d3.max(this.data.nodes.map((d) => {
            //console.log(d)
            return d3.max(d.aLoad.map(f => {
                // console.log(f.value)
                return parseFloat(f.value)
            }))
        }));
        // console.log(max_aload)
        let min_aload = d3.min(this.data.nodes.map((d) => {
            //console.log(d)
            return d3.min(d.aLoad.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))
        }));
        // console.log(min_aload)

        //Finding max/min of voltage
        let max_volt = d3.max(this.data.nodes.map((d) => {
            //console.log(d)
            return d3.max(d.volt.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))
        }));
        let min_volt = d3.min(this.data.nodes.map((d) => {
            //console.log(d)
            return d3.min(d.volt.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))
        }));
        // console.log(max_volt,min_volt);

        //Finding max/min of CHSP
        let max_chsp = d3.max(this.data.nodes.map((d) => {
            //console.log(d)
            if(d.chSP!=null){
            return d3.max(d.chSP.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))}
        }));
        let min_chsp = d3.min(this.data.nodes.map((d) => {
            // console.log(d)
            if(d.chSP!=null){
            return d3.min(d.chSP.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))}
        }));
        // console.log(max_chsp,min_chsp);

        //Finding max/min of active power flow
        let max_apf = d3.max(this.data.links.map((d) => {
            //console.log(d)
            return d3.max(d.aPF.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))
        }));
        let min_apf = d3.min(this.data.links.map((d) => {
            //console.log(d)
            return d3.min(d.aPF.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))
        }));
        // console.log(max_apf,min_apf);


        //Finding max/min of current
        let max_current = d3.max(this.data.links.map((d) => {
            //console.log(d)
            return d3.max(d.current.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))
        }));
        let min_current = d3.min(this.data.links.map((d) => {
            //console.log(d)
            return d3.min(d.current.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))
        }));
        // console.log(max_current,min_current)

        //Creating scales
        //TODO set ranges

        //this.aLoadScale = d3.scaleSqrt().range([8,20]).domain([min_aload,max_aload]);
        //The first node has an insanely high max, so for the interest of the scale I'm gonna manually set ot
        this.aLoadScale = d3.scaleSequential(d3.interpolatePurples).domain([min_aload,300])
        this.voltScale = d3.scaleSqrt().range([4,15]).domain([min_volt,max_volt]);
        this.powLoadScale = d3.scaleSequential(d3.interpolateViridis).domain([min_chsp,max_chsp]);

        this.currentScale = d3.scaleLinear().range([5,20]).domain([min_current,max_current]);
        this.apfscale = d3.scaleSequential(d3.interpolateBlues).domain([min_apf,max_apf]);
        //Make an ordinal color scale for stations
        let pow_stations = ["n2","n13","n9","n33","n25","n31","n8"];
        this.stationColor = d3.scaleOrdinal(d3.schemeTableau10).domain(pow_stations);


        //Creating svg selection
        let powSVG = d3.select(".view1").select("svg");

        let netGroup = powSVG.append("g")
            .attr("transform","translate("+this.margin.left+","+this.margin.top+")");

        //Create icons first so they are at the back
        this.iconLayer = netGroup.append("g")
            .attr("class","icons");

        // First we create the links in their own group that comes before the node 
        //  group (so the circles will always be on top of the lines)
        this.linkLayer = netGroup.append("g")
            .attr("class", "links");
         

        //make tooltip div
        d3.select(".view1")
            .append("div")
            .attr("class", "tooltip")
            .attr("id","tooltip")
            .style("opacity", 0);

        // Now we create the node group, and the nodes inside it
        this.nodeLayer = netGroup.append("g")
            .attr("class", "nodes");
        
        //Create labels
        this.labelLayer = netGroup.append("g")
            .attr("class","labels");

        
    }

    updateNet(){
        let that = this;
        // Now let's create the lines
        let links = this.linkLayer.selectAll("line")
            .data(this.data.links)
            .join("line")
            .classed("link",true)
            .attr("stroke-width",d=>this.currentScale(d.current[this.activeTime].value))
            .attr("stroke",d=>{
                if ((d.current[this.activeTime].value/d.mLC) > 0.9){
                    return "red"
                } 
                else{
                    return this.apfscale(d.aPF[this.activeTime].value)
                }
            })
            //tooltip!
            .on("mouseover", function (d) {
                d3.select("#tooltip").transition()
                    .duration(200)
                    .style("opacity", 0.9);
                d3.select("#tooltip").html(that.tooltipRenderL(d))
                    .style("left", (d3.event.pageX+15) + "px")
                    .style("top", (d3.event.pageY+15) + "px")
            })
            .on("mouseout", function (d) {
                d3.select("#tooltip").transition()
                    .duration(500)
                    .style("opacity", 0)
            });

        // Set the width and height of the power grid rectangles
        let rect_height = 13;
        let rect_width = 80;

        let nodes = this.nodeLayer
            .selectAll("rect")
            .data(this.data.nodes)
            .join("rect")
            .attr("class", d=> (d.chSP!=null) ? "charge "+d.id : "norm")
            .classed("node",true)
            .attr("width",`${rect_width}px`)
            .attr("height",`${rect_height}px`)
            .attr("rx",'5px')
            .attr("ry",'5px')
            // .attr("r", d => this.voltScale(d.volt[this.activeTime].value))
            .attr("fill",d => this.aLoadScale(d.aLoad[this.activeTime].value))
            //tooltip!
            .on("mouseover", function (d) {
                d3.select("#tooltip").transition()
                    .duration(200)
                    .style("opacity", 0.9);
                d3.select("#tooltip").html(that.tooltipRenderN(d))
                    .style("left", (d3.event.pageX+15) + "px")
                    .style("top", (d3.event.pageY+15) + "px");
                d3.selectAll("."+d.id)
                    .attr("fill", d => { return (d.id != undefined) ? that.stationColor(d.id) : that.stationColor(d.StationNode.id)})
                    .classed("CHSP",true);
            })
            .on("mouseout", function (d) {
                d3.select("#tooltip").transition()
                    .duration(500)
                    .style("opacity", 0);
                d3.selectAll("."+d.id)
                    .attr("fill", d => { return (d.id != undefined) ? that.aLoadScale(d.aLoad[that.activeTime].value) : that.powLoadScale(d.chSP[that.activeTime].value)})
                    .classed("CHSP",false);
                d3.selectAll(".station_node")
                    .attr("fill", d => that.stationColor(d.StationNode.id));
            });

        
        let labels = this.labelLayer
            .selectAll("text")
            .data(this.data.nodes)
            .enter().append("text");

        let icons = this.iconLayer
            .selectAll(".icons")
            .data(this.chargingStations)
            .enter().append("image");
        

        nodes
            .attr("x", function (d,i) {
                let X_Start = 200;
                // Main branch from n1 to 18
                if(d.index < 18){
                    d.x = X_Start;
                    return d.x;
                }
                //Branch off of 3 containing n23->25
                if((d.index > 21) & (d.index < 25)){
                    d.x = X_Start - 140;
                    return d.x;
                }
                //Branch off of 2 containing 19 -> 22
                if((d.index > 17) & (d.index < 22)){
                    d.x = X_Start + 130;
                    return d.x;
                }
                // Bracnh off of 6(may change to 13) containing 26->33
                if( d.index > 24 ){
                    d.x = X_Start + 130;
                    return d.x;
                }
                else{
                    return d.x;
                }
                
            })
            .attr("y", function (d,i) {
                // Main branch from n1 to 18
                let Y_Start = 30;
                let Y_Spacing = 35;
                if(d.index < 18){
                    d.y = Y_Start + i*Y_Spacing;
                    return d.y;
                }
                //Branch off of 3 containing n23->25
                if ((d.index > 21) & (d.index < 25)){
                    d.y = Y_Start + 85 + (i-20)*Y_Spacing;
                    return d.y;
                }
                //Branch off of 2 containing 19 -> 22
                if((d.index > 17) & (d.index < 22)){
                    d.y = Y_Start + 150 + (i-20)*Y_Spacing;
                    return d.y;
                }
                // Branch off of 6 (may change to 13) containing 26->33
                if(d.index > 24){
                    d.y = Y_Start + 100 + (i-20)*Y_Spacing;
                    return d.y;
                }
                else{
                    return d.y;
                }
            });

        links
            .attr("x1", function (d) {
                return d.source.x + rect_width/2;
            })
            .attr("y1", function (d) {
                return d.source.y + rect_height/2;
            })
            .attr("x2", function (d) {
                return d.target.x + rect_width/2;
            })
            .attr("y2", function (d) {
                return d.target.y + rect_height/2;
            });

        icons
            // .attr("x",function (d,i){
            //     //Branch off of 2 containing 19 -> 22
            //     if((d.index > 17) & (d.index < 22)){
            //         d.x = d.x + (rect_width) +10;
            //         return d.x ;
            //     }
            //     // Branch off of 6 (may change to 13) containing 26->33
            //     if(d.index > 24){
            //         d.x = d.x + (rect_width) +10;
            //         return d.x;
            //     }
            //     else{
            //         return d.x - 25;
            //     }
            // })
            .attr("x",d => d.x+75)
            .attr("y",d => d.y-8)
            .attr("xlink:href","icons/electricity.svg")
            .attr("height","30px")
            .attr("width","30px")

        labels
            .attr("x",function (d,i){
                //Branch off of 2 containing 19 -> 22
                if((d.index > 17) & (d.index < 22)){
                    d.x = d.x + (rect_width) +10;
                    return d.x ;
                }
                // Branch off of 6 (may change to 13) containing 26->33
                if(d.index > 24){
                    d.x = d.x + (rect_width) +10;
                    return d.x;
                }
                else{
                    return d.x - 25;
                }
            })
            .attr("y",d => d.y+12)
            .text( d=> d.index+1)
            .attr("fill","black");

        
    }

    /**
     * Returns html that can be used to render the tooltip for nodes
     * @param data
     * @returns {string}
     */
    tooltipRenderN(data) {
        let that = this;
        let text = null;
        (data.chSP != null) ? text = "<h3> <span>&#9889;</span> Node: " + data.id + "</h3>": 
        text = "<h3> Node: " + data.id + "</h3>";
        //Adds in relevant data
        text = text + "<p> Active Load: "+ parseFloat(data.aLoad[that.activeTime].value).toFixed(2)+" kW</p>";
        text = text + "<p> Voltage: "+ parseFloat(data.volt[that.activeTime].value).toFixed(2)+" kV</p>";
        if (data.chSP != null){
            text = text + "<p> Active Power: "+ parseFloat(data.chSP[that.activeTime].value).toFixed(2)+" kW</p>"
        } 
        return text;
    }

    /**
     * Returns html that can be used to render the tooltip for links
     * @param data
     * @returns {string}
     */
    tooltipRenderL(data) {
        let that = this;
        let text = "<h3>" + data.source.id + ' <span>&#8594;</span> ' + data.target.id +"</h3>";
        //Adds in relevant data
        text = text + "<p> Current: "+ parseFloat(data.current[that.activeTime].value).toFixed(2)+" A</p>";
        text = text + "<p> Acitve Power Flow: "+ parseFloat(data.aPF[that.activeTime].value).toFixed(2)+" kW</p>";
        text = text + "<p> Max Line Current: "+ data.mLC.toFixed(2)+" A</p>"
        return text;
    }


}