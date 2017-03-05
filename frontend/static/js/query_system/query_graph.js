/*---------------------------- ----------------------------  ---------------------------- ----------------------------*/
/*---------------------------- ----------------------------  ---------------------------- ----------------------------*/
/*                                      / ---------------------------- \                                              */
/*                                      | AUTHOR: MANOEL HORTA RIBEIRO |                                              */
/*                                      \ ---------------------------- /                                              */
/* Events out:                                                                                                        */
/* -> Inspect edge                                                                                                    */
/* -> Inspect edge                                                                                                    */
/* Events in:                                                                                                         */
/* -> New node                                                                                                        */
/* -> New update node                                                                                                 */
/* -> New update edge                                                                                                 */
/* -> Remove node                                                                                                     */
/* -> Update Settings                                                                                                 */
/*---------------------------- ----------------------------  ---------------------------- ----------------------------*/
/*---------------------------- ----------------------------  ---------------------------- ----------------------------*/

/*  TODO: ADD ANIMATION TO NODES BRANCHING OUT. */
/*  TODO: MAKE IT FIT IN THE PAGE */


var json_config = require("../config/config.js"),
    d3 = require("../external/d3.min.v4.js"),
    utils = require("./utils.js");

function GC(query_interface_selection, reactor) {
    /* Add event listeners, creates and configures the query graph editor as specified in the config file, initializes
     * the query model and creates the root node.
     * parameters:
     * @query_interface_selection: selection of the div where the query graph will be initialized
     * @reactor: reactor with events to be listened/subscribed
     * @returns: Nothing*/

    var QG = this;

    /* Loads the config file */
    QG.config = json_config.QUERY_SYSTEM;

    /* Binds events to the reactor */
    QG.reactor = reactor;
    QG.reactor.addEventListener('update_graph', this.updateGraph.bind(this));
    QG.reactor.addEventListener('constraint_added', this.getElement.bind(this));
    QG.reactor.addEventListener('outcome_added', this.getGraph.bind(this));
    QG.reactor.addEventListener('global_added', this.getGraph.bind(this));
    QG.reactor.addEventListener('matching_changed', this.changeMatching.bind(this));

    /* Initial settings for the aspect and svg-related stuff */
    QG.height = QG.config.svgHeight;
    QG.width = QG.config.svgWidth;
    QG.aspect = [0, 0, QG.width, QG.height];

    /* Variables to adjust the tiles */
    QG.horizontal_fixed_points = 1;
    QG.vertical_fixed_points = 1;
    QG.levels = [];

    /* Array containing selected nodes */
    QG.selectedSvgID = [];

    /* Initializes the query graph model */
    QG.idct = 0;
    QG.graph = {};
    QG.graph.nodes = [];
    QG.graph.edges = [];
    QG.graph.future_nodes = 0;
    QG.graph.prediction_attr = "None";
    QG.graph.id_attr = "None";
    QG.graph.outcome_key_op_value = [];
    QG.graph.outcome_display_value = [];
    QG.graph.global_key_op_value = [];
    QG.graph.global_display_value = [];
    QG.graph.matching = QG.config.matchingDefault();

    /* Initializes the svg */
    QG.svg = query_interface_selection.append("svg")
        .attr("viewBox", QG.aspect[0] + " " + QG.aspect[1] + " " + QG.aspect[2] + " " + QG.aspect[3])
        .attr("preserveAspectRatio", "xMinYMin meet"); // svg

    QG.svgG = QG.svg.append("g").classed(QG.config.graphClass, true);   // graph
    QG.svgG.append("g").classed(QG.config.nodesClass, true);            // nodes
    QG.svgG.append("g").classed(QG.config.innerTextNodeClass, true);    // node text
    QG.svgG.append("g").classed(QG.config.outerTextNodeClass, true);    // node constraint text
    QG.svgG.append("g").classed(QG.config.edgesClass, true);            // edges
    QG.svgG.append("g").classed(QG.config.innerTextEdgeClass, true);    // edge text
    QG.svgG.append("g").classed(QG.config.outerTextEdgeClass, true);    // edge constraint text

    // TODO: this is for testing only
    d3.select(window).on("keydown", function () {
        if (d3.event.shiftKey) {
            QG.svgKeyDown.call(QG);
        }
    });

    QG.addNode();                                                       // Initializes root node
    QG.updateGraph();                                                   // Initializes graph
}

