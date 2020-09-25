/** Class implementing the power grid network */
class PowNet {

    // Creates a Power Network object
    constructor(data,time,transNetwork,bebs,table){
        //Assigning data variable
        console.log("pownet data:",data);
        this.data = data;
        this.activeTime = time;
        this.bebs = bebs;
        this.table = table;

        // Reference to transNetwork object
        this.transNet = transNetwork;
        // console.log(this.transNet.Clicked(this.transNet.data.nodes[1]))
        // console.log("trans data in pow",this.transNet.updateNet.Clicked.call(this.transNet.data.nodes[0]))
        this.transNodes = this.transNet.data.nodes

        // Let's create an object just of the charging stations
        this.chargingStations = this.data.nodes.filter(f => f.chSP!=null);

        // array to store clicked link objects
        this.clickedLinks = [];
        this.clickedNodes = [];

        //getting bouding box for svg
        let boundingRect =  d3.select(".view1").node().getBoundingClientRect()
        this.WIDTH = boundingRect.width;
        this.HEIGHT = boundingRect.height;

        //Margins - the bostock way
        this.margin = {top: 20, right: 20, bottom: 20, left: 30};
        // this.width = 1200 - this.margin.left - this.margin.right;
        // this.height = 900 - this.margin.top-this.margin.bottom;

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

        this.chart_line_opacity = 0.1 // sets opacity of line charts

    }

