import { serviceURL } from "./constant.js";

function removeLastOccurrence(str, substring) {
    const index = str.lastIndexOf(substring);
    return index === -1
        ? str
        : str.slice(0, index) + str.slice(index + substring.length);
}

function endpointSelection(endpoint) {
    let targetEndpoint = '';
    switch (endpoint) {
        case 'circles':
            targetEndpoint = 'divisions';
            return targetEndpoint;
        case 'divisions':
            targetEndpoint = 'sub_divisions';
            return targetEndpoint;
        case 'sub_divisions':
            targetEndpoint = 'stations';
            return targetEndpoint;
        case 'stations':
            targetEndpoint = 'feeders';
            return targetEndpoint;
        // case 'feeders':
        //     targetEndpoint = 'layers';
        //     return targetEndpoint;
        case 'feeders':
            targetEndpoint = 'HTLayers';
            return targetEndpoint;

        default:
            console.log("Invalid Endpoint");
            break;
    }
}


function buildTree(data, parentElement) {

    data.forEach(item => {

        const li = document.createElement("li");

        const label = document.createElement("span");
        label.textContent =
            item.division_name ||
            item.sub_division_name ||
            item.station_name ||
            item.feeder_name ||
            item.conductor_name;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";

        li.appendChild(checkbox);
        li.appendChild(label);

        parentElement.appendChild(li);

        // detect child arrays
        const children =
            item.subdivisions ||
            item.stations ||
            item.feeders ||
            item.layers;

        if (children && children.length > 0) {

            const ul = document.createElement("ul");
            li.appendChild(ul);

            buildTree(children, ul);
        }

    });

}
// const treeContainer = document.getElementById("tree");

// buildTree(response.divisions, treeContainer);