GC.prototype.distributeNodes = function () {
    /* This method distributes the nodes in the svg. It gets the horizontal_fixed_points and the vertical_fixed_points
     using the levels variable, and then positions all the nodes on its respective tick.
     parameters: none
     @return: nothing */

    var QG = this;
    QG.horizontal_fixed_points = QG.levels.length;
    QG.vertical_fixed_points = Math.max.apply(null, QG.levels);
    var nodes_level = utils.getNodesByLevel(QG.graph.nodes);
    var ticks = utils.getTicks(QG.width, QG.height, QG.horizontal_fixed_points, QG.vertical_fixed_points);

    for (var level = 0; level < QG.horizontal_fixed_points; level++) {
        var nodes_to_distribute = nodes_level[level];
        var start_position = Math.floor((QG.vertical_fixed_points - nodes_to_distribute.length) / 2);
        for (var pos = start_position; pos < QG.vertical_fixed_points; pos++) {
            if (nodes_to_distribute.length == 0)
                break;
            var tick = ticks[[level, pos]];
            var node = nodes_to_distribute.pop();

            console.log(">> distribute")

            console.log("node.id", node.id, "QG.idct", QG.idct);
            console.log("@before ", node.x, node.y, "next:", tick.x, tick.y);

            node.oldx = node.id >= QG.idct - 1 ? tick.x : node.x;
            node.oldy = node.id >= QG.idct - 1 ? tick.y : node.y;
            node.x = tick.x;
            node.y = tick.y;

            console.log("@after", node.x, node.y, "old:", node.oldx, node.oldy);
            console.log("@change", node.oldx - node.x, node.oldy - node.y);

        }
    }
};

GC.prototype.addNode = function (parent, coordinates) {
    /* This method creates a node given a parent & a set of coordinates. It can be done without parents or coordinates.
     It also handles the increase of the level.
     parameters:
     @parent:  parent node
     @coordinates: [x, y] array
     @return: recently created node */

    var QG = this;
    QG.idct += 1;                                                                           // Increases index
    coordinates = ((coordinates == undefined) ? [0, 0] : coordinates);                      // Get coordinate values
    var node = new utils.Node(coordinates, QG.idct, parent);                                // Create node
    if (parent != undefined) QG.addEdge(parent, node, "directed");                          // Add edges
    QG.graph.nodes.push(node);                                                              // Internal book keeping
    if (node.level == QG.levels.length) QG.levels.push(1); else QG.levels[node.level]++;    // Pushes node to level
    return node;
};

GC.prototype.nodeMouseDown = function (svg_element) {
    /* This method marks every selected node as having the selected class if it is not selected, and as not having the
     selected class if the node is selected
     parameters:
     @svg_element svg_element corresponding to the node
     @return: nothing */

    var QG = this;
    d3.event.stopPropagation();
    var node = d3.select(svg_element);
    if (node.classed(QG.config.selectedClass) == true) node.classed(QG.config.selectedClass, false);
    else node.classed(QG.config.selectedClass, true);
};

GC.prototype.animateNodes = function () {

    console.log("asdasd")
    var QG = this;

    var nodes = QG.svg
            .select("g." + QG.config.nodesClass)
            .selectAll("g." + QG.config.nodeClass),
        data = QG.graph.nodes,
        radius = utils.getNodeRadius(QG.levels, QG.width, QG.height, QG.config.nodeRadius);

    var aux = nodes
        .data(data, function (d) {
            return d.id;
        })
        .enter()
        .append("g")
        .classed(QG.config.nodeClass, true)
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    /* Main Circle */
    aux.append("circle")
        .attr("r", String(radius))
        .attr("z-index", 1)
        .classed(QG.config.mainCircleClass, true)
        .on("mousedown", function (d) {
            d3.event.stopPropagation();
            QG.nodeMouseDown(this)
        })
        .transition()
        .duration(300)
        .attr("r", function (d) {
            return String(radius);
        });

    /* Add Button */
    aux.append("circle")
        .attr("transform", function (d) {
            return "translate(" + String(radius) + "," + 0 + ")";
        })
        .attr("r", 0)
        .attr("z-index", 2)
        .classed(QG.config.addButtonClass, true)
        .on("mousedown", function (d) {
            d3.event.stopPropagation();
            QG.nodeMouseDown(this)
        }).transition()
        .duration(300)
        .attr("r", function (d) {
            return String(radius) / 3;
        });
    /* Remove Button */
    aux.append("circle")
        .attr("transform", function (d) {
            return "translate(" + String(-radius) + "," + 0 + ")";
        })
        .attr("r", String(radius) / 3)
        .attr("z-index", 2)
        .classed(QG.config.removeButtonClass, true)
        .on("mousedown", function (d) {
            d3.event.stopPropagation();
            QG.nodeMouseDown(this)
        });

    // - update
    nodes.data(data, function (d) {
        return d.id;
    })
        .transition()
        .delay(150)
        .attr("transform", function (node) {
            return "translate(" + node.x + "," + node.y + ")";
        });


    d3.selectAll("." + QG.config.mainCircleClass)
        .transition()
        .attr("r", function (d) {
            console.log(d);
            return String(radius);
        });

    if (QG.graph.previous_radius != undefined && QG.graph.previous_radius != radius) {
        d3.selectAll("." + QG.config.addButtonClass)
            .transition()
            .delay(150)
            .attr("r", String(radius) / 3)
            .attr("transform", function (node) {
                return "translate(" + radius + "," + 0 + ")";
            });

        d3.selectAll("." + QG.config.removeButtonClass)
            .transition()
            .delay(150)
            .attr("r", String(radius) / 3)
            .attr("transform", function (node) {
                return "translate(" + (-radius) + "," + 0 + ")";
            });
    }
    // - exit
    nodes.data(data, function (d) {
        return d.id;
    })
        .exit()
        .remove();

    QG.graph.previous_radius = radius;


};