    /** Builds network based on data passed into object */
    createNet(){
        // console.log("Power Network Object: ",this.data)

        // Setting height of svg dynamically
        this.width = this.WIDTH - this.margin.left - this.margin.right;
        this.height = this.HEIGHT - this.margin.top-this.margin.bottom; 
        
        
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

        //Finding max/min of reactive load
        let max_rload = d3.max(this.data.nodes.map((d) => {
            //console.log(d)
            return d3.max(d.rLoad.map(f => {
                // console.log(f.value)
                return parseFloat(f.value)
            }))
        }));
        // console.log(max_aload)
        let min_rload = d3.min(this.data.nodes.map((d) => {
            //console.log(d)
            return d3.min(d.rLoad.map(f => {
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

        // finding max and min of reactive power flow
        let max_rpf = d3.max(this.data.links.map((d) => {
            //console.log(d)
            return d3.max(d.rPF.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))
        }));
        let min_rpf = d3.min(this.data.links.map((d) => {
            //console.log(d)
            return d3.min(d.rPF.map(f => {
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
        //The first node has an insanely high max, so for the interest of the scale I'm gonna manually set it

        this.aLoadScale = d3.scaleSequential(d3.interpolatePurples).domain([min_aload,420])
        // console.log(min_aload,min_chsp,max_chsp)
        this.voltScale = d3.scaleSqrt().range([4,15]).domain([min_volt,max_volt]);
        this.powLoadScale = d3.scaleSequential(d3.interpolateGreens).domain([min_chsp,max_chsp]);

        // scale for link line charts
        this.timeScale_Date = d3.scaleTime().domain([new Date(2020,0,1,5), new Date(2020,0,2,5) ]);
        this.timeScale = d3.scaleLinear().domain([1,288]) //.range([this.marginL.left,this.marginL.left+this.widthL]);
        this.currentLineScale = d3.scaleLinear().domain([min_current,max_current]).range([this.heightL+this.marginL.top,this.marginL.top]);
        this.APFLineScale = d3.scaleLinear().domain([min_apf,max_apf]).range([this.heightL+this.marginL.top,this.marginL.top]);
        this.RPFLineScale = d3.scaleLinear().domain([min_rpf,max_rpf]).range([this.heightL+this.marginL.top,this.marginL.top]);

        // scale for node line charts
        this.aLoadLineScale = d3.scaleLinear().domain([min_aload,420]).range([this.heightL+this.marginL.top,this.marginL.top]);
        this.rLoadLineScale = d3.scaleLinear().domain([min_rload,420]).range([this.heightL+this.marginL.top,this.marginL.top]);
        // this.aLoadLineScale = d3.scaleLog().domain([min_aload,max_aload]).range([this.heightL+this.marginL.top,this.marginL.top]);
        // this.rLoadLineScale = d3.scaleLog().domain([min_rload,max_rload]).range([this.heightL+this.marginL.top,this.marginL.top]);
        this.voltLineScale = d3.scaleLinear().domain([min_volt,max_volt]).range([this.heightL+this.marginL.top,this.marginL.top]);

        this.currentScale = d3.scaleLinear().range([5,25]).domain([min_current,max_current]);
        let active_power_flow_color = d3.interpolate("#C0DBF6", "#0E447B")
        this.apfscale = d3.scaleSequential(active_power_flow_color).domain([min_apf,max_apf]);
        //Make an ordinal color scale for stations
        let pow_stations = ["n2","n13","n9","n33","n25","n31","n8"];
        this.stationColor = d3.scaleOrdinal(d3.schemeTableau10).domain(pow_stations);


        //Creating svg selection
        let powSVG = d3.select(".view1").select("svg");

        let net_Group = powSVG.select(".net-group")
        let netGroup = net_Group.append("g")
            // .attr("class","net-group")
            .attr("transform","translate("+this.margin.left+","+this.margin.top+")");

        //Create icons first so they are at the back
        this.iconLayer = netGroup.append("g")
            .attr("class","icons");

        // First we create the links in their own group that comes before the node 
        //  group (so the circles will always be on top of the lines)
        this.linkLayer = netGroup.append("g")
            .attr("class", "links");

        // Now we create the node group, and the nodes inside it
        this.nodeLayer = netGroup.append("g")
            .attr("class", "nodes");
        
        //Create labels
        this.labelLayer = netGroup.append("g")
            .attr("class","labels");

        
    }


    updateNet(){

        // checks to see if nodes or links have been clicked
        if(this.clickedLinks.length != 0){
            this.updateLine();
        }
        if(this.clickedNodes.length != 0){
            this.updateLineNode();
        }


        let that = this;
        // Now let's create the lines
        let links = this.linkLayer.selectAll("line")
            .data(this.data.links)
            .join("line")
            .classed("link",true)
            .classed("active-link", d => {
                if (that.clickedLinks.includes(d)){
                    return true
                }
            })
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
                // Highlights tooltip
                d3.selectAll(".info-panel").transition()
                    .duration(200)
                    .style("opacity", 0.9);
                d3.select("#data-id").html(that.tooltipRenderID_L(d))
                d3.select("#data-info").html(that.tooltipRenderINFO_L(d))
            })
            .on("mouseout", function (d) {
                d3.selectAll(".info-panel").transition()
                    .duration(500)
                    .style("opacity", 0)
            })
            .on("click", function (d) {
                // checks to see if I've already clicked the link
                if (that.clickedLinks.includes(d)){
                    // remove from clicked stations
                    that.clickedLinks = that.clickedLinks.filter( f => f != d);
                    that.updateLine();
                    //removes styling
                    d3.select(this).classed('active-link',false)
                }
                else{
                    // adds styling
                    d3.select(this).classed('active-link',true)
                    //pushes to list
                    that.clickedLinks.push(d);
                    that.updateLine();
                }
                

            });;

        // Set the width and height of the power grid rectangles
        let rect_height = 13;
        let rect_width = 80;

        let nodes = this.nodeLayer
            .selectAll("rect")
            .data(this.data.nodes)
            .join("rect")
            .attr("class", d=> (d.chSP!=null) ? "charge "+d.id : "norm")
            .classed("node",true)
            .classed("active-node", d => {
                if (that.clickedNodes.includes(d)){
                    return true
                }
            })
            .attr("width",`${rect_width}px`)
            .attr("height",`${rect_height}px`)
            .attr("rx",'5px')
            .attr("ry",'5px')
            // .attr("r", d => this.voltScale(d.volt[this.activeTime].value))
            .attr("fill",d => this.aLoadScale(d.aLoad[this.activeTime].value))
            //tooltip!
            .on("mouseover", function (d) {
                // console.log(d)
                // Highlights tooltip
                d3.selectAll(".info-panel").transition()
                    .duration(200)
                    .style("opacity", 0.9);
                d3.select("#data-id").html(that.tooltipRenderID_N(d))
                d3.select("#data-info").html(that.tooltipRenderINFO_N(d))
                if(d3.select(this).classed("charge")){
                    // Checks first to see if its been clicked 
                    if (!d3.select(`#line-${d.id}`).classed("clicked-line")){
                        // d3.selectAll("."+d.id)
                        //     .attr("fill", d => { return (d.id != undefined) ? that.stationColor(d.id) : that.stationColor(d.StationNode.id)})
                        //     .classed("CHSP",true);
                        // //highlights line
                        d3.select(`#line-${d.id}`).classed("active-line-hover",true);
                    }
                }
                
            })
            .on("mouseout", function (d) {
                // De-highlights tooltip
                d3.selectAll(".info-panel").transition()
                    .duration(500)
                    .style("opacity", 0);

                if(d3.select(this).classed("charge")){
                    if (!d3.select(`#line-${d.id}`).classed("clicked-line")){
                        // d3.selectAll("."+d.id)
                        //     .attr("fill", d => { return (d.id != undefined) ? that.aLoadScale(d.aLoad[that.activeTime].value) : that.powLoadScale(d.chSP[that.activeTime].value)})
                        //     .classed("CHSP",false);
                        // d3.selectAll(".station_node")
                        //     .attr("fill", d => that.stationColor(d.StationNode.id));

                        //de-highlights line
                        d3.select(`#line-${d.id}`).classed("active-line-hover",false);
                    }
                }
            })
            .on("click", function (d){

                // Check if I've already clicked that node
                if (that.clickedNodes.includes(d)){
                    d3.select(this).classed("active-node",false)
                    that.clickedNodes = that.clickedNodes.filter( f => f != d);
                }
                else{
                    d3.select(this).classed("active-node",true)
                    that.clickedNodes.push(d);
                }
                that.updateLineNode();

                if(d3.select(this).classed("charge")){
                    let line_clicked = d3.select(`#line-${d.id}`).classed("clicked-line")
                    if (line_clicked){
                        d3.select(`#line-${d.id}`)
                            .classed("clicked-line",false)
                            .classed("active-line",false);
                        d3.select(`#line-${d.id}`).interrupt()
                    }

                }
                

                // if(d3.select(this).classed("charge")){
                //     // remove other clicked nodes
                //     that.clickedNodes = [];

                //     // sees if object has already been clicked
                //     if (d3.select(`#line-${d.id}`).classed("clicked-line")){
                //         // console.log("been clicked")
                //         //Remove tooltip
                //         d3.select("#s_tooltip_click")
                //             .style("opacity", 0);

                //         //Restore table data
                //         that.table.BEB = that.bebs;
                //         that.table.updateTable();

                //         // removes clicked class and active line class
                //         d3.select(`#line-${d.id}`).classed("clicked-line",false);
                //         d3.select(`#line-${d.id}`).classed("active-line",false);
                //         //stops animation
                //         stop.call(d3.select(`#line-${d.id}`).node(),d)
                //         //Clear path from line chart
                //         d3.selectAll(".line-path").style("visibility","hidden");
                //         d3.selectAll(".chart-text").style("visibility","hidden");
                //     }
                //     else{
                //         // console.log("hasn't been clicked")
                //         // Adds clicked class and active line class
                //         d3.select(`#line-${d.id}`).classed("clicked-line",true);
                //         d3.select(`#line-${d.id}`).classed("active-line",true);
                //         //starts animation indefinitely
                //         animate.call(d3.select(`#line-${d.id}`).node(),d)
                //         // Looping through data to select correct one
                //         let myNode = that.transNodes.filter(f => f.StationNode.id == d.id)[0]
                //         that.transNet.Clicked(myNode,false)
                //     }
                // }
                // // If a regular node is clicked
                // else{
                //     that.clickedNodes.push(d);
                //     that.updateLineNode();

                // }

            });

        
        let labels = this.labelLayer
            .selectAll("text")
            .data(this.data.nodes)
            .enter().append("text");

        let icons = this.iconLayer
            .selectAll("image")
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
                    d.x = X_Start - 150;
                    return d.x;
                }
                //Branch off of 2 containing 19 -> 22
                if((d.index > 17) & (d.index < 22)){
                    d.x = X_Start + 130;
                    return d.x;
                }
                // Bracnh off of 6(may change to 13) containing 26->33
                if( d.index > 24 ){
                    d.x = X_Start + 160;
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
                    d.y = Y_Start + 65 + (i-20)*Y_Spacing;
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
            .attr("x",function (d,i){
                // Branch off of 6 (may change to 13) containing 26->33
                // if(d.index > 24){
                //     return d.x - 30;
                // }
                // else{
                //     return d.x + 80;
                // }
                return d.x + 80;
            })
            // .attr("x",d => d.x+75)
            .attr("y",d => d.y-8)
            .attr("xlink:href","icons/outlet.svg")
            .attr("transform", function (d,i){
                // Need to rotate around center of object which is coordinate + height/2 (or width/2 for x)
                // if(d.index > 24){
                //     return `rotate(-45 ${d.x-30+15} ${d.y-8+15})`;
                // }
                // else{
                //     return `rotate(135 ${d.x+80+15} ${d.y-8+15})`;
                // }
                return `rotate(0 ${d.x+80+15} ${d.y-8+15})`
            })
            .attr("height","30px")
            .attr("width","30px")

        labels
            .attr("x",function (d,i){
                // //Branch off of 2 containing 19 -> 22
                // if((d.index > 17) & (d.index < 22)){
                //     d.x = d.x + (rect_width) +10;
                //     return d.x ;
                // }
                // // Branch off of 6 (may change to 13) containing 26->33
                // if(d.index > 24){
                //     d.x = d.x + (rect_width) +10;
                //     return d.x ;
                // }
                // else{
                //     return d.x - 25;
                // }
                return d.x - 25;
            })
            .attr("y",d => d.y+12)
            .text( d=> d.index+1)
            .attr("fill","black");


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


        // This clears a selection by listening for a click
        // document.addEventListener("click", function(e) {
        //     if (e.target.classList.contains("netsvg")){
            
        //     //Sets clicked to null and other variables to 0
        //     that.clickedLinks = [];
        //     that.clickedNodes = [];
        //     }
        
        // }, true);

        
    }

    handleZoom(){

        // HANDLING ZOOMING BASED ON SVG SIZE

        // Gets new sizes and sets new canvas dimensions
        let view1 = d3.select('.view1').node()

        // // retrieves new size
        let boundingRect = view1.getBoundingClientRect();
        // console.log("BOUNDING RECT",boundingRect)

        // // stores new size width
        let newWidth = boundingRect.width;
        // // stores new size height
        let newHeight = boundingRect.height;

        // Get bounds of net group
        let gBox = d3.select('.net-group').node().getBBox();
        // console.log("gbox",gBox)
        let x0 = gBox.x;
        let x1 = gBox.x + gBox.width;
        let y0 = gBox.y;
        let y1 = gBox.y + gBox.height;

        // calculate new scale
        let k = Math.min(8, 0.9 / Math.max((gBox.width) / (newWidth), (gBox.height) / newHeight))
        // console.log("scale",k)
        // Adding zoom

        const zoom = d3.zoom()
            .on("zoom", zoomed);
        
        d3.select(".netsvg").call(d3.zoom()
            // .extent([[0, 0], [this.width, this.height]])
            // .scaleExtent([1, 8])
            // .transform()
            .on("zoom", zoomed));

        d3.select(".netsvg").call(
            zoom.transform,
            d3.zoomIdentity
                .translate(newWidth / 2, newHeight / 2)
                .scale(k)
                .translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
        );


        function zoomed() {
            let transform = d3.event.transform;
            d3.select('.net-group').attr("transform",transform.toString())
            
                        
        }
    }

    clearPowerNodeSelections(){
        this.clickedNodes = []
        // TODO: remove any styling that I add to clicked nodes here
        d3.selectAll('.active-node').classed('active-node',false)
    }

    clearPowerLinkSelections(){
        this.clickedLinks = []
        // TODO: remove any styling that I add to clicked links here
        d3.selectAll('.active-link').classed('active-link',false)
    }


    removeNet(){
        /** Clears existing Net**/
        d3.select(".netsvg").remove()

    }


    updateChartSize(bounding_div){

        // Gets new sizes and sets new canvas dimensions
        let chart = d3.select(bounding_div).node().getBoundingClientRect()
        // let chart2 = d3.select('.chart-2').node().getBoundingClientRect()

        //Margins - the bostock way - line chart
        this.lineHeight = chart.height - 10;
        this.lineWidth = chart.width - 5;
        this.widthL = this.lineWidth - this.marginL.left - this.marginL.right;
        this.heightL = this.lineHeight - this.marginL.top-this.marginL.bottom;

        // scale for link line charts
        this.timeScale = this.timeScale.range([this.marginL.left,this.marginL.left+this.widthL]);
        this.timeScale_Date = this.timeScale_Date.range([this.marginL.left,this.marginL.left+this.widthL]);
        this.currentLineScale = this.currentLineScale.range([this.heightL+this.marginL.top,this.marginL.top]);
        this.APFLineScale = this.APFLineScale.range([this.heightL+this.marginL.top,this.marginL.top]);
        this.RPFLineScale = this.RPFLineScale.range([this.heightL+this.marginL.top,this.marginL.top]);

        // scale for node line charts
        // this.aLoadLineScale = d3.scaleLinear().domain([min_aload,max_aload]).range([this.heightL+this.marginL.top,this.marginL.top]);
        this.aLoadLineScale = this.aLoadLineScale.range([this.heightL+this.marginL.top,this.marginL.top]);
        this.rLoadLineScale = this.rLoadLineScale.range([this.heightL+this.marginL.top,this.marginL.top]);
        this.voltLineScale = this.voltLineScale.range([this.heightL+this.marginL.top,this.marginL.top]);


    }

    // Create line charts for power system view
    createPowerCharts(powerFlow_divs,current_div){
         //console.log("data in line:",this.data.nodes[0])

        let that = this;

        this.updateChartSize(powerFlow_divs[0])
        // Line chart height and width
        let line_height = this.lineHeight; //300
        let line_width = this.lineWidth; //700

        //Create line chart svg for active power
        let currentSvg = d3.select(current_div[0]).append("svg")
            .attr("class","currentSvg")
            .attr("height",line_height)
            .attr("width",line_width);

        let APFSvg = d3.select(powerFlow_divs[0]).append("svg")
            .attr("class","APFSvg")
            .attr("height",line_height)
            .attr("width",line_width);
    
        let RPFSvg = d3.select(powerFlow_divs[1]).append("svg")
            .attr("class","RPFSvg")
            .attr("height",line_height)
            .attr("width",line_width);
         
 
        //Create a current chart group
        let currentG = currentSvg.append("g");
            // .attr("transform",`translate(${this.marginL.left},${this.marginL.top})`);

        //Create a power chart group
        let APFG = APFSvg.append("g");

        let RPFG = RPFSvg.append("g");

        //Create labels for axes
        // energy
        currentG.append("text")
            .attr("class","axis-title")
            .attr("x",line_width - line_width*0.5 - 30)
            .attr("y",20)
            .text("current (A)");
        
        // currentG.append("text")
        //     .attr("class","axis-text")
        //     .attr("x",line_width - that.transNet.time_label)
        //     .attr("y",line_height-5)
        //     .text("time");

        // power
        APFG.append("text")
            .attr("class","axis-title")
            .attr("x",line_width - line_width*0.5 - 70)
            .attr("y",23)
            .text("active power flow (kW)");
        
        // APFG.append("text")
        //     .attr("class","axis-text")
        //     .attr("x",line_width - that.transNet.time_label)
        //     .attr("y",line_height-5)
        //     .text("time");

        RPFG.append("text")
            .attr("class","axis-title")
            .attr("x",line_width - line_width*0.5 - 90)
            .attr("y",23)
            .text("reactive power flow (kVar)");
        
        // RPFG.append("text")
        //     .attr("class","axis-text")
        //     .attr("x",line_width - that.transNet.time_label)
        //     .attr("y",line_height-5)
        //     .text("time");

        
        // Scales for line chart
        let yScaleCurrent = this.currentLineScale;
        let yScaleAPF = this.APFLineScale;
        let yScaleRPF = this.RPFLineScale; 

        let xScale = this.timeScale_Date;


        //Xaxis group
        let xAxis = d3.axisBottom().ticks(4, "%I %p");
        xAxis.scale(xScale);

        //Y axis group
        let yAxisCurrent = d3.axisLeft().ticks(3);
        yAxisCurrent.scale(yScaleCurrent);
        let yAxisAPF = d3.axisLeft().ticks(3);
        yAxisAPF.scale(yScaleAPF);
        let yAxisRPF = d3.axisLeft().ticks(3);
        yAxisRPF.scale(yScaleRPF);

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
        currentG.append("g")
            .classed("axis",true)
            .attr("transform",`translate(${0},${this.heightL+this.marginL.top})`)
            .call(xAxis);

        APFG.append("g")
            .classed("axis",true)
            .attr("transform",`translate(${0},${this.heightL+this.marginL.top})`)
            .call(xAxis);

        RPFG.append("g")
            .classed("axis",true)
            .attr("transform",`translate(${0},${this.heightL+this.marginL.top})`)
            .call(xAxis);
        

        //Y-axis
        currentG.append("g")
            .classed("axis",true)
            .attr("transform",`translate(${this.marginL.left},${0})`)
            .call(yAxisCurrent);

        APFG.append("g")
            .classed("axis",true)
            .attr("transform",`translate(${this.marginL.left},${0})`)
            .call(yAxisAPF);

        RPFG.append("g")
            .classed("axis",true)
            .attr("transform",`translate(${this.marginL.left},${0})`)
            .call(yAxisRPF);

        
        //Add data to chart

        //Making line function
        // let line = d3.line()
        //     // .curve(d3.curveStep)
        //     .defined(d => !isNaN(d.value))
        //     .x((d,i) => this.timeScale(i))
        //     .y(d => this.powLoadLineScale(d.value));

        //Drawing path
        // Make a group for line paths
        d3.select('.currentSvg').append('g').attr("class","line-Current")
        d3.select('.currentSvg').append('g').attr("class","line-Current-faint")

        d3.select('.APFSvg').append('g').attr("class","line-APF")
        d3.select('.APFSvg').append('g').attr("class","line-APF-faint")

        d3.select('.RPFSvg').append('g').attr("class","line-RPF")
        d3.select('.RPFSvg').append('g').attr("class","line-RPF-faint")


        // making dot for highlighting line
        let dot = d3.select('.line-Current').append("g")
            .attr("class","current-dot dot")
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
        
        // making dot for highlighting line
        dot = d3.select('.line-APF').append("g")
            .attr("class","aPF-dot dot")
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
        
        // making dot for highlighting line
        dot = d3.select('.line-RPF').append("g")
            .attr("class","rPF-dot dot")
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


    }


    // Updates the line chart with clicked data 
    updateLine(){

        let that = this;
        let link_data = that.clickedLinks;
        // console.log(link_data)

        //Making line functions
        let lineCurrent = d3.line()
            // .curve(d3.curveStep)
            .defined(d => !isNaN(d.value))
            .x((d,i) => this.timeScale(i))
            .y(d => this.currentLineScale(d.value));
        
        let lineAPF = d3.line()
            // .curve(d3.curveStep)
            .defined(d => !isNaN(d.value))
            .x((d,i) => this.timeScale(i))
            .y(d => this.APFLineScale(d.value));

        let lineRPF = d3.line()
            // .curve(d3.curveStep)
            .defined(d => !isNaN(d.value))
            .x((d,i) => this.timeScale(i))
            .y(d => this.RPFLineScale(d.value));

        // I think this is just creating new lines
        let currentLines = d3.select('.line-Current').selectAll("path")
            .data(link_data)
        let faintcurrentLines = d3.select('.line-Current-faint').selectAll("path")
            .data(link_data)

        let pfLines = d3.select('.line-APF').selectAll("path")
            .data(link_data)
        let faintpfLines = d3.select('.line-APF-faint').selectAll("path")
            .data(link_data)

        let rpfLines = d3.select('.line-RPF').selectAll("path")
            .data(link_data)
        let faintrpfLines = d3.select('.line-RPF-faint').selectAll("path")
            .data(link_data)

        //enter / update / exit the traditional way

        // Remove stuff from exit array
        currentLines.exit().remove();
        faintcurrentLines.exit().remove();

        pfLines.exit().remove();
        faintpfLines.exit().remove();

        rpfLines.exit().remove();
        faintrpfLines.exit().remove();

        let current_color = d3.hsl("#ff524c")

        let end_index = parseInt(this.activeTime) + 1;
        // console.log(end_index)

        currentLines = currentLines.enter().append('path')
            .merge(currentLines);
        currentLines
            // .datum(link_data.current.slice(0,this.activeTime))
            .style("visibility","visible")
            .attr("class","line-path")
            .attr("fill", "none")
            .attr("stroke", current_color)//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .style("mix-blend-mode", "multiply")
            .attr("d", d => lineCurrent(d.current.slice(0,end_index)));

        faintcurrentLines = faintcurrentLines.enter().append('path')
            .merge(faintcurrentLines);
        faintcurrentLines
            // .datum(link_data.current)
            .style("visibility","visible")
            .attr("fill", "none")
            .attr("class","line-path")
            .attr("stroke", current_color.copy({opacity: that.chart_line_opacity}))//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 3)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .style("mix-blend-mode", "multiply")
            .attr("d", d => lineCurrent(d.current));

        let power_flow_color = d3.hsl("#3a7bbf")

        pfLines = pfLines.enter().append('path')
            .merge(pfLines);
        pfLines
            // .datum(link_data.aPF.slice(0,this.activeTime))
            .style("visibility","visible")
            .attr("class","line-path")
            .attr("fill", "none")
            .attr("stroke", power_flow_color)//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .style("mix-blend-mode", "multiply")
            .attr("d", d => lineAPF(d.aPF.slice(0,end_index)));

        faintpfLines = faintpfLines.enter().append('path')
            .merge(faintpfLines);
        faintpfLines
            .style("visibility","visible")
            .attr("class","line-path")
            .attr("fill", "none")
            .attr("stroke", power_flow_color.copy({opacity: that.chart_line_opacity}))//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 3)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .style("mix-blend-mode", "multiply")
            .attr("d", d => lineAPF(d.aPF));

        power_flow_color.h += 180;


        rpfLines = rpfLines.enter().append('path')
            .merge(rpfLines);
        rpfLines
            // .datum(link_data.rPF.slice(0,this.activeTime))
            .style("visibility","visible")
            .attr("class","line-path")
            .attr("fill", "none")
            .attr("stroke", power_flow_color)//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .style("mix-blend-mode", "multiply")
            .attr("d", d => lineRPF(d.rPF.slice(0,end_index)));

        faintrpfLines = faintrpfLines.enter().append('path')
            .merge(faintrpfLines);
        faintrpfLines
            .style("visibility","visible")
            .attr("class","line-path")
            .attr("fill", "none")
            .attr("stroke", power_flow_color.copy({opacity: that.chart_line_opacity}))//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 3)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .style("mix-blend-mode", "multiply")
            .attr("d", d => lineRPF(d.rPF));


        // handling hovering 
        if (this.clickedLinks.length > 0){
            d3.select('.current-dot').style("visibility","visible")
            d3.select('.aPF-dot').style("visibility","visible")
            d3.select('.rPF-dot').style("visibility","visible")
            d3.select('.currentSvg').call(this.hover,faintcurrentLines,currentLines,this.currentLineScale,this.timeScale,this,link_data,"current",current_color)
            d3.select('.APFSvg').call(this.hover,faintpfLines,pfLines,this.APFLineScale,this.timeScale,this,link_data,"aPF",d3.hsl("#3a7bbf"))
            d3.select('.RPFSvg').call(this.hover,faintrpfLines,rpfLines,this.RPFLineScale,this.timeScale,this,link_data,"rPF",power_flow_color)
        }
        else{
            d3.select('.current-dot').style("visibility","hidden")
            d3.select('.aPF-dot').style("visibility","hidden")
            d3.select('.rPF-dot').style("visibility","hidden")
        }
        

    }


    updateLineNode(){
        let that = this;
        let node_data = that.clickedNodes

        //Making line functions
        let lineAL = d3.line()
            // .curve(d3.curveStep)
            .defined(d => !isNaN(d.value))
            .x((d,i) => this.timeScale(i))
            .y(d => this.aLoadLineScale(d.value));

        let lineRL = d3.line()
            // .curve(d3.curveStep)
            .defined(d => !isNaN(d.value))
            .x((d,i) => this.timeScale(i))
            .y(d => this.rLoadLineScale(d.value));
        
        let lineVolt = d3.line()
            // .curve(d3.curveStep)
            .defined(d => !isNaN(d.value))
            .x((d,i) => this.timeScale(i))
            .y(d => this.voltLineScale(d.value));


        // I think this is just creating new lines
        let alLines = d3.select('.line-AL').selectAll("path")
            .data(node_data)
        let faintalLines = d3.select('.line-AL-faint').selectAll("path")
            .data(node_data)

        let rlLines = d3.select('.line-RL').selectAll("path")
            .data(node_data)
        let faintrlLines = d3.select('.line-RL-faint').selectAll("path")
            .data(node_data)

        let voltLines = d3.select('.line-Volt').selectAll("path")
            .data(node_data)
        let faintvoltLines = d3.select('.line-Volt-faint').selectAll("path")
            .data(node_data)

        //enter / update / exit the traditional way

        // Remove stuff from exit array
        alLines.exit().remove();
        faintalLines.exit().remove();

        rlLines.exit().remove();
        faintrlLines.exit().remove();

        voltLines.exit().remove();
        faintvoltLines.exit().remove();
        
        let active_load_color = d3.hsl("#8426cc")

        let end_index = parseInt(this.activeTime) + 1;
        // console.log(end_index)

        alLines = alLines.enter().append('path')
            .merge(alLines);
        alLines
            // .datum(node_data.aLoad.slice(0,this.activeTime))
            .style("visibility","visible")
            .attr("fill", "none")
            .attr("class","line-path")
            .attr("stroke", active_load_color)//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .style("mix-blend-mode", "multiply")
            .attr("d", d => lineAL(d.aLoad.slice(0,end_index)));

        faintalLines = faintalLines.enter().append('path')
            .merge(faintalLines);
        faintalLines
            .style("visibility","visible")
            .attr("fill", "none")
            .attr("class","line-path")
            .attr("stroke", active_load_color.copy({opacity:that.chart_line_opacity}))//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .style("mix-blend-mode", "multiply")
            .attr("d", d=> lineAL(d.aLoad));

        active_load_color.h += 180
        active_load_color.l = 0.3


        rlLines = rlLines.enter().append('path')
            .merge(rlLines);
        rlLines
            .style("visibility","visible")
            .attr("fill", "none")
            .attr("class","line-path")
            .attr("stroke", active_load_color)//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .style("mix-blend-mode", "multiply")
            .attr("d", d => lineRL(d.rLoad.slice(0,end_index)));

        faintrlLines = faintrlLines.enter().append('path')
            .merge(faintrlLines);
        faintrlLines
            .style("visibility","visible")
            .attr("fill", "none")
            .attr("class","line-path")
            .attr("stroke", active_load_color.copy({opacity:that.chart_line_opacity}))//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .style("mix-blend-mode", "multiply")
            .attr("d", d => lineRL(d.rLoad));

        let voltage_color = d3.hsl("#ff524c")
        voltage_color.h += 180
        voltage_color.l = 0.3


        voltLines = voltLines.enter().append('path')
            .merge(voltLines);
        voltLines
            .style("visibility","visible")
            .attr("fill", "none")
            .attr("class","line-path")
            .attr("stroke", voltage_color)//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .style("mix-blend-mode", "multiply")
            .attr("d", d => lineVolt(d.volt.slice(0,end_index)));

        faintvoltLines = faintvoltLines.enter().append('path')
            .merge(faintvoltLines);
        faintvoltLines
            .style("visibility","visible")
            .attr("fill", "none")
            .attr("class","line-path")
            .attr("stroke", voltage_color.copy({opacity:that.chart_line_opacity}))//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .style("mix-blend-mode", "multiply")
            .attr("d", d => lineVolt(d.volt));


        // handling hovering
        if (that.clickedNodes.length > 0){
            d3.select('.aLoad-dot').style("visibility","visible")
            d3.select('.rLoad-dot').style("visibility","visible")
            d3.select('.volt-dot').style("visibility","visible")
            d3.select('.ALSvg').call(this.hover,faintalLines,alLines,this.aLoadLineScale,this.timeScale,this,node_data,"aLoad",d3.hsl("#8426cc"))
            d3.select('.RLSvg').call(this.hover,faintrlLines,rlLines,this.rLoadLineScale,this.timeScale,this,node_data,"rLoad",active_load_color)
            d3.select('.VoltSvg').call(this.hover,faintvoltLines,voltLines,this.voltLineScale,this.timeScale,this,node_data,"volt",voltage_color)
        }
        else{
            d3.select('.aLoad-dot').style("visibility","hidden")
            d3.select('.rLoad-dot').style("visibility","hidden")
            d3.select('.volt-dot').style("visibility","hidden")
        }
        


    }

    hover(svg,path,dark_path,yScale,xScale,scope,data,source,color){
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
            const xm = xScale.invert(mouse[0]);
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
            let s = null
            if (source == "BusData"){
                s = d3.least(data, d => Math.abs(d[source][i].total - ym));
            }
            else{
                s = d3.least(data, d => Math.abs(d[source][i].value - ym));
            }
            // const s = d3.least(data, d => console.log("here",d.energy[i].value - ym));
            // console.log("S",s)
            // raise brings current to the top
            // path.attr("stroke",d => console.log("D",d))
            // path.attr("stroke", d => d === s ? "rgb(163, 6, 12,0.5)" : "rgb(163, 6, 12,0.1)").filter(d => d === s).raise();
            dark_path.attr("stroke", d =>  d === s ? color : color.copy({opacity:that.chart_line_opacity})).filter(d => d === s).raise()
            path.attr("stroke", d => d === s ? color.copy({opacity:0.5}) : color.copy({opacity:that.chart_line_opacity})).filter(d => d === s).raise();
            // path.attr("stroke-width", d => d === s ? 4 : 2).filter(d => d === s).raise();

            dot.raise();
            // path.filter(d => d === s).raise();
            dot.attr("transform", `translate(${xScale(time[i])},${yScale(s[source][i].value)})`);
            
            // dot.attr("transform", `translate(${that.timeScale(10)},${yScale(50)})`);
            // current aPF rPF
            let links = ['current','aPF','rPF']
            if (links.includes(source)){
                dot.select("text").text(s.source.id + ':' + s.target.id);
                d3.selectAll(".info-panel").transition()
                    .duration(10)
                    .style("opacity", 0.9);
                d3.select("#data-id").html(that.tooltipRenderID_L(s))
                d3.select("#data-info").html(that.tooltipRenderINFO_L(s,i))
            }
            else{
                dot.select("text").text(s.id);
                d3.selectAll(".info-panel").transition()
                    .duration(10)
                    .style("opacity", 0.9);
                d3.select("#data-id").html(that.tooltipRenderID_N(s))
                d3.select("#data-info").html(that.tooltipRenderINFO_N(s,i))
            }
            
            
            // d3.select(`.${source}-info-text`).text(s.id + ": " + parseFloat(s[source][i].value).toFixed(2) + " kWh  /  Location: " + s.Location[i])
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
            path.attr("stroke", color.copy({opacity:that.chart_line_opacity}));

            // Need to rehighlight the latest clicked and populate with current time
            d3.select('.energy-info-text').html('');

            // path.style("mix-blend-mode", "multiply").attr("stroke", color.copy({opacity: 0.1}));
            dot.attr("display", "none");

            // Remove info panel
            d3.selectAll(".info-panel").transition()
                    .duration(500)
                    .style("opacity", 0);
        }

        function clicked() {
            // console.log("CLICKED")
            d3.event.preventDefault();
            const mouse = d3.mouse(this);
            // Scale for x axis
            const xm = xScale.invert(mouse[0]);
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
            console.log("x",xm,"y",ym,"time",i)
            const s = d3.least(data, d => Math.abs(d[source][i].value - ym));
            // const s = d3.least(data, d => console.log("here",d.energy[i].value - ym));
            console.log("S",s)

            // Updates current time by clicking on chart
            that.transNet.updateTime(i);
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

            // that.transNet.clicked = null;

            //Clear path from line chart
            // d3.selectAll(".line-path").style("visibility","hidden");
            // d3.selectAll(".chart-text").style("visibility","hidden");

            // Clears all station selections and selects station the bus is currently at
            // let station_id = that.station_mapping[s.Location[i]]
            // let transNodes = that.data.nodes;
            // if (station_id != undefined){
            //     // Adds clicked class and active line class
            //     d3.select(`#line-${station_id}`).classed("clicked-line",true);
            //     d3.select(`#line-${station_id}`).classed("active-line",true);
            //     //starts animation indefinitely
            //     animate.call(d3.select(`#line-${station_id}`).node())
            //     // Looping through data to select correct one
            //     let myNode = transNodes.filter(f => f.StationNode.id == station_id)[0]
            //     that.transNet.Clicked(myNode,false)
            // }

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






    /**
     * Returns html that can be used to render the tooltip for nodes
     * @param data
     * @returns {string}
     */
    tooltipRenderID_N(data) {
        let that = this;
        let text = null;
        (data.chSP != null) ? text = "<h3> <span>&#9889;</span>" + data.id + "</h3>": 
        text = "<h3>" + data.id + "</h3>";
        return text;
    }

    tooltipRenderINFO_N(data,time) {
        if (time==undefined){
            time = this.activeTime;
        }
        let that = this;
        let text = '';
        //Adds in relevant data
        text = text + "<p> <b> Active Load:</b> "+ parseFloat(data.aLoad[time].value).toFixed(2)+" kW</p>";
        text = text + "<p> <b> Voltage:</b> "+ parseFloat(data.volt[time].value).toFixed(2)+" kV</p>";
        return text;
    }

    /**
     * Returns html that can be used to render the tooltip for links
     * @param data
     * @returns {string}
     */
    tooltipRenderID_L(data) {
        let that = this;
        let text = "<h3>" + data.source.id + ' <span>&#8594;</span> ' + data.target.id +"</h3>";
        return text;
    }

    tooltipRenderINFO_L(data,time) {
        if (time==undefined){
            time = this.activeTime;
        }
        let that = this;
        let text = ''
        text = text + "<p> <b> Acitve Power Flow: </b> "+ parseFloat(data.aPF[time].value).toFixed(2)+" kW</p>";
        text = text + "<p> <b> Current: </b> "+ parseFloat(data.current[time].value).toFixed(2)+" A </p> <p> <b> Max Current: </b>"+ data.mLC.toFixed(2)+" A </p>";
        
        return text;
    }


}