async function handleCheckboxChange(e, FeatureLayer, activeLayers, map, view) {
    const checkbox = e.target;
    const layerId = checkbox.dataset.id || null;
    const serviceUrl = serviceURL;

    if (checkbox.classList.contains("parent-checkbox")) {
        // console.log("target", e.target);

        // find all child checkboxes inside this parent group
        const container = checkbox.closest('.parent-li-circle');
        // console.log('container', container);

        const childrenBtn = container.querySelectorAll('Button.toggle');
        console.log('childrenBtn', childrenBtn);

        childrenBtn.forEach(btn => {
            // btn.click();
            // alert("Child button clicked");
            // btn.textContent = "+";
            // btn.setAttribute("aria-expanded", "false");
        });
        
        const children = container.querySelectorAll('input[type="checkbox"]');
        // console.log('children', children);

        children.forEach(cb => {
            cb.checked = checkbox.checked;
            // console.log('cb', cb);
            // cb.dispatchEvent(new Event('change')); // Trigger change event for each child checkbox       
        });

    };

    // if (!checkbox.classList.contains("LayerOnOff") || !layerId) return;

    if (checkbox.checked) {
        const circleId = checkbox.classList[0].at(7);
        // console.log(checkbox.classList[0].at(7));

        let definExpression = '1=1'; // Default expression to show all features
        if (checkbox.classList.contains("LayerOnOff")) {
            definExpression = `HTSectionLayer_id = ${layerId}`; // Filter features where LayerID matches the checkbox's data-id
        } else if (checkbox.classList.contains("parent-checkbox")) {
            definExpression = `circle_id = ${circleId}`; // Assuming child features have a field like "circle_id" that matches the parent checkbox's data-id

            let url = `http://localhost:3000/api/circle-hierarchy/${circleId}`;
            const res = await fetch(url);
            const data = await res.json();
            console.log(data);


            const childUL = document.createElement("ul");
            childUL.classList.add("tree-children");
            data.divisions.forEach(dt => {
                const idValue = dt[`division_id`];
                const nameValue = dt[`division_name`];
                const layerId = dt[`HTSectionLayer_id`];  
                console.log(dt);
                  
                // const newLi = document.createElement("li");
                // newLi.classList.add(`parent-li-circle parent-li-circle-${id}`);
                // newLi.innerHTML = generateNewLiHTML(endpoint, TargetEndpoint, idValue, layerId, nameValue);
                // childUL.appendChild(newLi);
            });
            // li.appendChild(childUL);
            childUL.style.display = "block";

        }

        console.log("Definition Expression: ", definExpression);

        // Create layer with filter based on layerId
        // Assuming your layer has a field that stores the layer ID
        // Common field names: "LayerID", "LAYER_ID", "Category", "Type", etc.
        const layer = new FeatureLayer({
            url: serviceUrl,

            // // Common problematic fields:
            // // Blob, Raster, Geometry, XML, Object
            // // If these exist, '*' may fail.
            // outFields: ['*'], // Specifying all fields

            // Specify fields to return in popups  
            outFields: [
                "HTSectionLayer_id",
                "section_id",
                "feeder_id"
            ],
            definitionExpression: definExpression, // FILTER BY LAYER ID
            title: `Layer ${layerId}`,
            visible: true,
            resultRecordCount: 6000,  // Match your max expected records
            maxRecordCountFactor: 3,   // Allow multiple requests if needed
            // popup
            popupTemplate: {
                title: `Features from Layer ${layerId}`,
                content: [{
                    type: 'fields',
                    fieldInfos: [
                        { fieldName: "HTSectionLayer_id", label: "layerID" },
                        { fieldName: "section_id", label: "sectionID" },
                        { fieldName: "feeder_id", label: "feederID" },
                    ]
                }]
            }

        });

        //   console.log(layer);


        // Wait for layer to load before adding
        await layer.load();
        //   console.log(`Layer ${layerId} loaded successfully`);

        // Store reference
        activeLayers[layerId] = layer;

        // Add to map
        map.add(layer);

        //  console.log(`Layer ${layerId} added to map`);

        //  console.log(`Layer ${layerId} added with filter: LayerID = '${layerId}'`);
        //  console.log("Feature count:", layer.sourceJSON?.features?.length || "Loading...");

        //  Optional: Zoom to layer extent when added
        //  console.log(await layer.queryExtent());
        layer.when(() => {
            const query = layer.createQuery();
            query.returnExtentOnly = true;
            layer.queryExtent(query).then((result) => {
                // console.log("Query Extent Result:", result);
                if (result.extent) {
                    view.goTo(result.extent);
                } else {
                    console.log("No features found for this filter");
                }
            }).catch((error) => {
                console.log("Query Extent Error:", error);
            });
        });

        //  console.log('Checkbox is checked');
        //  console.log(layer);
        //  console.log("layerId: ", layerId);
        //  console.log(geom);  

    } else if (layerId) {
        // Remove layer using stored reference
        if (activeLayers[layerId]) {
            map.remove(activeLayers[layerId]);
            delete activeLayers[layerId]; // Clean up reference
            console.log(`Layer ${layerId} removed from map`);
        }

        // map.remove(layer);
        console.log('Checkbox is unchecked');
    } else if (checkbox.classList.contains("parent-checkbox")) {
        // Handle parent checkbox uncheck - remove all child layers
        const container = checkbox.closest('.parent-li-circle');
        const children = container.querySelectorAll('input[type="checkbox"]');
        children.forEach(cb => {
            const childLayerId = cb.dataset.id;
            if (activeLayers[childLayerId]) {
                map.remove(activeLayers[childLayerId]);
                delete activeLayers[childLayerId];
            }
        });
    }
}