//
// /* Add Button */
// var add_button = aux.append("circle")
//     .attr("transform", function (d) {
//         return "translate(" + String(radius) + "," + 0 + ")";
//     })
//     .attr("r", 0)
//     .attr("z-index", 2)
//     .classed(QG.config.addButtonClass, true)
//     .on("mousedown", function (d) {
//         d3.event.stopPropagation();
//         QG.nodeMouseDown(this)
//     });

// add_button.transition()
//     .duration(500)
//     .attr("r", function (d) {
//         console.log(d);
//         return String(radius)/3;
//     });

//
// /* Remove Button */
// var remove_button = aux.append("circle")
//     .attr("transform", function (d) {
//         return "translate(" + String(-radius) + "," + 0 + ")";
//     })
//     .attr("r", 0)
//     .attr("z-index", 2)
//     .classed(QG.config.addButtonClass, true)
//     .on("mousedown", function (d) {
//         d3.event.stopPropagation();
//         QG.nodeMouseDown(this)
//     });
// remove_button.transition()
//     .duration(500)
//     .attr("r", function (d) {
//         console.log(d);
//         return String(radius)/3;
//     });

GC.prototype.addEdge = function (src, dst, kind) {
    /* This method receives two nodes, src and dst, and the kind of edge and creates an edge between the two.
     parameters:
     @src: node of origin
     @dst: node of destination
     @kind: type of edge  */

    var QG = this;
    var edge = new utils.Edge(src, dst, QG.idct, kind);
    QG.graph.edges.push(edge);
    QG.idct += 1;
};


// TODO: simple in-edge time/hop editing
GC.prototype.edgeMouseDown = function (svg_element) {
    var QG = this;
    d3.event.stopPropagation();
};


GC.prototype.svgKeyDown = function () {

    var QG = this;

    var selected = d3.select(".selected").data()[0];
    var sel_id = selected.id;


    switch (d3.event.keyCode) {

        case QG.config.delete:
            //
            //// Doesn't let you delete the root
            //if (selected.level == 0) break;
            //
            //// Gets node to be removed
            //var removed = utils.getNodeById(QG.graph.nodes, sel_id);
            //
            //// Gets descendants of the node to be removed
            //var descendants = utils.getDescendantsID(QG.nodes, removed);
            //
            //// Remove all descendants
            //QG.graph.nodes = QG.graph.nodes.filter(function (node) {
            //    return !node.id in descendants;
            //});
            //
            //// Remove all edges involving descendants
            //QG.graph.edges = QG.graph.edges.filter(function (edge) {
            //    return (!edge.src.id in descendants) && (!edge.dst.id in descendants);
            //});


            QG.updateGraph();
            break;

        case QG.config.create:
            var parent = utils.getNodeById(QG.graph.nodes, sel_id);
            QG.addNode(parent);
            QG.updateGraph();


            break;

    }
};


GC.prototype.updateGraph = function () {

    var QG = this;

    QG.distributeNodes();

    QG.animateNodes();


    // -- InText/Nodes--
    var text = QG.svg
        .select("g." + QG.config.innerTextNodeClass)
        .selectAll("text");
    var data = QG.graph.nodes;
    // -- enter
    var aux = text.data(data, function (d) {
        return d.name;
    }).enter()
        .append("text")
        .attr("x", function (d) {
            return d.x
        })
        .attr("y", function (d) {
            return d.y
        })
        .attr("text-anchor", "middle")
        .text(function (d) {
            return ' '//'#' + String(d.id);
        });
    // -- update
    text.data(data, function (d) {
        return d.name;
    }).attr("x", function (d) {
        return d.x
    }).attr("y", function (d) {
        return d.y
    }).text(function (d) {
        return ' '//'#' + String(d.id);
    });
    // -- exit
    text.data(data, function (d) {
        return d.name;
    }).exit()
        .remove();

    // -- OutText/Nodes --
    var text = QG.svg
        .select("g." + QG.config.outerTextNodeClass)
        .selectAll("text");
    var data = QG.graph.nodes;
    // -- enter
    var aux = text.data(data, function (d) {
        return d.name;
    }).enter()
        .append("text")
        .attr("x", function (d) {
            return d.x
        })
        .attr("y", function (d) {
            return d.y
        })
        .attr("text-anchor", "middle");

    // -- update
    var aux = text.data(data, function (d) {
        return d.name;
    }).attr("x", function (d) {
        return d.x
    })
        .attr("y", function (d) {
            return d.y + 50
        })
        .html(function (d) {
            var string = "";
            var x = d.x;
            d.key_op_value.forEach(function (d) {
                string += "<tspan x=" + x + " dy=\"1.2em\">" + d[0] + d[1] + d[2] + "<\/tspan>";
            });
            return string;
        });
    // -- exit
    text.data(data, function (d) {
        return d.name;
    }).exit()
        .remove();

    // -- Edges --
    var edges = QG.svg
        .select("g." + QG.config.edgesClass)
        .selectAll("g." + QG.config.edgeClass);
    var data = QG.graph.edges;
    // - enter
    var aux = edges.data(data, function (d) {
        return d.name;
    }).enter()
        .append("g")
        .classed(QG.config.edgeClass, true)
        .on("mousedown", function (d) {
            QG.edgeMouseDown(this)
        });
    aux.append("path")
        .style('marker-end', function (d) {
            if (d.kind == "directed") {
                return 'url(#end-arrow)'
            }
            else return 'none';
        })
        .attr("d", function (d) {
            return utils.calcEdgePath(d, QG.config.nodeRadius);
        })
        .classed("link", true);
    // - update
    edges.data(data, function (d) {
        return d.name;
    })
        .selectAll("path")
        .attr("d", function (d) {
            return utils.calcEdgePath(d, QG.config.nodeRadius);
        });
    // - exit
    edges.data(data, function (d) {
        return d.name;
    })
        .exit()
        .remove();

    // -- OutText/Edges --
    var text = QG.svg
        .select("g." + QG.config.outerTextEdgeClass)
        .selectAll("text");
    var data = QG.graph.edges;
    var modifier = 15;
    // -- enter
    var aux = text.data(data, function (d) {
        return d.name;
    }).enter()
        .append("text")
        .attr("x", function (d) {
            return utils.calcTextEdgePath(d, QG.config.nodeRadius, modifier)[0];
        })
        .attr("y", function (d) {
            return utils.calcTextEdgePath(d, QG.config.nodeRadius, modifier)[1];
        })
        .attr("text-anchor", "middle");

    // -- update
    var aux = text.data(data, function (d) {
        return d.name;
    }).attr("x", function (d) {
        return utils.calcTextEdgePath(d, QG.config.nodeRadius, modifier)[0];
    })
        .attr("y", function (d) {
            return utils.calcTextEdgePath(d, QG.config.nodeRadius, modifier)[1];
        })
        .html(function (d) {
            var string = "";
            var x = utils.calcTextEdgePath(d, QG.config.nodeRadius, modifier)[0].toString();
            d.key_op_value.forEach(function (d) {
                string += "<tspan x=" + x + " dy=\"1.2em\">" + d[0] + d[1] + d[2] + "<\/tspan>";
            });
            return string;
        });
    // -- exit
    text.data(data, function (d) {
        return d.name;
    }).exit()
        .remove();
};

GC.prototype.getGraph = function () {
    var QG = this;
    return QG.graph;
};

GC.prototype.getElement = function () {
    var element = d3.select(".selected").data()[0];
    return element;
};

GC.prototype.changeMatching = function (new_matching) {
    var QG = this;
    this.graph.matching = new_matching;
};

module.exports = GC;