function generateNewLiHTML(endpoint, TargetEndpoint, idValue, layerId, nameValue) {

    let newLiHTML = '';

    if (endpoint == 'circles') {
        newLiHTML = `
            <button 
                class="toggle togglebtn togglebtn-circles"
                data-endpoint="${TargetEndpoint}"
                data-id="${idValue}"
                aria-expanded="false"
            >+</button>
            <input 
                type="checkbox" 
                class="circle-${idValue} circle parent-checkbox"
                data-id="${layerId}"
                style="Display: none;"
            >
            <span class="node-label">${nameValue}</span>
        `;
    } else if (endpoint == 'HTLayers') {
        newLiHTML = `
            <input 
                type="checkbox" 
                class="LayerOnOff"
                data-id="${layerId}"
            >
            <span class="node-label">${nameValue}</span>
        `;
    } else {
        newLiHTML = `
            <button 
                class="toggle togglebtn"
                data-endpoint="${TargetEndpoint}"
                data-id="${idValue}"
                aria-expanded="false"
            >+</button>
            <input 
                type="checkbox" 
                class=""
                data-id="${layerId}"
            >
            <span class="node-label">${nameValue}</span>
        `;
    }

    return newLiHTML;
}

async function handleExpandButtonClick(e) {

    const toggleBtn = e.target;
    const id = toggleBtn.dataset.id;
    const cirlce_checkbox = document.querySelector(`.circle-${id}`);

    if (!toggleBtn.classList.contains("togglebtn")) return;

    if (toggleBtn.classList.contains("togglebtn-circles")) {
        // console.log('id: ', id);
        // console.log('`circle-${id}`: ', `circle-${id}`);
        // const cirlce_checkbox = document.querySelector(`LayerOnOff`);
        // console.log('cirlce_checkbox: ', cirlce_checkbox);
        cirlce_checkbox.style.display = 'inline';
    };

    const li = toggleBtn.closest("li");

    const expanded = toggleBtn.getAttribute("aria-expanded") === "true";

    // Collapse
    if (expanded) {
        if (toggleBtn.classList.contains("togglebtn-circles")) {
            cirlce_checkbox.style.display = 'none';
        }

        toggleBtn.textContent = "+";
        toggleBtn.setAttribute("aria-expanded", "false");

        const childUL = li.querySelector("ul");
        if (childUL) childUL.style.display = "none";
        return;
    }

    // Expand
    toggleBtn.textContent = "-";
    toggleBtn.setAttribute("aria-expanded", "true");

    let existingUL = li.querySelector("ul");
    if (existingUL) {
        existingUL.style.display = "block";
        return;
    }

    try {

        const endpoint = toggleBtn.dataset.endpoint;
        // console.log("endpoint: ", endpoint);

        const TargetEndpoint = endpointSelection(endpoint);
        // console.log("TargetEndpoint: ", TargetEndpoint);

        const parentId = toggleBtn.dataset.id || null;

        
        let url = `http://localhost:3000/api/${endpoint}`;
        if (parentId) {
            url += `/${parentId}`;
        }
        // console.log("url: ", url);

        const res = await fetch(url);
        const data = await res.json();



        const childUL = document.createElement("ul");
        childUL.classList.add("tree-children");

        data.forEach((dt, i) => {

            const key = removeLastOccurrence(endpoint, 's');

            let layerId = '';
            let idValue = '';
            let nameValue = '';
            let feederID = '';
            let geom = {};
            let geomText = '';
            let colorCode = '';
            let conductorName = '';


            if (endpoint == "HTLayers") {
                layerId = dt[`HTSectionLayer_id`];
                nameValue = dt[`section_id`];
                feederID = dt['feeder_id'];
                geom = dt['geom'];
                geomText = dt[`geom_text`];
                colorCode = dt[`color_code`];
                conductorName = dt[`conductor_name`];
            } else {
                idValue = dt[`${key}_id`];
                nameValue = dt[`${key}_name`];
            }

            const newLi = document.createElement("li");
            
            // console.log(i,);
            newLi.classList.add(`parent-li-circle`, `parent-li-circle-${i+1}`);

            newLi.innerHTML = generateNewLiHTML(endpoint, TargetEndpoint, idValue, layerId, nameValue);

            childUL.appendChild(newLi);
        });

        li.appendChild(childUL);
        childUL.style.display = "block";

    } catch (err) {
        console.error("Error loading data:", err);
    }
}

export {
    handleCheckboxChange,
    handleExpandButtonClick,
}